#!/usr/bin/env python3
"""
scout.py — the data scout: Claude looks on official sites for pump prices we do not yet have (config/scout.yaml).

Nothing it finds goes live by itself:
  1. Claude searches and reads only the listed official sites, and proposes each price with the notice's URL and
     the exact words it read the price from.
  2. This code opens the notice again itself and checks that those words are in it and contain the price; a price
     that is not in its own quote is dropped. Big jumps from the month before and clashes with values we already
     have are flagged.
  3. The organiser approves or rejects each proposal in /admin. Approved rows go to
     data/shared/official_item_prices_curated.csv, like values typed by hand.
A country is looked at when it lacks the current month and was not looked at in the past 7 days, so a run costs
little when nothing is due.

    python src/ai/scout.py [--country rwanda] [--force]
"""
from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
import sys
import tempfile
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse

import pandas as pd
import yaml

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src" / "market"))
sys.path.insert(0, str(ROOT / "src" / "ai"))

import claude                                            # noqa: E402
from reports import Participants                         # noqa: E402

CONFIG = ROOT / "config" / "scout.yaml"
OFFICIAL = ROOT / "data" / "shared" / "official_item_prices.csv"
CURATED = ROOT / "data" / "shared" / "official_item_prices_curated.csv"
STATE = ROOT / "data" / "live" / "scout_state.json"
DB = ROOT / "data" / "live" / "exchange.sqlite"
LOOKBACK = 24            # months of history to fill: a forecast needs 12 months of notices before it replaces the proxy
MAX_TURNS = 25
BIG_CHANGE = 0.35        # flag a price more than 35% away from the month before

SYSTEM = """You find official retail prices of construction inputs for CiO Costs, a site that forecasts construction \
costs in Africa. Accuracy matters more than coverage.

- Propose a price only when you have read it yourself in an official notice on the allowed sites.
- Copy the quote exactly as it appears in the notice, with the figure, so a person can find it with search. Keep it \
short: the row or sentence that gives the price.
- Never estimate, convert, round, average or infer a price. If a notice gives prices for several places, use the \
one asked for. If you cannot find a notice for a month, skip that month.
- The month is the month the price applies to, not the month the notice was published, unless they are the same.

Call propose_price once for each item and month you found. When you are done, call finish with a short note of what \
you found and what you could not find."""


def config() -> dict:
    return yaml.safe_load(CONFIG.read_text())["countries"]


def known(country: str) -> pd.DataFrame:
    """Prices we already have for a country: official file plus curated rows not yet merged into it."""
    frames = [pd.read_csv(f) for f in (OFFICIAL, CURATED) if f.exists()]
    df = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame(columns=["country", "item", "month", "price"])
    df = df[df.country == country][["item", "month", "price"]].copy()
    df["month"] = df.month.astype(str).str[:7]
    return df.drop_duplicates(["item", "month"], keep="last")


def months_back(n: int, today: date | None = None) -> list[str]:
    t = (today or date.today()).replace(day=1)
    out = []
    for _ in range(n):
        out.append(t.strftime("%Y-%m"))
        t = (t - timedelta(days=1)).replace(day=1)
    return out


def missing(country: str, cfg: dict, today: date | None = None) -> dict[str, list[str]]:
    have = known(country)
    want = months_back(LOOKBACK, today)
    return {item: [m for m in want if not ((have.item == item) & (have.month == m)).any()] for item in cfg["items"]}


def due(country: str, cfg: dict, state: dict, today: date | None = None) -> bool:
    today = today or date.today()
    last = state.get(country)
    if last and (today - date.fromisoformat(last)).days < 7:
        return False
    return any(today.strftime("%Y-%m") in ms for ms in missing(country, cfg, today).values())


# ------------------------------------------------------------------ checks done by code, not by the model --
def _norm(t: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(t)).strip().lower()


def _numbers(t: str) -> list[float]:
    """Every number in a text, read both plainly (2205) and with thousands separators (2,205 or 2 205)."""
    plain = re.findall(r"\d+(?:\.\d+)?", t)
    grouped = [re.sub(r"[, ]", "", x) for x in re.findall(r"\d{1,3}(?:[, ]\d{3})+(?:\.\d+)?", t)]
    return [float(x) for x in plain + grouped]


def fetch_text(url: str) -> str | None:
    """The notice as plain text: PDFs through pdftotext, web pages with the tags removed."""
    with tempfile.TemporaryDirectory() as tmp:
        f = Path(tmp) / "doc"
        r = subprocess.run(["curl", "-sSfL", "-m", "60", "-o", str(f), url], capture_output=True)
        if r.returncode != 0 or not f.exists():
            return None
        raw = f.read_bytes()
        if raw[:4] == b"%PDF":
            return subprocess.run(["pdftotext", "-layout", str(f), "-"], capture_output=True, text=True,
                                  stdin=subprocess.DEVNULL).stdout or None
        t = raw.decode("utf-8", "replace")
        t = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", t)
        return re.sub(r"<[^>]+>", " ", t)


def on_site(url: str, sites: list[str]) -> bool:
    h = (urlparse(url).hostname or "").lower()
    return urlparse(url).scheme in ("http", "https") and any(h == s or h.endswith("." + s) for s in sites)


def check(p: dict, cfg: dict, have: pd.DataFrame, fetch=fetch_text) -> tuple[bool, list[str]]:
    """(keep, notes) for one proposal. Dropped: off the allowed sites, or a price that is not in its own quote."""
    if not on_site(p["source_url"], cfg["sites"]):
        return False, ["not on an allowed site"]
    if not any(abs(v - p["price"]) < 0.005 for v in _numbers(p["quote"])):
        return False, ["the price is not in the quote"]
    notes = []
    text = fetch(p["source_url"])
    if text is None:
        notes.append("could not open the notice to check: check it by hand")
    else:
        q, t = _norm(p["quote"]), _norm(text)
        if q in t or q.replace(" ", "") in t.replace(" ", ""):
            notes.append("quote found in the notice")
        else:
            notes.append("quote NOT found in the notice as written: check it by hand")
    same = have[(have.item == p["item"]) & (have.month == p["month"])]
    if len(same):
        v = float(same.price.iloc[0])
        if abs(v - p["price"]) < 0.005:
            return False, ["already have this value"]
        notes.append(f"we already have {v:g} for this month: approving replaces it")
    before = have[(have.item == p["item"]) & (have.month < p["month"])].sort_values("month")
    if len(before):
        v, m = float(before.price.iloc[-1]), before.month.iloc[-1]
        if v > 0 and abs(p["price"] / v - 1) > BIG_CHANGE:
            notes.append(f"big change: {p['price'] / v - 1:+.0%} from {v:g} in {m}")
    return True, notes


# ------------------------------------------------------------------------------------------- the agent --
def tools(cfg: dict) -> list[dict]:
    return [
        {"type": "web_search_20260209", "name": "web_search", "max_uses": 8, "allowed_domains": cfg["sites"]},
        {"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": 20, "allowed_domains": cfg["sites"],
         "max_content_tokens": 40000},
        {"name": "propose_price", "strict": True,
         "description": "Record one official price you read in a notice: one call per item and month.",
         "input_schema": {"type": "object", "additionalProperties": False,
                          "required": ["item", "month", "price", "source_url", "quote"],
                          "properties": {
                              "item": {"type": "string", "enum": list(cfg["items"])},
                              "month": {"type": "string", "description": "YYYY-MM: the month the price applies to"},
                              "price": {"type": "number", "description": f"in {cfg['unit']}, exactly as published"},
                              "source_url": {"type": "string", "description": "URL of the notice you read it in"},
                              "quote": {"type": "string", "description": "the exact words and figure from the notice"}}}},
        {"name": "finish", "strict": True, "description": "Call once, when you are done.",
         "input_schema": {"type": "object", "additionalProperties": False, "required": ["note"],
                          "properties": {"note": {"type": "string"}}}},
    ]


def prompt(country: str, cfg: dict, gaps: dict[str, list[str]], have: pd.DataFrame) -> str:
    items = "\n".join(f"- {k}: {v}" for k, v in cfg["items"].items())
    wanted = "\n".join(f"- {k}: {', '.join(ms[:LOOKBACK])}" for k, ms in gaps.items() if ms) or "- none"
    recent = have.sort_values("month").groupby("item").tail(3)
    rec = "\n".join(f"- {r.item} {r.month}: {r.price:g}" for r in recent.itertuples()) or "- none yet"
    return f"""Country: {country.replace('_', ' ').title()}
Official source: {cfg['office']} ({', '.join(cfg['sites'])}). {cfg['how_often']}.
Price wanted: {cfg['where']}, in {cfg['unit']}.

Items:
{items}

Months we are missing, newest first (a price set part-way through a month applies from that month):
{wanted}

Values we already have, for reference (do not propose these again):
{rec}

Start with the most recent months."""


def run_country(country: str, cfg: dict, db: Participants, cl=None, fetch=fetch_text, today: date | None = None) -> dict:
    """One scout run for one country. Returns counts and Claude's closing note."""
    have = known(country)
    gaps = missing(country, cfg, today)
    if db.ai_spend() >= claude.MONTHLY_USD:
        return {"country": country, "skipped": "monthly spending cap reached"}
    cl = cl or claude.client()
    msgs = [{"role": "user", "content": prompt(country, cfg, gaps, have)}]
    found, dropped, note, usd = 0, 0, "", 0.0
    for _ in range(MAX_TURNS):
        r = claude.create(cl, system=SYSTEM, messages=msgs, tools=tools(cfg), max_tokens=16000)
        usd += claude.cost(r.usage)
        msgs.append({"role": "assistant", "content": r.content})
        if r.stop_reason == "refusal":
            note = "declined by the model"
            break
        if r.stop_reason == "pause_turn":          # long server-side search: send it back to carry on
            continue
        calls = [b for b in r.content if b.type == "tool_use"]
        if not calls:
            break
        results, done = [], False
        for b in calls:
            inp = b.input if isinstance(b.input, dict) else json.loads(b.input)
            if b.name == "finish":
                note, done = str(inp.get("note", "")), True
                results.append({"type": "tool_result", "tool_use_id": b.id, "content": "ok"})
                continue
            if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", str(inp.get("month", ""))):
                results.append({"type": "tool_result", "tool_use_id": b.id, "is_error": True,
                                "content": "month must be YYYY-MM"})
                continue
            p = {**inp, "price": float(inp["price"])}
            keep, notes = check(p, cfg, have, fetch)
            if keep and db.add_proposal(country, p["item"], p["month"], p["price"], cfg["unit"], p["source_url"],
                                        p["quote"], "; ".join(notes)):
                found += 1
                msg = "recorded for review"
            else:
                dropped += 1
                msg = "not recorded: " + "; ".join(notes)
            results.append({"type": "tool_result", "tool_use_id": b.id, "content": msg})
        msgs.append({"role": "user", "content": results})
        if done:
            break
    db.log_ai("scout", "scout", round(usd, 4), country)
    return {"country": country, "proposed": found, "dropped": dropped, "usd": round(usd, 2), "note": note}


def main(argv=None) -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--country")
    ap.add_argument("--force", action="store_true", help="look even when nothing is due")
    a = ap.parse_args(argv)
    if not claude.enabled():
        print("data scout: off (no ANTHROPIC_API_KEY)")
        return
    cfgs = config()
    state = json.loads(STATE.read_text()) if STATE.exists() else {}
    with Participants(DB) as db:
        for c, cfg in cfgs.items():
            if a.country and c != a.country:
                continue
            if not (a.force or due(c, cfg, state)):
                print(f"data scout: {c} up to date or looked at this week")
                continue
            try:
                out = run_country(c, cfg, db)
            except claude.AIError as err:
                out = {"country": c, "error": str(err)}
            state[c] = date.today().isoformat()
            print("data scout:", json.dumps(out))
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(state, indent=1))


def approve_to_curated(p: dict) -> None:
    """Write an approved proposal to the curated file (replacing any value for that item-month)."""
    cols = ["country", "item", "month", "price", "unit", "source", "checked"]
    cur = pd.read_csv(CURATED) if CURATED.exists() else pd.DataFrame(columns=cols)
    if "checked" not in cur:
        cur["checked"] = "typed from the official notice"
    cur = cur[~((cur.country == p["country"]) & (cur.item == p["item"]) & (cur.month.astype(str) == p["month"]))]
    row = {"country": p["country"], "item": p["item"], "month": p["month"], "price": p["price"], "unit": p["unit"],
           "source": p["source"], "checked": "found by the data scout, checked against the notice by the organiser"}
    cur = pd.concat([cur, pd.DataFrame([row])], ignore_index=True).sort_values(["country", "item", "month"])
    cur[cols].to_csv(CURATED, index=False)


if __name__ == "__main__":
    main()

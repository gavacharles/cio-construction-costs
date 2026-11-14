#!/usr/bin/env python3
"""
market_agent.py — the market agent: when the shock watch flags a country, Claude finds out what changed and proposes
the changes the forecasts need. Nothing it proposes goes live by itself.

    python src/ai/market_agent.py [--country uganda] [--force]

Loop (run after every refresh, src/market/cycle.py; off without ANTHROPIC_API_KEY, capped by CIO_AI_MONTHLY_USD):
  1. Watch.    data/shared/driver_shocks.json (src/forecast/shock_watch.py) lists countries whose oil, currency or
               observed prices moved faster than the forecast. A flagged country is looked at once every 3 days.
  2. Look.     Claude searches and reads only the country's listed sites (config/market_agent.yaml: regulator, finance
               ministry, statistics office, established newspapers) and proposes, each with its URL and exact quote:
                 observed_price  a price seen for an item and month (pump price, cement, steel ...)
                 policy_event    a tax, excise, duty or regulated-price change that moves input costs
                 explanation     two or three sentences on what changed, for the country page
  3. Check.    Code (not the model) re-opens each page and confirms the quote is in it and contains the figures;
               anything off the listed sites, or with figures missing from its own quote, is dropped. Big moves and
               clashes with what is already recorded are flagged for the reviewer.
  4. Decide.   The organiser approves or rejects each proposal in /admin (section "Market agent").
  5. Act.      Approving makes the change: observed prices -> data/shared/observed_market_prices.csv (the shock watch
               then compares them with the forecast); policy events -> countries/<c>/policy_events.yaml (enacted
               events enter the forecast at the next refresh); explanations -> data/shared/agent_notes.json (shown
               with the caution box on the country page).
"""
from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from datetime import date, datetime, timezone
from pathlib import Path

import pandas as pd
import yaml

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src" / "market"))
sys.path.insert(0, str(ROOT / "src" / "ai"))

import claude                                            # noqa: E402
from scout import _norm, _numbers, fetch_text, on_site   # noqa: E402  (same checks as the data scout)

CONFIG = ROOT / "config" / "market_agent.yaml"
SHOCKS = ROOT / "data" / "shared" / "driver_shocks.json"
OBSERVED = ROOT / "data" / "shared" / "observed_market_prices.csv"
NOTES = ROOT / "data" / "shared" / "agent_notes.json"
STATE = ROOT / "data" / "live" / "market_agent_state.json"
DB = ROOT / "data" / "live" / "exchange.sqlite"
MAX_TURNS = 25
EVERY_DAYS = 3
BIG_CHANGE = 0.35

SYSTEM = """You investigate sudden changes in construction input costs for CiO Costs, a site that forecasts \
construction costs in Africa. A monitor has flagged a country because oil, its currency or observed prices moved \
faster than the forecast. Find out what actually changed, from the allowed sites only.

- Propose a price (observed_price) only when you have read it on an allowed site; copy the sentence or table row that \
gives it exactly, with the figure(s). For a range ("between 6,700 and 7,300") give price_low and price_high; for a \
single price give it as both.
- Propose a policy event (policy_event) for a tax, excise, duty, levy or regulated-price change that moves input costs: \
when it takes effect, what it is, which items it touches, its size in % if the source says or allows a direct \
calculation, and whether it is enacted or only proposed. Quote the source exactly.
- Write one explanation (explain) of two or three plain sentences on what changed and why, citing what you read.
- Never estimate or infer a figure the source does not give. Prefer the regulator or ministry over newspapers. \
If you find nothing reliable, say so in finish.
"""


# ------------------------------------------------------------------------------- storage (organiser's queue) --
def db() -> sqlite3.Connection:
    DB.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute("""CREATE TABLE IF NOT EXISTS agent_proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT, created TEXT, country TEXT, kind TEXT, payload TEXT,
        source TEXT, quote TEXT, checks TEXT, status TEXT DEFAULT 'pending', decided TEXT)""")
    return c


def add(c: sqlite3.Connection, country: str, kind: str, payload: dict, source: str, quote: str, checks: str) -> bool:
    dup = c.execute("SELECT 1 FROM agent_proposals WHERE country=? AND kind=? AND payload=? AND status!='rejected'",
                    (country, kind, json.dumps(payload, sort_keys=True))).fetchone()
    if dup:
        return False
    c.execute("INSERT INTO agent_proposals (created, country, kind, payload, source, quote, checks) VALUES (?,?,?,?,?,?,?)",
              (datetime.now(timezone.utc).isoformat(timespec="seconds"), country, kind, json.dumps(payload, sort_keys=True),
               source, quote, checks))
    c.commit()
    return True


def pending(c: sqlite3.Connection | None = None) -> list[dict]:
    c = c or db()
    return [{**dict(r), "payload": json.loads(r["payload"])} for r in
            c.execute("SELECT * FROM agent_proposals WHERE status='pending' ORDER BY country, kind, id")]


def decide(pid: int, approve: bool, c: sqlite3.Connection | None = None) -> dict | None:
    """Approve (and apply) or reject one proposal."""
    c = c or db()
    r = c.execute("SELECT * FROM agent_proposals WHERE id=? AND status='pending'", (pid,)).fetchone()
    if not r:
        return None
    p = {**dict(r), "payload": json.loads(r["payload"])}
    if approve:
        apply(p)
    c.execute("UPDATE agent_proposals SET status=?, decided=? WHERE id=?",
              ("approved" if approve else "rejected", datetime.now(timezone.utc).isoformat(timespec="seconds"), pid))
    c.commit()
    return p


# --------------------------------------------------------------------------- applying an approved proposal --
def apply(p: dict) -> None:
    c, k, x = p["country"], p["kind"], p["payload"]
    if k == "observed_price":
        cols = ["country", "item", "month", "price_low", "price_high", "unit", "source", "quality"]
        cur = pd.read_csv(OBSERVED) if OBSERVED.exists() else pd.DataFrame(columns=cols)
        cur = cur[~((cur.country == c) & (cur.item == x["item"]) & (cur.month.astype(str) == x["month"]))]
        row = dict(country=c, item=x["item"], month=x["month"], price_low=x["price_low"], price_high=x["price_high"],
                   unit=x["unit"], source=p["source"], quality=f"found by the market agent, approved by the organiser ({date.today()})")
        pd.concat([cur, pd.DataFrame([row])], ignore_index=True).sort_values(["country", "item", "month"])[cols].to_csv(OBSERVED, index=False)
    elif k == "policy_event":
        f = ROOT / "countries" / c / "policy_events.yaml"
        doc = yaml.safe_load(f.read_text()) if f.exists() else {}
        doc = doc or {}
        doc.setdefault("events", []).append(dict(date=x["date"], measure=x["measure"], match=[i.lower() for i in x["items"]],
                                                 pct=x.get("pct"), status=x["status"], sources=[p["source"]],
                                                 note=f"found by the market agent, approved by the organiser ({date.today()})"))
        text = f.read_text() if f.exists() else ""
        head = "".join(l for l in text.splitlines(keepends=True) if l.startswith("#"))   # keep the file's explanation
        f.write_text(head + "\n" + yaml.safe_dump({"events": doc["events"]}, sort_keys=False, allow_unicode=True))
    elif k == "explanation":
        notes = json.loads(NOTES.read_text()) if NOTES.exists() else {}
        notes[c] = dict(text=x["text"], source=p["source"], approved=str(date.today()))
        NOTES.write_text(json.dumps(notes, indent=1, ensure_ascii=False))


# ------------------------------------------------------------------ checks done by code, not by the model --
def verify(kind: str, inp: dict, cfg: dict, fetch=fetch_text) -> tuple[bool, list[str]]:
    url, quote = inp.get("source_url", ""), inp.get("quote", "")
    if not on_site(url, cfg["sites"]):
        return False, ["not on an allowed site"]
    nums = _numbers(quote)
    if kind == "observed_price":
        for v in {inp["price_low"], inp["price_high"]}:
            if not any(abs(n - v) < 0.005 for n in nums):
                return False, [f"{v:g} is not in the quote"]
        if inp["price_low"] > inp["price_high"]:
            return False, ["low price above high price"]
    if kind == "policy_event" and inp.get("pct") is not None and not nums:
        return False, ["a size is given but the quote has no figures"]
    notes = []
    text = fetch(url)
    if text is None:
        notes.append("could not open the page to check: check it by hand")
    else:
        q, t = _norm(quote), _norm(text)
        notes.append("quote found on the page" if (q in t or q.replace(" ", "") in t.replace(" ", ""))
                     else "quote NOT found on the page as written: check it by hand")
    if kind == "observed_price" and OBSERVED.exists():
        o = pd.read_csv(OBSERVED)
        o = o[(o.country == inp["country"]) & (o.item == inp["item"]) & (o.month.astype(str) < inp["month"])].sort_values("month")
        if len(o):
            prev = (o.price_low.iloc[-1] + o.price_high.iloc[-1]) / 2
            mid = (inp["price_low"] + inp["price_high"]) / 2
            if prev > 0 and abs(mid / prev - 1) > BIG_CHANGE:
                notes.append(f"big change: {mid / prev - 1:+.0%} on {o.month.iloc[-1]}")
    return True, notes


# ------------------------------------------------------------------------------------------- the agent --
def tools(cfg: dict, items: list[str]) -> list[dict]:
    src = {"source_url": {"type": "string", "description": "URL of the page you read it on"},
           "quote": {"type": "string", "description": "the exact words and figure(s) from the page"}}
    return [
        {"type": "web_search_20260209", "name": "web_search", "max_uses": 8, "allowed_domains": cfg["sites"]},
        {"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": 20, "allowed_domains": cfg["sites"], "max_content_tokens": 40000},
        {"name": "observed_price", "strict": True, "description": "Record one price you read: one call per item and month.",
         "input_schema": {"type": "object", "additionalProperties": False,
                          "required": ["item", "month", "price_low", "price_high", "unit", "source_url", "quote"],
                          "properties": {"item": {"type": "string", "enum": items},
                                         "month": {"type": "string", "description": "YYYY-MM the price applies to"},
                                         "price_low": {"type": "number"}, "price_high": {"type": "number"},
                                         "unit": {"type": "string", "description": f"e.g. {cfg['currency']} per litre (pump, {cfg['where']})"}, **src}}},
        {"name": "policy_event", "strict": True, "description": "Record one tax, duty or regulated-price change that moves input costs.",
         "input_schema": {"type": "object", "additionalProperties": False,
                          "required": ["date", "measure", "items", "pct", "status", "source_url", "quote"],
                          "properties": {"date": {"type": "string", "description": "YYYY-MM it takes effect"},
                                         "measure": {"type": "string"},
                                         "items": {"type": "array", "items": {"type": "string", "enum": items}},
                                         "pct": {"type": ["number", "null"], "description": "price effect in %, only if stated or directly calculable"},
                                         "status": {"type": "string", "enum": ["enacted", "proposed"]}, **src}}},
        {"name": "explain", "strict": True, "description": "Two or three plain sentences on what changed and why.",
         "input_schema": {"type": "object", "additionalProperties": False, "required": ["text", "source_url", "quote"],
                          "properties": {"text": {"type": "string"}, **src}}},
        {"name": "finish", "strict": True, "description": "Call once, when you are done.",
         "input_schema": {"type": "object", "additionalProperties": False, "required": ["note"], "properties": {"note": {"type": "string"}}}},
    ]


def prompt(country: str, cfg: dict, shock: dict) -> str:
    flags = "\n".join(f"- {f}" for f in shock.get("flags", [])) or "- (none)"
    obs = "\n".join(f"- {o['item']} {o['month']}: observed {o['observed_pct']:+.0f}% vs forecast {o['forecast_pct']:+.0f}%"
                    for o in shock.get("observed", [])) or "- none recorded"
    return f"""Country: {country.replace('_', ' ').title()} ({cfg['currency']}; prices for {cfg['where']})
Allowed sites: {', '.join(cfg['sites'])}
Today: {date.today()}

What the monitor flagged:
{flags}

Observed prices already recorded against the forecast:
{obs}

Find what changed in the last two months: current and recent pump prices (diesel, petrol) and other input prices you can \
confirm, any tax, excise, duty or regulated-price decisions, and the reason prices moved. Then explain it briefly."""


def run_country(country: str, cfg: dict, items: list[str], shock: dict, cl=None, fetch=fetch_text, conn=None, spend=None) -> dict:
    conn = conn or db()
    cl = cl or claude.client()
    msgs = [{"role": "user", "content": prompt(country, cfg, shock)}]
    kept, dropped, note, usd = 0, 0, "", 0.0
    for _ in range(MAX_TURNS):
        r = claude.create(cl, system=SYSTEM, messages=msgs, tools=tools(cfg, items), max_tokens=16000)
        usd += claude.cost(r.usage)
        msgs.append({"role": "assistant", "content": r.content})
        if r.stop_reason == "refusal":
            note = "declined by the model"
            break
        if r.stop_reason == "pause_turn":
            continue
        calls = [b for b in r.content if b.type == "tool_use"]
        if not calls:
            break
        results, done = [], False
        for b in calls:
            inp = b.input if isinstance(b.input, dict) else json.loads(b.input)
            if b.name == "finish":
                note, done = str(inp.get("note", "")), True
                results.append({"type": "tool_result", "tool_use_id": b.id, "content": "ok"}); continue
            mfield = inp.get("month") or inp.get("date")
            if b.name in ("observed_price", "policy_event") and not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", str(mfield or "")):
                results.append({"type": "tool_result", "tool_use_id": b.id, "is_error": True, "content": "month/date must be YYYY-MM"}); continue
            inp = {**inp, "country": country}
            ok, notes = verify(b.name, inp, cfg, fetch)
            payload = {k: v for k, v in inp.items() if k not in ("source_url", "quote", "country")}
            kind = {"explain": "explanation"}.get(b.name, b.name)          # stored under the name decide()/apply() use
            if ok and add(conn, country, kind, payload, inp["source_url"], inp["quote"], "; ".join(notes)):
                kept += 1; msg = "recorded for review"
            else:
                dropped += 1; msg = "not recorded: " + ("; ".join(notes) if not ok else "already recorded")
            results.append({"type": "tool_result", "tool_use_id": b.id, "content": msg})
        msgs.append({"role": "user", "content": results})
        if done:
            break
    if spend:
        spend("market_agent", round(usd, 4), country)
    return {"country": country, "proposed": kept, "dropped": dropped, "usd": round(usd, 2), "note": note}


def due(country: str, state: dict, today: date | None = None) -> bool:
    last = state.get(country)
    return not last or (today or date.today()) - date.fromisoformat(last) >= pd.Timedelta(days=EVERY_DAYS).to_pytimedelta()


def main(argv=None) -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--country")
    ap.add_argument("--force", action="store_true", help="look even if not flagged or looked at recently")
    a = ap.parse_args(argv)
    if not claude.enabled():
        print("market agent: off (no ANTHROPIC_API_KEY)")
        return
    cfg = yaml.safe_load(CONFIG.read_text())
    shocks = json.loads(SHOCKS.read_text()).get("countries", {}) if SHOCKS.exists() else {}
    state = json.loads(STATE.read_text()) if STATE.exists() else {}
    from reports import Participants
    with Participants(DB) as people:
        for c, ccfg in cfg["countries"].items():
            if a.country and c != a.country:
                continue
            sh = shocks.get(c, {})
            if not a.force and (not sh.get("flags") or not due(c, state)):
                continue
            if people.ai_spend() >= claude.MONTHLY_USD:
                print("market agent: monthly spending cap reached"); break
            try:
                out = run_country(c, ccfg, cfg["items"], sh, spend=lambda job, usd, ctry: people.log_ai(job, job, usd, ctry))
            except claude.AIError as err:
                out = {"country": c, "error": str(err)}
            state[c] = date.today().isoformat()
            print("market agent:", json.dumps(out))
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(state, indent=1))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
data_checks.py — automatic data audit for the live countries (runs with every refresh; see cycle.py).

    python src/forecast/data_checks.py            # writes data/live/data_checks.json, prints problems
Each check is ok / warn / fail. "fail" means the site would show something wrong (broken ranges, missing data,
impossible values); "warn" means it is worth a look (a late official release, a stale download, a weak test).
Exit code 1 if anything fails, so the cron log shows it.
"""
from __future__ import annotations

import json
import math
import sys
from datetime import date, datetime
from pathlib import Path

import pandas as pd
import yaml

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "live" / "data_checks.json"


def months_between(a: str, b: str) -> int:
    return (int(b[:4]) - int(a[:4])) * 12 + int(b[5:7]) - int(a[5:7])


def base_month(base: str) -> str:
    m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    if base.startswith("Q"):
        return f"{base[-4:]}-{3 * int(base[1]):02d}"          # end of the quarter
    return f"{base[-4:]}-{m.index(base[:3]) + 1:02d}"


def live_countries() -> list[str]:
    c = yaml.safe_load((ROOT / "config" / "site.yaml").read_text()) or {}
    return list(c.get("pilot_countries") or []) + list(c.get("benchmark_countries") or [])


def check_country(key: str, today: date) -> list[dict]:
    out = []
    add = lambda check, status, detail="": out.append({"country": key, "check": check, "status": status, "detail": detail})
    cfg = yaml.safe_load((ROOT / "countries" / key / "config.yaml").read_text())
    f = ROOT / "countries" / key / "outputs" / "forecast_latest.json"
    if not f.exists():
        add("forecast file", "fail", "no forecast_latest.json")
        return out
    d = json.loads(f.read_text())
    age = (today - date.fromisoformat(d.get("generated", "1970-01-01"))).days
    add("forecast age", "ok" if age <= 2 else "warn" if age <= 7 else "fail", f"{age} days old")

    # official data: how late is the latest release?
    if d.get("kind") != "pressure" and d.get("base"):
        lag = months_between(base_month(d["base"]), today.strftime("%Y-%m"))
        # a late official release is the gap CiO Costs exists to fill: report it, warn only if it grows past a year
        add("official data gap filled", "ok" if lag <= 12 else "warn", f"latest official {d['base']}; forecast fills {lag} months since")

    # forecast paths: complete, ordered ranges, no gaps, plausible
    paths = d.get("paths") or {}
    if not paths:
        add("forecast paths", "fail", "none")
    bad = []
    for name, p in paths.items():
        vals = [(q.get("lo"), q.get("median"), q.get("hi")) for q in p]
        if len(p) < 6:
            bad.append(f"{name}: only {len(p)} months")
        if any(v is None or (isinstance(v, float) and math.isnan(v)) for t in vals for v in t):
            bad.append(f"{name}: missing values")
        elif any(not (lo <= md <= hi) for lo, md, hi in vals):
            bad.append(f"{name}: range does not contain the central forecast")
        elif any(abs(md) > 60 for _, md, _ in vals):
            bad.append(f"{name}: implausible change")
        months = [q["month"] for q in p]
        if months != sorted(months):
            bad.append(f"{name}: months out of order")
    add("forecast ranges", "fail" if bad else "ok", "; ".join(bad[:4]) or f"{len(paths)} series")

    # history behind the chart
    sp = d.get("spark") or {}
    v = sp.get("values") or []
    if len(v) < 12:
        add("history", "warn", f"{len(v)} points")
    else:
        jumps = [abs(b / a - 1) * 100 for a, b in zip(v, v[1:]) if a]
        nonpos = [x for x in v if x <= 0]
        add("history", "fail" if nonpos else "warn" if max(jumps) > 25 else "ok",
            "non-positive values" if nonpos else f"largest move {max(jumps):.1f}%")

    # drivers
    dr = d.get("drivers") or {}
    if not dr.get("brent_usd"):
        add("oil price", "fail", "missing")
    if cfg.get("pressure_currency") != "USD":
        fx, ch = dr.get("fx"), dr.get("fx_13w_pct")
        add("exchange rate", "fail" if not fx else "warn" if ch is not None and abs(ch) > 40 else "ok",
            "missing" if not fx else f"{cfg['currency']} {fx:,.1f} ({ch:+.1f}% in 13 weeks)" if ch is not None else "no 13-week change")

    # tests: benchmark accuracy and trend forecasts should be roughly calibrated
    for h, b in (d.get("benchmark") or {}).items():
        ins = b.get("inside", 0)
        add(f"benchmark test, {h} month(s)", "ok" if 0.65 <= ins <= 0.97 else "warn", f"{ins:.0%} inside over {b.get('n')} months")
    weak = [f"{k} {s['inside']:.0%}" for k, s in (d.get("trend_stats") or {}).items()     # judged only with 12+ unseen periods
            if s.get("inside") is not None and s.get("n", 0) >= 12 and not 0.6 <= s["inside"] <= 0.97]
    if d.get("trend_stats"):
        add("trend forecasts test", "warn" if weak else "ok", "; ".join(weak) or f"{len(d['trend_stats'])} materials within 60-97% inside")

    # downloads for benchmarks
    for s in cfg.get("benchmark_series") or []:
        rf = ROOT / "countries" / key / "raw" / f"{s['id']}.csv"
        if not rf.exists():
            add(f"download {s['id']}", "fail", "missing")
            continue
        days = (datetime.now() - datetime.fromtimestamp(rf.stat().st_mtime)).days
        last = pd.read_csv(rf).iloc[-1, 0][:7]
        lag = months_between(last, today.strftime("%Y-%m"))
        add(f"download {s['id']}", "ok" if days <= 3 and lag <= 4 else "warn", f"saved {days} days ago, latest {last}")

    # weekly note
    notes = sorted((ROOT / "countries" / key / "notes").glob(f"weekly_{key}_*.md"))
    if not notes:
        add("weekly note", "fail", "none")
    else:
        nd = date.fromisoformat(notes[-1].stem.rsplit("_", 1)[1])
        add("weekly note", "ok" if (today - nd).days <= 8 else "warn", f"latest {nd}")
    return out


def check_contract_index(key: str, today: date) -> list[dict]:
    """The published contract index: months in order without gaps, official before provisional, provisional only for
    periods that have ended, no implausible jumps."""
    f = ROOT / "public" / "data" / f"contract_index_{key}.csv"
    if not f.exists():
        return []
    d = pd.read_csv(f)
    probs = []
    m = list(d["month"])
    steps = {months_between(a, b) for a, b in zip(m, m[1:])}
    step = min(steps) if steps else 1                        # 1 = monthly, 3 = quarterly (dated by the first month)
    if len(steps) > 1 or step not in (1, 3):
        probs.append("gaps or uneven steps between periods")
    st = list(d["status"])
    if "provisional" in st and "official" in st[st.index("provisional"):]:
        probs.append("an official value after a provisional one")
    if len(m) and st[-1] == "provisional" and months_between(m[-1], today.strftime("%Y-%m")) < step:
        probs.append(f"provisional value for a period not yet ended ({m[-1]})")
    v = list(d["index"])
    big = [f"{a}->{b}" for (a, x), (b, y) in zip(zip(m, v), zip(m[1:], v[1:])) if x and abs(y / x - 1) > 0.15]
    if big:
        probs.append("jumps over 15%: " + ", ".join(big[:3]))
    return [{"country": key, "check": "contract index", "status": "fail" if probs else "ok", "detail": "; ".join(probs) or f"{len(m)} periods"}]


def run(today: date | None = None) -> list[dict]:
    today = today or date.today()
    res = []
    wd = ROOT / "data" / "shared" / "weekly_drivers.csv"
    if wd.exists():
        last = pd.read_csv(wd, usecols=[0]).iloc[-1, 0][:10]
        days = (today - date.fromisoformat(last)).days
        res.append({"country": "all", "check": "oil and currency feed", "status": "ok" if days <= 10 else "warn" if days <= 21 else "fail",
                    "detail": f"latest {last}"})
    else:
        res.append({"country": "all", "check": "oil and currency feed", "status": "fail", "detail": "weekly_drivers.csv missing"})
    for k in live_countries():
        res += check_country(k, today) + check_contract_index(k, today)
    return res


if __name__ == "__main__":
    res = run()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"run": datetime.now().isoformat(timespec="minutes"), "checks": res}, indent=1), encoding="utf-8")
    probs = [r for r in res if r["status"] != "ok"]
    for r in probs:
        print(f"{r['status'].upper():4s} {r['country']:15s} {r['check']}: {r['detail']}")
    n = {s: sum(r["status"] == s for r in res) for s in ("ok", "warn", "fail")}
    print(f"data checks: {n['ok']} ok, {n['warn']} warn, {n['fail']} fail")
    sys.exit(1 if n["fail"] else 0)

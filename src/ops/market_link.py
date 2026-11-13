"""Link CiO costs with the site weather service (gavacharles/kampala-heat-atlas) for market intelligence.

    python src/ops/market_link.py            # write the cost signal, read the site weather files
    python src/ops/market_link.py --push     # ... and publish the cost signal to GitHub

1. Cost signal, out: public/data/market_link.json, one compact entry per country from
   countries/<c>/outputs/forecast_latest.json (headline series, expected change with its range, the next
   period, oil and exchange-rate drivers, the materials moving most). With --push only this file is committed
   and pushed, so the site weather service (which runs on GitHub) can read it at a fixed address:
   https://raw.githubusercontent.com/gavacharles/cio-construction-costs/main/public/data/market_link.json
2. Site weather, in: https://gavacharles.github.io/kampala-heat-atlas/site-weather/market/index.json, saved per
   country as data/shared/site_weather/<country>.json for the country pages (src/site/build_index.py).
Run from the weekly cycle (src/market/cycle.py). Failures are reported and never stop the cycle.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "data" / "market_link.json"
WEATHER_URL = "https://gavacharles.github.io/kampala-heat-atlas/site-weather/market/index.json"
WEATHER_DIR = ROOT / "data" / "shared" / "site_weather"


def oil_4w() -> float | None:
    """Brent's change over the last 4 weeks, % (from data/shared/weekly_drivers.csv): fast moves make forecasts stale."""
    try:
        import pandas as pd
        d = pd.read_csv(ROOT / "data" / "shared" / "weekly_drivers.csv", parse_dates=["date"]).set_index("date").brent_usd.dropna()
        then = d[d.index <= d.index[-1] - pd.Timedelta(weeks=4)]
        return round((d.iloc[-1] / then.iloc[-1] - 1) * 100, 1) if len(then) else None
    except Exception:  # noqa: BLE001
        return None


def cost_signal() -> dict:
    out = {}
    o4 = oil_4w()
    sf = ROOT / "data" / "shared" / "driver_shocks.json"
    shocks = json.loads(sf.read_text()).get("countries", {}) if sf.exists() else {}
    for f in sorted((ROOT / "countries").glob("*/outputs/forecast_latest.json")):
        try:
            d = json.loads(f.read_text())
        except Exception:  # noqa: BLE001
            continue
        rows = d.get("rows") or []
        if not rows:
            continue
        head = rows[0]["series"]
        same = [r for r in rows if r["series"] == head]
        mats = (d.get("materials") or {}).get("items") or []
        movers = sorted([m for m in mats if m.get("change_year") is not None], key=lambda m: -abs(m["change_year"]))[:3]
        dr = d.get("drivers") or {}
        out[d.get("key", f.parent.parent.name)] = dict(
            country=d.get("country"), currency=d.get("currency"), kind=d.get("kind"), base=d.get("base"), generated=d.get("generated"),
            basis=d.get("basis"), series=head,
            near=dict(period=same[0]["period"], median=round(same[0]["median"], 2), lo=round(same[0].get("lo", same[0]["median"]), 2),
                      hi=round(same[0].get("hi", same[0]["median"]), 2)),
            next=(dict(period=same[1]["period"], median=round(same[1]["median"], 2)) if len(same) > 1 else None),
            oil_13w_pct=round(dr["brent_13w_pct"], 1) if dr.get("brent_13w_pct") is not None else None, oil_4w_pct=o4,
            fx=dr.get("fx"), fx_13w_pct=round(dr["fx_13w_pct"], 1) if dr.get("fx_13w_pct") is not None else None,
            movers=[dict(name=m["name"], change_year=round(m["change_year"], 1)) for m in movers],
            flags=(shocks.get(d.get("key", f.parent.parent.name)) or {}).get("flags", []),
            fx_spread_note=(shocks.get(d.get("key", f.parent.parent.name)) or {}).get("spread_note"))
    return dict(source="CiO Construction Cost Platform (gavacharles/cio-construction-costs)",
                generated=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
                note="Changes are % on the base period; fx_13w_pct > 0 means the local currency weakened against the US dollar over 13 weeks.",
                countries=out)


def push(path: Path) -> None:
    """Commit and push only the cost signal file; the rest of the working tree is left as it is."""
    rel = str(path.relative_to(ROOT))
    git = lambda *a: subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True)  # noqa: E731
    git("add", rel)
    if git("diff", "--cached", "--quiet", "--", rel).returncode == 0:
        print("cost signal unchanged; nothing to push"); return
    c = git("commit", "-m", "Market link: weekly cost signal for the site weather service", "--", rel)
    if c.returncode:
        print("commit failed:", c.stderr[-300:]); return
    p = git("push")
    if p.returncode:                                  # remote moved: rebase (keeping local edits aside) and retry once
        git("pull", "--rebase", "--autostash")
        p = git("push")
    print("cost signal pushed" if p.returncode == 0 else "push failed: " + p.stderr[-300:])


def pull_weather() -> int:
    try:
        idx = json.loads(urllib.request.urlopen(WEATHER_URL, timeout=60).read())
    except Exception as e:  # noqa: BLE001
        print("site weather not reachable:", str(e)[:120]); return 0
    WEATHER_DIR.mkdir(parents=True, exist_ok=True)
    n = 0
    for key, c in (idx.get("countries") or {}).items():
        (WEATHER_DIR / f"{key}.json").write_text(json.dumps(c, indent=1, ensure_ascii=False)); n += 1
    return n


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--push", action="store_true")
    a = ap.parse_args()
    sig = cost_signal()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(sig, indent=1, ensure_ascii=False))
    print(f"cost signal: {len(sig['countries'])} countries -> {OUT.relative_to(ROOT)}")
    print(f"site weather: {pull_weather()} countries saved to {WEATHER_DIR.relative_to(ROOT)}")
    if a.push:
        push(OUT)
    sys.exit(0)

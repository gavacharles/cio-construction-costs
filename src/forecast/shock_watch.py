"""Shock watch: notice when the world has moved faster than the forecasts, re-run them, and say so.

    python src/forecast/shock_watch.py            # check and write data/shared/driver_shocks.json
    python src/forecast/shock_watch.py --rerun    # ... and re-run the forecasts when a shock is found

Checks, daily (src/market/cycle.py):
  oil      Brent's change over 4 weeks (data/shared/weekly_drivers.csv; recent days may come from the futures
           settlement until EIA/FRED catch up). Shock at |change| >= OIL_PCT.
  fx       each currency's change against the US dollar over 4 weeks. Shock at |change| >= FX_PCT.
  fx spread CiO's exchange rate against an independent public feed (open.er-api.com). Public feeds disagree;
           a spread above SPREAD_PCT is shown so readers know the rate itself is uncertain.
  observed prices reported in the press or by surveys (data/shared/observed_market_prices.csv, unverified)
           against the model's own path for the same item: the change since the base month as observed and
           as forecast. A gap above GAP_PP points is flagged: the forecast is missing something.
When anything is flagged and --rerun is given, the forecasts are rebuilt from the latest drivers at once
(weekly_note.py --data-only), not at the next scheduled refresh. The country pages and the market-link
signal carry the flags (src/site/build_index.py, src/ops/market_link.py).
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "shared" / "driver_shocks.json"
OIL_PCT, FX_PCT, SPREAD_PCT, GAP_PP = 10.0, 5.0, 1.5, 8.0
CUR = {"uganda": "ugx", "kenya": "kes", "tanzania": "tzs", "rwanda": "rwf", "south_africa": "zar", "nigeria": "ngn", "ghana": "ghs",
       "zambia": "zmw", "mozambique": "mzn", "botswana": "bwp", "malawi": "mwk", "ethiopia": "etb", "egypt": "egp", "morocco": "mad",
       "mauritius": "mur", "namibia": "nad", "senegal": "xof", "zimbabwe": "zwg"}


def change(s: pd.Series, weeks: int = 4) -> float | None:
    s = s.dropna()
    then = s[s.index <= s.index[-1] - pd.Timedelta(weeks=weeks)]
    return round((s.iloc[-1] / then.iloc[-1] - 1) * 100, 1) if len(then) and len(s) else None


def observed_gaps() -> dict:
    """Observed change since the base month vs the model's path, per country and item."""
    f = ROOT / "data" / "shared" / "observed_market_prices.csv"
    out = {}
    if not f.exists():
        return out
    obs = pd.read_csv(f)
    obs["mid"] = (obs.price_low + obs.price_high) / 2
    for (c, item), g in obs.groupby(["country", "item"]):
        fl = ROOT / "countries" / c / "outputs" / "forecast_latest.json"
        if not fl.exists():
            continue
        d = json.loads(fl.read_text())
        base = pd.Period(pd.to_datetime(d.get("base", ""), errors="coerce"), "M") if d.get("base") else None
        paths = {k.lower(): v for k, v in (d.get("paths") or {}).items()}
        path = paths.get(item.lower())
        b = g[g.month == (str(base) if base is not None else "")]
        if path is None or b.empty:
            continue
        for _, r in g[g.month > str(base)].iterrows():
            fc = next((p["median"] for p in path if p["month"] == r.month), None)
            if fc is None:
                continue
            seen = (r.mid / b.mid.iloc[0] - 1) * 100
            gap = float(round(seen - fc, 1))
            out.setdefault(c, []).append(dict(item=item, month=r.month, observed_pct=float(round(seen, 1)), forecast_pct=float(round(fc, 1)),
                                              gap_pp=gap, flagged=bool(abs(gap) >= GAP_PP), source=r.source, quality=r.quality))
    return out


def main(rerun: bool) -> int:
    d = pd.read_csv(ROOT / "data" / "shared" / "weekly_drivers.csv", parse_dates=["date"]).set_index("date")
    oil4 = change(d.brent_usd)
    live = {}
    try:
        live = json.loads(urllib.request.urlopen(urllib.request.Request("https://open.er-api.com/v6/latest/USD",
                                                                        headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read())["rates"]
    except Exception as err:  # noqa: BLE001
        print("independent fx feed not reachable:", str(err)[:80])
    gaps = observed_gaps()
    countries, shocks = {}, []
    if oil4 is not None and abs(oil4) >= OIL_PCT:
        shocks.append(f"Oil {oil4:+.1f}% in 4 weeks")
    for c, cur in CUR.items():
        col = f"{cur}_per_usd"
        if col not in d:
            continue
        fx4 = change(d[col])
        flags = []
        if oil4 is not None and abs(oil4) >= OIL_PCT:
            flags.append(f"Oil has moved {oil4:+.1f}% in 4 weeks: forecasts made before the move may be off; re-run with the latest prices.")
        if fx4 is not None and abs(fx4) >= FX_PCT:
            flags.append(f"The {cur.upper()} has moved {fx4:+.1f}% against the dollar in 4 weeks ({'weaker' if fx4 > 0 else 'stronger'}).")
            shocks.append(f"{cur.upper()} {fx4:+.1f}% in 4 weeks")
        spread = None
        if cur.upper() in live and pd.notna(d[col].dropna().iloc[-1]):
            spread = round((d[col].dropna().iloc[-1] / live[cur.upper()] - 1) * 100, 1)
        for gp in gaps.get(c, []):
            if gp["flagged"]:
                flags.append(f"Observed {gp['item']} prices ({gp['month']}) are {gp['observed_pct']:+.0f}% on the base month against a forecast of "
                             f"{gp['forecast_pct']:+.0f}% ({gp['quality']}): the forecast is missing part of the move.")
                shocks.append(f"{c} {gp['item']} gap {gp['gap_pp']:+.0f} pp")
        countries[c] = dict(fx_4w_pct=fx4, fx_spread_vs_public_feed_pct=spread, spread_note=(
            f"Public exchange-rate feeds differ: CiO's rate is {spread:+.1f}% from an independent feed." if spread is not None and abs(spread) >= SPREAD_PCT else None),
            observed=gaps.get(c, []), flags=flags)
    res = dict(generated=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"), oil_4w_pct=oil4,
               thresholds=dict(oil_pct=OIL_PCT, fx_pct=FX_PCT, spread_pct=SPREAD_PCT, gap_pp=GAP_PP), shocks=shocks, countries=countries)
    if shocks and rerun:
        r = subprocess.run([sys.executable, "-W", "ignore", "src/forecast/weekly_note.py", "--country", "all", "--no-fetch", "--data-only"],
                           cwd=ROOT, capture_output=True, text=True)
        res["rerun"] = dict(at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"), ok=r.returncode == 0)
        res["countries"].update({c: v for c, v in res["countries"].items()})
        gaps2 = observed_gaps()                                     # recheck the gaps against the re-run forecasts
        for c, v in res["countries"].items():
            v["observed_after_rerun"] = gaps2.get(c, [])
    OUT.write_text(json.dumps(res, indent=1, ensure_ascii=False))
    print("shocks: " + ("; ".join(shocks) if shocks else "none") + (f" | re-run {'ok' if res.get('rerun', {}).get('ok') else 'failed'}" if "rerun" in res else ""))
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--rerun", action="store_true")
    sys.exit(main(ap.parse_args().rerun))

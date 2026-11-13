#!/usr/bin/env python3
"""
build_weekly_drivers.py — weekly macro readings for the weekly forecast note.

Contractors price jobs weekly; UBOS publishes monthly, 1-2 months late, and KNBS
quarterly. This script keeps the fast-moving drivers current:
  - Brent crude, daily (EIA RBRTE spreadsheet; FRED DCOILBRENTEU as fallback)
  - every live country's currency per USD, one reading per week (fawazahmed0 currency-api, dated
    snapshots on jsDelivr; cached, so each run only fetches new weeks)
  - the broad US dollar index (FRED DTWEXBGS) for the United States benchmark

Outputs
  data/shared/weekly_drivers.csv               weekly (Friday) readings since 2024-03
  data/shared/macro_extension_monthly.csv monthly means after the macro panel ends,
      spliced to the panel's own series by their ratio in the last overlapping month,
      with `days` = observations behind each month (the current month is partial)

    python src/ingest/build_weekly_drivers.py
"""
from __future__ import annotations

import io
import json
from datetime import date, timedelta
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
WEEKLY = ROOT / "data" / "shared" / "weekly_drivers.csv"
EXT = ROOT / "data" / "shared" / "macro_extension_monthly.csv"
PANEL = ROOT / "data" / "shared" / "panel_v1.0_extended.csv"
FX_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@{d}/v1/currencies/usd.json"
FX_START = date(2024, 3, 8)            # first dated snapshot available


def _currencies() -> dict[str, str]:
    """currency-api code -> column, for every country config with an fx_code."""
    import yaml
    out = {}
    for f in sorted((ROOT / "countries").glob("*/config.yaml")):
        fx = (yaml.safe_load(f.read_text(encoding="utf-8")) or {}).get("fx_code")
        if fx and fx != "usd":                       # the US uses the broad dollar index instead (see usd_index)
            out[fx] = f"{fx}_per_usd"
    return out


CURRENCIES = _currencies()


def _get(url: str, timeout: int = 60) -> bytes:
    """curl when available (some networks stall Python's TLS client on FRED), else urllib."""
    import shutil
    import subprocess
    if shutil.which("curl"):
        return subprocess.run(["curl", "-sSfL", "-m", str(timeout), url],      # FRED rejects custom user agents
                              capture_output=True, check=True).stdout
    with urlopen(Request(url, headers={"User-Agent": "Mozilla/5.0 (CiO Lab)"}), timeout=timeout) as r:  # nosec B310
        return r.read()


def brent_daily() -> pd.Series:
    try:
        raw = pd.read_excel(io.BytesIO(_get("https://www.eia.gov/dnav/pet/hist_xls/RBRTEd.xls")),
                            sheet_name="Data 1", skiprows=2)
        s = raw.set_index(raw.columns[0])[raw.columns[1]]
    except Exception:
        raw = pd.read_csv(io.BytesIO(_get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILBRENTEU")))
        s = pd.to_numeric(raw.set_index(raw.columns[0])[raw.columns[1]], errors="coerce")
    s.index = pd.to_datetime(s.index)
    s = s.dropna().astype(float)
    return extend_brent(s).rename("brent_usd")


def extend_brent(s: pd.Series) -> pd.Series:
    """Second source: EIA and FRED publish Brent with a lag of a few days, so the latest days come from the
    ICE Brent front-month futures settlement (Yahoo Finance BZ=F) until the official series catches up."""
    import json
    if len(s) and s.index.max() >= pd.Timestamp.today().normalize():
        return s
    try:
        req = Request("https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?range=1mo&interval=1d",
                      headers={"User-Agent": "Mozilla/5.0"})                         # refuses clients without one
        with urlopen(req, timeout=60) as resp:  # nosec B310
            js = json.loads(resp.read())
        r = js["chart"]["result"][0]
        f = pd.Series(r["indicators"]["quote"][0]["close"], index=pd.to_datetime(r["timestamp"], unit="s").normalize()).dropna()
        add = f[f.index > s.index.max()]
        if len(add):
            print(f"brent: {len(add)} recent day(s) from the futures settlement (official series ends {s.index.max():%Y-%m-%d})")
        return pd.concat([s, add]).sort_index()
    except Exception as err:  # noqa: BLE001
        print(f"brent second source: {err}")
        return s


def fx_weekly(cached: pd.DataFrame | None, backfill: bool = False) -> pd.DataFrame:
    # every cached week counts as fetched, unless a currency was added since (then back-fill once)
    have = set() if (cached is None or backfill) else set(cached.index.date)
    rows = []
    d, today = FX_START, date.today()
    while d <= today:
        if d not in have:
            try:
                usd = json.loads(_get(FX_URL.format(d=d.isoformat()), 30))["usd"]
                rows.append({"date": pd.Timestamp(d), **{v: usd.get(k) for k, v in CURRENCIES.items()}})
            except Exception:
                pass                       # a missing snapshot is skipped, not fatal
        d += timedelta(days=7)
    try:                                   # always add today's reading
        usd = json.loads(_get(FX_URL.format(d="latest"), 30))["usd"]
        rows.append({"date": pd.Timestamp(today), **{v: usd.get(k) for k, v in CURRENCIES.items()}})
    except Exception:
        pass
    new = pd.DataFrame(rows).set_index("date") if rows else pd.DataFrame(columns=list(CURRENCIES.values()))
    out = pd.concat([cached, new]) if cached is not None else new
    out = out[~out.index.duplicated(keep="last")].sort_index()
    return out[out.notna().mean(axis=1) >= 0.5]          # drop partial snapshots (e.g. saved before a currency was added)


def usd_index() -> pd.Series:
    """Federal Reserve broad US dollar index (FRED DTWEXBGS, daily): the dollar against major currencies, for the
    United States benchmark, whose prices are in dollars. Higher = stronger dollar."""
    raw = _get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS", 60).decode("utf-8")
    d = pd.read_csv(io.StringIO(raw))
    d.columns = ["date", "v"]
    d = d[pd.to_numeric(d.v, errors="coerce").notna()]
    return pd.Series(d.v.astype(float).values, index=pd.to_datetime(d.date), name="usd_index")


def build() -> tuple[pd.DataFrame, pd.DataFrame]:
    cached = pd.read_csv(WEEKLY, parse_dates=["date"]).set_index("date") if WEEKLY.exists() else None
    cols = list(CURRENCIES.values())
    new_cols = cached is not None and bool(set(cols) - set(cached.columns))
    fx = fx_weekly(cached.reindex(columns=cols) if cached is not None else None, backfill=new_cols)
    brent = brent_daily()
    weekly = fx.join(brent.resample("D").ffill().reindex(fx.index, method="ffill"), how="left")
    try:
        ui = usd_index()
        weekly = weekly.join(ui.resample("D").ffill().reindex(weekly.index, method="ffill"), how="left")
    except Exception as err:                    # keep the last known values rather than fail the feed
        print(f"usd index: {err}")
        if cached is not None and "usd_index" in cached:
            weekly["usd_index"] = cached["usd_index"].reindex(weekly.index)
    weekly.round(4).to_csv(WEEKLY)

    # monthly means after the panel ends, spliced onto the panel's own series
    panel = pd.read_csv(PANEL, parse_dates=["date"]).set_index("date")
    end = panel.index.max()
    month = lambda s: s.groupby(s.index.to_period("M")).agg(["mean", "count"])
    b, u = month(brent[brent.index >= "2024-01-01"]), month(fx["ugx_per_usd"])
    rows = []
    for col, m, panel_col in [("brent_crude_usd", b, "brent_crude_usd"), ("exchange_rate", u, "exchange_rate")]:
        overlap = end.to_period("M")
        ratio = panel.loc[end, panel_col] / m.loc[overlap, "mean"] if overlap in m.index else 1.0
        for p, r in m[m.index > overlap].iterrows():
            rows.append({"date": p.to_timestamp(), "column": col, "value": r["mean"] * ratio, "days": int(r["count"])})
    ext = pd.DataFrame(rows).pivot_table(index="date", columns="column", values="value")
    ext["days_fx"] = u.loc[u.index > end.to_period("M"), "count"].values[:len(ext)] if len(ext) else []
    ext.round(4).to_csv(EXT)
    return weekly, ext


if __name__ == "__main__":
    w, e = build()
    print(f"weekly readings {w.index.min():%Y-%m-%d}..{w.index.max():%Y-%m-%d} ({len(w)}); "
          f"monthly extension {', '.join(f'{d:%Y-%m}' for d in e.index)}")
    print(w.tail(3).round(1).to_string())

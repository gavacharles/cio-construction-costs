#!/usr/bin/env python3
"""
build_commodities.py — world prices that drive individual building materials (IMF primary commodity prices and the
US iron and steel price index, via FRED; no key needed). Monthly, in US dollars.

    python src/ingest/build_commodities.py     -> data/shared/commodities_monthly.csv
Columns: iron_ore, copper, aluminium, coal, natgas, steel. Keeps the old file if every download fails.
"""
from __future__ import annotations

import io
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "shared" / "commodities_monthly.csv"
SERIES = {"iron_ore": "PIORECRUSDM", "copper": "PCOPPUSDM", "aluminium": "PALUMUSDM", "coal": "PCOALAUUSDM",
          "natgas": "PNGASEUUSDM", "steel": "WPU101"}


def fetch(sid: str) -> pd.Series:
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}"
    if shutil.which("curl"):                       # FRED stalls Python's TLS client on some networks
        raw = subprocess.run(["curl", "-sSfL", "-m", "60", url], capture_output=True, text=True, check=True).stdout
    else:
        raw = urllib.request.urlopen(url, timeout=60).read().decode("utf-8")
    d = pd.read_csv(io.StringIO(raw))
    d.columns = ["date", "v"]
    d = d[pd.to_numeric(d.v, errors="coerce").notna()]
    return pd.Series(d.v.astype(float).values, index=pd.to_datetime(d.date))


if __name__ == "__main__":
    cols = {}
    for name, sid in SERIES.items():
        try:
            cols[name] = fetch(sid)
        except Exception as err:
            print(f"{name}: {err}", file=sys.stderr)
    if not cols:
        sys.exit("commodities: nothing downloaded; kept the old file")
    df = pd.DataFrame(cols)
    df = df[df.index >= "2000-01-01"]
    if OUT.exists():                               # keep series that failed this time
        old = pd.read_csv(OUT, parse_dates=["date"]).set_index("date")
        df = df.combine_first(old)
    df.index.name = "date"
    df.round(4).to_csv(OUT)
    print(f"commodities: {', '.join(cols)} to {df.dropna(how='all').index.max():%Y-%m}")

#!/usr/bin/env python3
"""
pull_fred.py — download the benchmark country's official price series from FRED (no API key needed).

    python src/ingest/pull_fred.py                    # every country with `fred_series` in its config
Saves countries/<country>/raw/<SERIES>.csv (date,value). Keeps the old file if a download fails.
"""
from __future__ import annotations

import csv
import io
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id={}"


def fetch(url: str) -> str:
    """curl when available (some networks stall Python's TLS client on FRED), else urllib."""
    if shutil.which("curl"):
        return subprocess.run(["curl", "-sSfL", "-m", "60", url], capture_output=True, text=True, check=True).stdout
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (CiO Costs)"})
    return urllib.request.urlopen(req, timeout=60).read().decode("utf-8")


def pull(country: str, series: list[dict]) -> int:
    out = ROOT / "countries" / country / "raw"
    out.mkdir(parents=True, exist_ok=True)
    n = 0
    for s in series:
        try:
            text = fetch(URL.format(s["id"]))
            rows = [r for r in csv.reader(io.StringIO(text))][1:]
            rows = [(d, v) for d, v in rows if v not in ("", ".")]
            if len(rows) < 24:
                raise ValueError("too few observations")
            with open(out / f"{s['id']}.csv", "w", newline="") as f:
                csv.writer(f).writerows([("date", "value"), *rows])
            n += 1
        except Exception as err:                       # keep the previous file
            print(f"{country} {s['id']}: {err}", file=sys.stderr)
    return n


if __name__ == "__main__":
    total = 0
    for cfg_file in sorted((ROOT / "countries").glob("*/config.yaml")):
        cfg = yaml.safe_load(cfg_file.read_text())
        if cfg.get("fred_series"):
            total += pull(cfg_file.parent.name, cfg["fred_series"])
    print(f"fred: {total} series saved")

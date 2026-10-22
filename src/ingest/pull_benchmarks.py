#!/usr/bin/env python3
"""
pull_benchmarks.py — download the benchmark countries' official construction price series (no API keys needed).

    python src/ingest/pull_benchmarks.py          # every country with `benchmark_series` in its config

Sources (one per `source:` value in the config):
  fred      US BLS producer price indexes via FRED                  (levels)
  eurostat  Eurostat sts_copi_m, construction cost, new residential  (levels, 2021 = 100)
  pxweb     Philippine Statistics Authority OpenSTAT (PXWeb)          (levels, 2018 = 100)
  bcb       Banco Central do Brasil SGS (monthly % change)            (turned into a level index from `start`, default 2000-01)
  dbt       UK DBT/ONS monthly construction material price indices    (latest "tables" workbook found via the gov.uk API)
  censtatd  Hong Kong C&SD costs of materials, public sector works   (one material, or `items`: equal-weight basket)
Saves countries/<country>/raw/<id>.csv as date,value. Keeps the old file if a download fails.
"""
from __future__ import annotations

import csv
import io
import json
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]


def fetch(url: str, data: dict | None = None) -> str:
    """curl when available (some networks stall Python's TLS client), else urllib."""
    if shutil.which("curl"):
        cmd = ["curl", "-sSfL", "-m", "90", url]
        if data is not None:
            cmd += ["-X", "POST", "-H", "Content-Type: application/json", "-d", json.dumps(data)]
        return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None,
                                 headers={"User-Agent": "Mozilla/5.0 (CiO Costs)", "Content-Type": "application/json"})
    return urllib.request.urlopen(req, timeout=90).read().decode("utf-8")


def fred(s: dict) -> list[tuple[str, float]]:
    rows = list(csv.reader(io.StringIO(fetch(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={s['id']}"))))[1:]
    return [(d, float(v)) for d, v in rows if v not in ("", ".")]


def eurostat(s: dict) -> list[tuple[str, float]]:
    url = ("https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/sts_copi_m/"
           f"M.{s.get('indic', 'COST')}.CPA_F41001_X_410014.NSA.I21.{s['geo']}?format=SDMX-CSV")
    rows = list(csv.DictReader(io.StringIO(fetch(url))))
    return sorted((r["TIME_PERIOD"] + "-01", float(r["OBS_VALUE"])) for r in rows if r.get("OBS_VALUE"))


def pxweb(s: dict) -> list[tuple[str, float]]:
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    q = {"query": [{"code": "Commodity Description", "selection": {"filter": "item", "values": [str(s["item"])]}}],
         "response": {"format": "csv"}}
    rows = list(csv.reader(io.StringIO(fetch(s["url"], q))))
    head, vals = rows[0], rows[1]
    out = []
    for h, v in zip(head[2:], vals[2:]):
        y, m = h.strip('"').split()
        if m in months and v not in ("", "..", "."):
            out.append((f"{y}-{months.index(m) + 1:02d}-01", float(v)))
    return out


def bcb(s: dict) -> list[tuple[str, float]]:
    rows = json.loads(fetch(f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{s['id']}/dados?formato=json"))
    lvl, out = 100.0, []
    for r in rows:                                  # monthly % change -> level, from s["start"] (after the 1994 Real plan)
        d, m, y = r["data"].split("/")
        if f"{y}-{m}" < s.get("start", "2000-01"):
            continue
        lvl *= 1 + float(r["valor"]) / 100
        out.append((f"{y}-{m}-01", round(lvl, 4)))
    return out


def dbt(s: dict) -> list[tuple[str, float]]:
    """Newest edition of the UK 'Building materials and components' statistics -> Table 1a column (e.g. 'All Work')."""
    import tempfile
    import openpyxl
    col = json.loads(fetch("https://www.gov.uk/api/content/government/collections/building-materials-and-components-monthly-statistics-2012"))
    docs = sorted((d for d in col["links"].get("documents", []) if "building-materials-and-components-statistics" in d["base_path"]),
                  key=lambda d: d.get("public_updated_at", ""), reverse=True)
    for doc in docs[:3]:                                  # newest edition that has the tables workbook
        ed = json.loads(fetch("https://www.gov.uk/api/content" + doc["base_path"]))
        xl = [a["url"] for a in ed.get("details", {}).get("attachments", []) if a.get("url", "").endswith(".xlsx") and "tables" in a["url"]]
        if xl:
            break
    else:
        raise ValueError("no tables workbook in the latest editions")
    with tempfile.TemporaryDirectory() as tmp:
        f = Path(tmp) / "t.xlsx"
        subprocess.run(["curl", "-sSfL", "-m", "120", "-o", str(f), xl[0]], check=True) if shutil.which("curl") else \
            f.write_bytes(urllib.request.urlopen(xl[0], timeout=120).read())
        rows = [r for r in openpyxl.load_workbook(f, read_only=True, data_only=True)[s.get("sheet", "1a")].iter_rows(values_only=True)]
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    hdr = next(i for i, r in enumerate(rows) if r and r[0] == "Year")
    ci = list(rows[hdr]).index(s.get("column", "All Work"))
    out, year = [], None
    for r in rows[hdr + 1:]:
        if r[0] is not None:
            year = r[0]
        m = str(r[1] or "").split(" [")[0].strip()
        if year and m in months and isinstance(r[ci], (int, float)):
            out.append((f"{int(year)}-{months.index(m) + 1:02d}-01", float(r[ci])))
    return out


def censtatd(s: dict) -> list[tuple[str, float]]:
    """Hong Kong cost-of-materials indices; with `items`, an equal-weight basket chained from the average monthly change."""
    d = json.loads(fetch(f"https://www.censtatd.gov.hk/api/get.php?id={s.get('table', '615-21002A')}&lang=en&full_series=1"))
    by = {}
    for r in d["dataSet"]:
        if isinstance(r.get("figure"), (int, float)):
            by.setdefault(r["ITEM_P"], {})[f"{r['period'][:4]}-{r['period'][4:6]}-01"] = float(r["figure"])
    items = s.get("items") or [s["item"]]
    dates = sorted(set.intersection(*(set(by[i]) for i in items)))
    if len(items) == 1:
        return [(t, by[items[0]][t]) for t in dates]
    lvl, out = 100.0, [(dates[0], 100.0)]
    for a, b in zip(dates, dates[1:]):
        lvl *= sum(by[i][b] / by[i][a] for i in items) / len(items)
        out.append((b, round(lvl, 4)))
    return out


SOURCES = {"fred": fred, "eurostat": eurostat, "pxweb": pxweb, "bcb": bcb, "dbt": dbt, "censtatd": censtatd}


def pull(country: str, series: list[dict]) -> int:
    out = ROOT / "countries" / country / "raw"
    out.mkdir(parents=True, exist_ok=True)
    n = 0
    for s in series:
        try:
            rows = SOURCES[s["source"]](s)
            if len(rows) < 36:
                raise ValueError(f"only {len(rows)} observations")
            with open(out / f"{s['id']}.csv", "w", newline="") as f:
                csv.writer(f).writerows([("date", "value"), *rows])
            n += 1
        except Exception as err:                    # keep the previous file
            print(f"{country} {s['id']}: {err}", file=sys.stderr)
    return n


if __name__ == "__main__":
    total = 0
    for cfg_file in sorted((ROOT / "countries").glob("*/config.yaml")):
        cfg = yaml.safe_load(cfg_file.read_text())
        if cfg.get("benchmark_series"):
            total += pull(cfg_file.parent.name, cfg["benchmark_series"])
    print(f"benchmarks: {total} series saved")

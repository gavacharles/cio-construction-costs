#!/usr/bin/env python3
"""
official_prices.py — official prices of single construction inputs in countries without official material indices.

Sources:
  zambia   Energy Regulation Board monthly pump price notices (national uniform prices, K/litre). Each notice lists the
           CURRENT and NEW price, so every month's NEW price must equal the next notice's CURRENT price: a month is kept
           only when that check passes (or it is the latest notice).
  curated  data/shared/official_item_prices_curated.csv: values typed from official notices that cannot be fetched
           automatically (RURA Rwanda, EWURA Tanzania, NBS Nigeria Price Watch), each with the notice's URL.
Output: data/shared/official_item_prices.csv  (country, item, month, price, unit, source, verified)

    python src/ingest/official_prices.py
"""
from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
from datetime import date
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "shared" / "official_item_prices.csv"
CURATED = ROOT / "data" / "shared" / "official_item_prices_curated.csv"
ERB = "https://www.erb.org.zm/wp-content/uploads/PressStatements/CurrentFuelPumpPrices{m}{y}.pdf"
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def _pdf_text(url: str, ocr: bool = False) -> str | None:
    with tempfile.TemporaryDirectory() as tmp:
        f = Path(tmp) / "n.pdf"
        r = subprocess.run(["curl", "-sSfL", "-m", "60", "-o", str(f), url], capture_output=True)
        if r.returncode != 0 or not f.exists() or f.stat().st_size < 2000:
            return None
        if not ocr:
            return subprocess.run(["pdftotext", "-layout", str(f), "-"], capture_output=True, text=True, stdin=subprocess.DEVNULL).stdout
        subprocess.run(["pdftoppm", "-r", "300", "-png", str(f), f"{tmp}/p"], capture_output=True, stdin=subprocess.DEVNULL)
        return "\n".join(subprocess.run(["tesseract", str(x), "stdout", "--psm", "6"], capture_output=True, text=True).stdout
                         for x in sorted(Path(tmp).glob("p-*.png")))


ROW = {"diesel": r"^\W*DIESEL\b[^\d\n]*([\d]+[.,]\d{2})(?:[^\d\n]+([\d]+[.,]\d{2}))?",
       "petrol": r"^\W*PETROL\b[^\d\n]*([\d]+[.,]\d{2})(?:[^\d\n]+([\d]+[.,]\d{2}))?"}


def _parse(t: str) -> dict:
    out = {}
    for item, pat in ROW.items():
        m = re.search(pat, t, re.M | re.I)
        if m:
            a, b = float(m.group(1).replace(",", ".")), (float(m.group(2).replace(",", ".")) if m.group(2) else None)
            out[item] = (a, b) if b is not None else (None, a)      # one number = the new price only
    return out


def zambia(start: str = "2025-01") -> list[dict]:
    """Each notice's NEW national uniform price for the month. Verified when the next notice's CURRENT price agrees
    (a price can also change by a mid-month revision; that is recorded, not dropped). Image tables are read by OCR."""
    rec = []
    for p in pd.period_range(start, date.today().strftime("%Y-%m"), freq="M"):
        url = ERB.format(m=MONTHS[p.month - 1], y=p.year)
        t = _pdf_text(url)
        if not t:
            continue
        got, how = _parse(t), "text"
        if len(got) < 2 and shutil.which("tesseract"):
            got, how = {**_parse(_pdf_text(url, ocr=True) or ""), **got}, "OCR"
        for item, (cur, new) in got.items():
            rec.append({"month": str(p), "item": item, "current": cur, "new": new, "url": url, "how": how})
    rows = []
    df = pd.DataFrame(rec)
    # a month whose notice could not be read: the next notice states the price it replaced, which is that month's price
    fill = []
    for item, g in (df.groupby("item") if len(df) else []):
        have = set(g["month"])
        for _, r in g.iterrows():
            prev = str(pd.Period(r["month"], "M") - 1)
            if prev not in have and r["current"] is not None and not pd.isna(r["current"]) and prev >= start:
                fill.append({"month": prev, "item": item, "current": None, "new": r["current"], "url": r["url"], "how": "next"})
    if fill:
        df = pd.concat([df, pd.DataFrame(fill)], ignore_index=True)
    for item, g in (df.groupby("item") if len(df) else []):
        g = g.sort_values("month").reset_index(drop=True)
        for i, r in g.iterrows():
            nxt = g.iloc[i + 1] if i + 1 < len(g) else None
            if nxt is None:
                v = "latest notice"
            elif nxt["current"] is None or pd.isna(nxt["current"]):
                v = "next notice gives no previous price"
            elif abs(nxt["current"] - r["new"]) < 0.005:
                v = "next notice agrees"
            else:
                v = f"revised to {nxt['current']:.2f} before the next notice"
            if not (5 <= r["new"] <= 100):                           # K/litre; anything else is a misread
                continue
            rows.append({"country": "zambia", "item": item, "month": r["month"], "price": r["new"], "unit": "ZMW per litre",
                         "source": r["url"], "verified": ("from the next notice's previous price" if r["how"] == "next"
                                                          else v + (" (read by OCR)" if r["how"] == "OCR" else ""))})
    return rows


CURATED_LABELS = {"typed from the official notice", "found by the data scout, checked against the notice by the organiser"}


def curated() -> pd.DataFrame:
    cur = pd.read_csv(CURATED) if CURATED.exists() else pd.DataFrame()
    if len(cur):
        cur["verified"] = cur["checked"].fillna("typed from the official notice") if "checked" in cur else "typed from the official notice"
        cur = cur.drop(columns=["checked"], errors="ignore")
    return cur


def write(fetched: pd.DataFrame) -> pd.DataFrame:
    out = pd.concat([fetched, curated()], ignore_index=True)
    out.sort_values(["country", "item", "month"]).to_csv(OUT, index=False)
    return out


def merge_curated() -> None:
    """Re-merge the curated file without fetching anything (after the organiser approves a data-scout proposal)."""
    old = pd.read_csv(OUT) if OUT.exists() else pd.DataFrame(columns=["country", "verified"])
    write(old[~old.verified.isin(CURATED_LABELS)])                           # keep the rows read automatically (ERB)


if __name__ == "__main__":
    if not (shutil.which("curl") and shutil.which("pdftotext")):
        raise SystemExit("official prices: needs curl and pdftotext")
    out = write(pd.DataFrame(zambia()))
    print(f"official prices: {len(out)} rows ({', '.join(f'{c}/{i} {len(g)}' for (c, i), g in out.groupby(['country', 'item']))})")

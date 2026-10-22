#!/usr/bin/env python3
"""
knbs_ocr.py — recover headline indices from KNBS releases that are scanned images (no text layer).

Six KNBS PDFs (Q4 2021, Q1-Q4 2022, Q3 2025) are scans, so the text parser finds nothing and, for Q4 2021, no other
release carries the figure. This reads only the three headline rows (Overall Construction / Building / Civil
Engineering Cost Index) by OCR (pdftoppm + tesseract), repairs OCR damage to numbers ("102-46" -> 102.46,
"11474" -> 114.74) and accepts the release quarter's value ONLY when at least two of the quarters just before it
match the text-parsed releases (within 0.02). Accepted values go to countries/kenya/raw/knbs_ocr_verified.csv,
which the settlement loader adds after the text releases (text values always win).

    python src/ingest/knbs_ocr.py            # needs tesseract and poppler; skips PDFs already checked
"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "countries" / "kenya" / "raw"
OUT = RAW / "knbs_ocr_verified.csv"
ROWS = {"all|total": r"overall\s*construction\s*cost", "buildings|total": r"overall\s*building\s*cost",
        "civil|total": r"overall\s*civil\s*engineering\s*cost"}
QWORD = {"first": 1, "second": 2, "third": 3, "fourth": 4}


def release_quarter(name: str) -> pd.Timestamp | None:
    m = re.search(r"(first|second|third|fourth)-quarter-(\d{4})", name, re.I)
    return pd.Timestamp(int(m.group(2)), 3 * QWORD[m.group(1).lower()] - 2, 1) if m else None


def ocr_text(pdf: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", "300", "-png", str(pdf), f"{tmp}/p"], check=True, capture_output=True, stdin=subprocess.DEVNULL)
        return "\n".join(subprocess.run(["tesseract", str(p), "stdout", "--psm", "6", "-c", "preserve_interword_spaces=1"],
                                        capture_output=True, text=True).stdout for p in sorted(Path(tmp).glob("p-*.png")))


def numbers(line: str) -> list[float]:
    """Index-like numbers on an OCR line, repairing '102-46' and '11474' style damage."""
    out = []
    for t in re.findall(r"\d[\d.\-]*\d|\d", line):
        t = re.sub(r"(?<=\d)-(?=\d)", ".", t)
        if t.count(".") > 1:
            continue
        v = float(t)
        if "." not in t and 5 <= len(t) <= 5 and 50 <= v / 100 <= 400:
            v = v / 100
        if 50 <= v <= 400:
            out.append(round(v, 2))
    return out


def check(pdf: Path, known: pd.DataFrame) -> list[dict]:
    rq = release_quarter(pdf.name)
    if rq is None:
        return []
    text = ocr_text(pdf).splitlines()
    found = []
    for label, pat in ROWS.items():
        # the table row, not a sentence in the commentary that mentions the same index
        line = next((l for l in text if re.search(pat, re.sub(r"[^a-z ]", "", l.lower())) and len(numbers(l)) >= 3), None)
        if not line:
            continue
        vals = numbers(line)
        dates = [rq - pd.DateOffset(months=3 * k) for k in range(len(vals))][::-1]      # last value = release quarter
        ref = known[known.series_label == label].groupby("date").index_value.last()
        matches = 0
        for d, v in list(zip(dates, vals))[-2::-1]:                                       # walk back from the quarter before
            if d in ref.index and abs(ref[d] - v) <= 0.02:
                matches += 1
            else:
                break
        found.append({"series_label": label, "date": rq.strftime("%Y-%m-%d"), "index_value": vals[-1],
                      "source_file": f"{pdf.name} (OCR)", "release_month": rq.strftime("%Y-%m-%d"),
                      "verified_against": matches, "accepted": matches >= 2})
    return found


def main() -> None:
    if not (shutil.which("tesseract") and shutil.which("pdftoppm")):
        print("knbs ocr: tesseract/poppler not installed; skipped")
        return
    sys.path[:0] = [str(ROOT / "src" / "ingest"), str(ROOT / "src" / "market")]
    from parse_knbs_cipi import KnbsParseError, parse_release
    texts, scanned = [], []
    for f in sorted(RAW.glob("*.pdf")):
        try:
            r = parse_release(f)
            r["series_label"] = r["sheet"].str.lower() + "|" + r["series_label"]
            texts.append(r)
        except KnbsParseError:
            scanned.append(f)
    known = pd.concat(texts, ignore_index=True)
    done = set(pd.read_csv(OUT).source_file.str.replace(" (OCR)", "", regex=False)) if OUT.exists() else set()
    rows = [r for f in scanned if f.name not in done for r in check(f, known)]
    old = pd.read_csv(OUT) if OUT.exists() else pd.DataFrame()
    allr = pd.concat([old, pd.DataFrame(rows)], ignore_index=True) if rows else old
    if not allr.empty:
        allr.to_csv(OUT, index=False)
    acc = allr[allr.accepted] if not allr.empty else allr
    print(f"knbs ocr: {len(scanned)} scanned releases; {len(rows)} new rows checked; "
          f"{len(acc)} accepted in total ({', '.join(f'{r.series_label} {r.date[:7]}={r.index_value}' for r in acc.itertuples())})")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
alerts.py — check price-alert sign-ups against the latest forecasts and queue messages.

People sign up on the public site (POST /api/public/alert): "tell me when the expected
change in <series> for <country> reaches <threshold> %". Each refresh, this compares every
active alert with the next-3-month expected change in countries/<c>/outputs/forecast_latest.json
and, when the threshold is reached (and nothing was sent in the last 7 days), writes a message
to data/live/alerts_outbox.csv. A sender (WhatsApp Business API / Twilio, or SMTP) reads the
outbox (src/market/send_alerts.py); until one is configured, the organiser can send these by hand.

    python src/market/alerts.py [--db data/live/exchange.sqlite]
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from reports import Participants   # noqa: E402

OUTBOX = ROOT / "data" / "live" / "alerts_outbox.csv"
SITE = os.environ.get("CIO_SITE_URL", "")


def expected_3m(country: str, series: str) -> tuple[float, str] | None:
    f = ROOT / "countries" / country / "outputs" / "forecast_latest.json"
    if not f.exists():
        return None
    paths = json.loads(f.read_text(encoding="utf-8")).get("paths", {})
    pth = paths.get(series) or next(iter(paths.values()), None)
    if not pth:
        return None
    target = (date.today().replace(day=1) + timedelta(days=95)).strftime("%Y-%m")
    q = [x for x in pth if x["month"] <= target] or pth[:1]
    return q[-1]["median"], q[-1]["month"]


def run(db: Path) -> int:
    n = 0
    with Participants(db) as p:
        for a in p.active_alerts():
            got = expected_3m(a["country"], a["series"])
            if not got:
                continue
            exp, month = got
            hit = exp >= a["threshold"] if a["threshold"] > 0 else exp <= a["threshold"]
            recent = a["last_sent"] and datetime.fromisoformat(a["last_sent"]) > datetime.now(timezone.utc) - timedelta(days=7)
            if not hit or recent:
                continue
            msg = (f"CiO Costs alert: {a['series']} in {a['country'].replace('_', ' ').title()} is now expected to move "
                   f"{exp:+.1f}% by {month} (your alert: {a['threshold']:+.1f}%). {SITE}/countries/{a['country']}/").strip()
            new = not OUTBOX.exists()
            OUTBOX.parent.mkdir(parents=True, exist_ok=True)
            with open(OUTBOX, "a", newline="") as fh:
                w = csv.writer(fh)
                if new:
                    w.writerow(["queued_utc", "alert_id", "channel", "contact", "message",
                                "series", "country", "change", "month", "url"])
                w.writerow([datetime.now(timezone.utc).isoformat(timespec="seconds"), a["id"], a["channel"], a["contact"], msg,
                            a["series"], a["country"].replace("_", " ").title(), f"{exp:+.1f}%", month,
                            f"{SITE}/countries/{a['country']}/"])
            p.mark_sent(a["id"])
            n += 1
    return n


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--db", default=os.environ.get("CIO_DB", str(ROOT / "data" / "live" / "exchange.sqlite")))
    a = ap.parse_args()
    print(f"{run(Path(a.db))} alert(s) queued in {OUTBOX}")

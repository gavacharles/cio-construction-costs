#!/usr/bin/env python3
"""
send_alerts.py — deliver queued price alerts (data/live/alerts_outbox.csv) by WhatsApp or email.

WhatsApp: Meta's WhatsApp Cloud API (no middleman fees). Business-initiated messages must use
a pre-approved *template*; create one in WhatsApp Manager, category "Utility", named as in
CIO_WA_TEMPLATE (default cio_price_alert), language "en", body for example:

    CiO Costs alert: {{1}} in {{2}} is now expected to move {{3}} by {{4}}. Details: {{5}}

Email: any SMTP service (e.g. Amazon SES, Brevo, Mailgun, or a Google Workspace account).

Environment (in /etc/cio/cio.env on the server):
    CIO_WA_TOKEN            permanent system-user access token
    CIO_WA_PHONE_ID         WhatsApp business phone number ID
    CIO_WA_TEMPLATE         approved template name (default cio_price_alert)
    CIO_WA_LANG             template language code (default en)
    CIO_WA_API_VERSION      Graph API version, e.g. v21.0 (check Meta's changelog; default v21.0)
    CIO_SMTP_HOST / CIO_SMTP_PORT / CIO_SMTP_USER / CIO_SMTP_PASS / CIO_SMTP_FROM

Dry run unless --send is given and the channel is configured. Every attempt is logged in
data/live/alerts_sent.csv, so nothing is sent twice.

    python src/market/send_alerts.py            # dry run: show what would be sent
    python src/market/send_alerts.py --send
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
OUTBOX = ROOT / "data" / "live" / "alerts_outbox.csv"
SENT = ROOT / "data" / "live" / "alerts_sent.csv"


def _sent_keys() -> set[str]:
    if not SENT.exists():
        return set()
    return {r["key"] for r in csv.DictReader(open(SENT)) if r["result"].startswith("sent")}


def _log(key: str, row: dict, result: str) -> None:
    new = not SENT.exists()
    with open(SENT, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(["key", "utc", "channel", "contact", "result"])
        w.writerow([key, datetime.now(timezone.utc).isoformat(timespec="seconds"), row["channel"], row["contact"], result])


def send_whatsapp(row: dict) -> str:
    token, phone_id = os.environ.get("CIO_WA_TOKEN"), os.environ.get("CIO_WA_PHONE_ID")
    if not token or not phone_id:
        raise RuntimeError("WhatsApp not configured (CIO_WA_TOKEN, CIO_WA_PHONE_ID)")
    to = re.sub(r"\D", "", row["contact"])
    params = [row.get(k) or "" for k in ("series", "country", "change", "month", "url")]
    body = {"messaging_product": "whatsapp", "to": to, "type": "template",
            "template": {"name": os.environ.get("CIO_WA_TEMPLATE", "cio_price_alert"),
                         "language": {"code": os.environ.get("CIO_WA_LANG", "en")},
                         "components": [{"type": "body", "parameters": [{"type": "text", "text": p} for p in params]}]}}
    url = f"https://graph.facebook.com/{os.environ.get('CIO_WA_API_VERSION', 'v21.0')}/{phone_id}/messages"
    req = Request(url, data=json.dumps(body).encode(), method="POST",
                  headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urlopen(req, timeout=30) as r:          # nosec B310 - fixed Meta endpoint
        return "sent " + json.load(r).get("messages", [{}])[0].get("id", "")


def send_email(row: dict) -> str:
    host = os.environ.get("CIO_SMTP_HOST")
    if not host:
        raise RuntimeError("email not configured (CIO_SMTP_HOST ...)")
    msg = EmailMessage()
    msg["Subject"] = f"CiO Costs alert: {row.get('series', 'prices')} in {row.get('country', '')}"
    msg["From"] = os.environ.get("CIO_SMTP_FROM", os.environ.get("CIO_SMTP_USER", ""))
    msg["To"] = row["contact"]
    msg.set_content(row["message"] + "\n\nYou asked for this alert on CiO Costs. Reply STOP to unsubscribe.")
    with smtplib.SMTP(host, int(os.environ.get("CIO_SMTP_PORT", "587")), timeout=30) as s:
        s.starttls()
        if os.environ.get("CIO_SMTP_USER"):
            s.login(os.environ["CIO_SMTP_USER"], os.environ.get("CIO_SMTP_PASS", ""))
        s.send_message(msg)
    return "sent"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--send", action="store_true", help="actually send (default: dry run)")
    a = ap.parse_args()
    if not OUTBOX.exists():
        print("nothing queued")
        return
    done, n = _sent_keys(), 0
    for row in csv.DictReader(open(OUTBOX)):
        key = f"{row['queued_utc']}:{row['alert_id']}"
        if key in done:
            continue
        if not a.send:
            print(f"[dry run] {row['channel']} -> {row['contact']}: {row['message']}")
            continue
        try:
            result = send_whatsapp(row) if row["channel"] == "whatsapp" else send_email(row)
        except Exception as err:            # keep going; failures are logged and retried next run
            result = f"failed: {err}"
        _log(key, row, result)
        n += result.startswith("sent")
    if a.send:
        print(f"{n} alert(s) sent; log: {SENT}")


if __name__ == "__main__":
    main()

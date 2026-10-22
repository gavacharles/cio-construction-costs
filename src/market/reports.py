"""
reports.py — participants and their weekly price reports (same sqlite file as the ledger).

Contractors price work from the quotes they get each week, not from a monthly index
published 1-2 months late. Participants therefore report what they actually paid or
were quoted (item, price, place). Weekly medians of those reports are the crowd price
series in the weekly note: faster than UBOS/KNBS and in shillings per bag, not index points.

    db = Participants("data/live/exchange.sqlite")
    code = db.invite("Jane Okello", "Okello Builders", "uganda")
    token = db.redeem(code)                 # sets the login token, opens a ledger account
    db.add_report(token, "cement_50kg", 34500, "Kampala - Nakawa", "hardware shop")
    db.crowd_summary("uganda", items)       # per item: latest-week median, change vs 4 weeks
"""
from __future__ import annotations

import secrets
import sqlite3
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import pandas as pd

SCHEMA = """
CREATE TABLE IF NOT EXISTS participants (
    handle TEXT PRIMARY KEY, name TEXT NOT NULL, org TEXT, country TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'participant', invite_code TEXT UNIQUE NOT NULL,
    token TEXT UNIQUE, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS price_reports (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL, week TEXT NOT NULL, handle TEXT NOT NULL,
    country TEXT NOT NULL, item TEXT NOT NULL, price REAL NOT NULL, location TEXT NOT NULL,
    supplier TEXT, note TEXT);
CREATE INDEX IF NOT EXISTS price_reports_item ON price_reports (country, item, week);
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY, created TEXT NOT NULL, country TEXT NOT NULL, series TEXT NOT NULL,
    threshold REAL NOT NULL, channel TEXT NOT NULL, contact TEXT NOT NULL, last_sent TEXT, active INTEGER DEFAULT 1);
"""


MIN_REPORTERS = 3          # an item's median is published only once this many different people reported it
WINDOW_WEEKS = 8           # typical prices pool the last 8 weeks: people report when they can, not every week
BACKFILL_MONTHS = 6        # people may also report what they paid up to 6 months ago
CHECK_FACTOR = 3           # a price more than 3x above or below the usual one is queried before it is saved
CAPITALS = {"uganda": "Kampala", "kenya": "Nairobi", "rwanda": "Kigali", "tanzania": "Dar es Salaam", "ethiopia": "Addis Ababa",
            "south_africa": "Johannesburg", "zambia": "Lusaka", "botswana": "Gaborone", "malawi": "Lilongwe", "zimbabwe": "Harare",
            "namibia": "Windhoek", "mozambique": "Maputo", "mauritius": "Port Louis", "ghana": "Accra", "nigeria": "Lagos",
            "senegal": "Dakar", "egypt": "Cairo", "morocco": "Casablanca"}     # the main commercial city, which sets most prices
AREAS = ("capital", "other")


class ReportError(ValueError):
    pass


def week_of(d: date) -> str:
    """ISO week start (Monday) as YYYY-MM-DD."""
    return (d - timedelta(days=d.weekday())).isoformat()


class Participants:
    def __init__(self, path: str | Path = ":memory:"):
        if str(path) != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(str(path), timeout=10, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)
        if "area" not in [r[1] for r in self.db.execute("PRAGMA table_info(price_reports)")]:
            self.db.execute("ALTER TABLE price_reports ADD COLUMN area TEXT")      # capital / other (older rows: unknown)

    def close(self) -> None:
        self.db.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc) -> None:
        self.close()

    # -------------------------------------------------------------- people --
    def invite(self, name: str, org: str, country: str, role: str = "participant") -> str:
        base = "".join(ch for ch in name.lower() if ch.isalnum())[:12] or "user"
        handle, k = base, 1
        while self.db.execute("SELECT 1 FROM participants WHERE handle=?", (handle,)).fetchone():
            k += 1
            handle = f"{base}{k}"
        code = secrets.token_hex(4).upper()
        with self.db:
            self.db.execute("INSERT INTO participants (handle, name, org, country, role, invite_code, created)"
                            " VALUES (?,?,?,?,?,?,?)", (handle, name, org, country, role, code,
                                                        datetime.now(timezone.utc).isoformat(timespec="seconds")))
        return code

    def redeem(self, code: str) -> str:
        row = self.db.execute("SELECT handle, token FROM participants WHERE invite_code=?",
                              (code.strip().upper(),)).fetchone()
        if row is None:
            raise ReportError("unknown invite code")
        token = secrets.token_urlsafe(24)
        with self.db:        # a code can be redeemed again (new device); the old token stops working
            self.db.execute("UPDATE participants SET token=? WHERE handle=?", (token, row["handle"]))
        return token

    def by_token(self, token: str | None) -> dict | None:
        if not token:
            return None
        row = self.db.execute("SELECT * FROM participants WHERE token=?", (token,)).fetchone()
        return dict(row) if row else None

    def all(self) -> list[dict]:
        return [dict(r) for r in self.db.execute("SELECT handle, name, org, country, role, invite_code, "
                                                 "token IS NOT NULL AS active FROM participants ORDER BY created")]

    # ------------------------------------------------------------- reports --
    def add_report(self, handle: str, country: str, item: str, price: float, location: str,
                   supplier: str = "", note: str = "", items: list[str] | None = None,
                   on: date | None = None, area: str = "") -> int:
        if items is not None and item not in items:
            raise ReportError(f"unknown item {item!r}")
        if not price or price <= 0:
            raise ReportError("price must be a positive number")
        if not location.strip():
            raise ReportError("say where (town or area) the price applies")
        if area and area not in AREAS:
            raise ReportError("area must be 'capital' or 'other'")
        on = on or date.today()
        with self.db:
            cur = self.db.execute(
                "INSERT INTO price_reports (ts, week, handle, country, item, price, location, supplier, note, area)"
                " VALUES (?,?,?,?,?,?,?,?,?,?)",
                (datetime.now(timezone.utc).isoformat(timespec="seconds"), week_of(on), handle, country, item,
                 float(price), location.strip(), supplier.strip(), note.strip(), area or None))
        return cur.lastrowid

    def add_alert(self, country: str, series: str, threshold: float, channel: str, contact: str) -> int:
        """Ask to be told when the expected change in `series` reaches `threshold` % (either sign)."""
        if channel not in ("whatsapp", "email"):
            raise ReportError("channel must be whatsapp or email")
        contact = contact.strip()
        if channel == "email" and ("@" not in contact or "." not in contact.split("@")[-1]):
            raise ReportError("enter a valid email address")
        if channel == "whatsapp" and sum(ch.isdigit() for ch in contact) < 9:
            raise ReportError("enter a WhatsApp number with country code")
        if not (0 < abs(float(threshold)) <= 100):
            raise ReportError("threshold must be between 0 and 100 %")
        with self.db:
            cur = self.db.execute("INSERT INTO alerts (created, country, series, threshold, channel, contact) VALUES (?,?,?,?,?,?)",
                                  (datetime.now(timezone.utc).isoformat(timespec="seconds"), country, series,
                                   float(threshold), channel, contact))
        return cur.lastrowid

    def active_alerts(self) -> list[dict]:
        return [dict(r) for r in self.db.execute("SELECT * FROM alerts WHERE active = 1")]

    def mark_sent(self, alert_id: int) -> None:
        with self.db:
            self.db.execute("UPDATE alerts SET last_sent = ? WHERE id = ?",
                            (datetime.now(timezone.utc).isoformat(timespec="seconds"), alert_id))

    def reports(self, country: str, since_weeks: int = 12) -> pd.DataFrame:
        since = week_of(date.today() - timedelta(weeks=since_weeks))
        return pd.read_sql_query("SELECT * FROM price_reports WHERE country=? AND week>=? ORDER BY ts",
                                 self.db, params=(country, since))

    def usual_price(self, country: str, item: str, weeks: int = 30, min_reporters: int = MIN_REPORTERS) -> float | None:
        """The usual price of an item: median of each person's median over recent weeks, once enough people reported."""
        df = self.reports(country, since_weeks=weeks)
        g = df[df["item"] == item]
        if g.empty:
            return None
        per = g.groupby("handle")["price"].median()
        return float(per.median()) if len(per) >= min_reporters else None

    def check_price(self, country: str, item: str, price: float) -> float | None:
        """The usual price when `price` is more than CHECK_FACTOR times away from it (a likely typo), else None."""
        usual = self.usual_price(country, item)
        if usual and (price > usual * CHECK_FACTOR or price < usual / CHECK_FACTOR):
            return usual
        return None

    def crowd_summary(self, country: str, items: list[dict], weeks_back: int = None,
                      min_reporters: int = MIN_REPORTERS) -> pd.DataFrame:
        """Per item, over a rolling window of the last WINDOW_WEEKS weeks (people report when they can, not every
        week): the median of each person's own median (`median`, published only from `min_reporters` different
        people), how many people and reports it rests on, the % change against the window before it, and the
        same median for the capital and for elsewhere (each published from `min_reporters` people)."""
        w = weeks_back or WINDOW_WEEKS
        df = self.reports(country, since_weeks=2 * w + 2)
        cut, cut2 = week_of(date.today() - timedelta(weeks=w - 1)), week_of(date.today() - timedelta(weeks=2 * w - 1))
        rows = []
        for it in items:
            g = df[df["item"] == it["code"]]
            cur, prev = g[g["week"] >= cut], g[(g["week"] >= cut2) & (g["week"] < cut)]
            per, per_prev = cur.groupby("handle")["price"].median(), prev.groupby("handle")["price"].median()
            pub = len(per) >= min_reporters
            row = {"item": it["code"], "name": it["name"], "unit": it["unit"], "week": cur["week"].max() if len(cur) else None,
                   "median": float(per.median()) if pub else None, "reports": int(len(cur)), "reporters": int(len(per)),
                   "change_pct": (float(per.median() / per_prev.median() - 1) * 100) if pub and len(per_prev) >= min_reporters else None,
                   "published": pub, "pending": int(len(per)), "window_weeks": w}
            for a in AREAS:
                per_a = cur[cur["area"] == a].groupby("handle")["price"].median() if "area" in cur else pd.Series(dtype=float)
                row[a] = float(per_a.median()) if len(per_a) >= min_reporters else None
                row[a + "_n"] = int(len(per_a))
            rows.append(row)
        cols = ["item", "name", "unit", "week", "median", "reports", "reporters", "change_pct", "published", "pending",
                "window_weeks", *AREAS, *(a + "_n" for a in AREAS)]
        return pd.DataFrame(rows, columns=cols)

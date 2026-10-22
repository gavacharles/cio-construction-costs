"""
usage.py — privacy-friendly visit counts for the public site (same sqlite file as the ledger).

No cookies and no IP addresses are stored. A visitor is a hash of (day, server secret, IP, browser) cut to
12 characters, so the same person counts once per day and cannot be followed from one day to the next.
Browsers that send "Do Not Track" are not counted at all (the page does not call the API).

    u = Usage("data/live/exchange.sqlite")
    u.record("/countries/uganda/", "view", visitor="ab12...", lang="sw", ref="google.com", country="uganda")
    u.summary("2026-10-01", "2026-10-31")
"""
from __future__ import annotations

import hashlib
import sqlite3
from datetime import date, datetime, timezone
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS hits (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL, day TEXT NOT NULL, path TEXT NOT NULL, kind TEXT NOT NULL,
    visitor TEXT NOT NULL, lang TEXT, ref TEXT, country TEXT);
CREATE INDEX IF NOT EXISTS hits_day ON hits (day, kind);
"""
# page views plus the actions that show whether the site is useful
KINDS = {"view", "embed", "report", "quick_report", "alert", "calc", "game", "draw", "share", "widget_copy",
         "money", "chip", "country", "note"}


def visitor_id(secret: str, ip: str, agent: str, day: str | None = None) -> str:
    day = day or date.today().isoformat()
    return hashlib.sha256(f"{day}|{secret}|{ip}|{agent}".encode()).hexdigest()[:12]


class Usage:
    def __init__(self, path: str | Path = ":memory:"):
        if str(path) != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(str(path), timeout=10, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)

    def close(self) -> None:
        self.db.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    def record(self, path: str, kind: str, visitor: str, lang: str = "", ref: str = "", country: str = "") -> None:
        if kind not in KINDS:
            raise ValueError("unknown kind")
        now = datetime.now(timezone.utc)
        with self.db:
            self.db.execute("INSERT INTO hits (ts, day, path, kind, visitor, lang, ref, country) VALUES (?,?,?,?,?,?,?,?)",
                            (now.isoformat(timespec="seconds"), now.date().isoformat(), path[:120], kind, visitor,
                             lang[:5], ref[:80], country[:30]))

    def summary(self, start: str, end: str) -> dict:
        """Counts between two days (inclusive): views, daily visitors, top pages, actions, languages, referrers."""
        q = lambda sql, *a: [dict(r) for r in self.db.execute(sql, (start, end, *a))]
        w = "day BETWEEN ? AND ?"
        days = q(f"SELECT day, COUNT(*) views, COUNT(DISTINCT visitor) visitors FROM hits WHERE {w} AND kind='view' GROUP BY day ORDER BY day")
        return {
            "views": sum(d["views"] for d in days),
            "visitor_days": sum(d["visitors"] for d in days),
            "days": days,
            "pages": q(f"SELECT path, COUNT(*) n FROM hits WHERE {w} AND kind='view' GROUP BY path ORDER BY n DESC LIMIT 10"),
            "actions": q(f"SELECT kind, COUNT(*) n FROM hits WHERE {w} AND kind!='view' GROUP BY kind ORDER BY n DESC"),
            "langs": q(f"SELECT COALESCE(NULLIF(lang,''),'?') lang, COUNT(DISTINCT visitor||day) n FROM hits WHERE {w} GROUP BY 1 ORDER BY n DESC"),
            "refs": q(f"SELECT ref, COUNT(*) n FROM hits WHERE {w} AND kind='view' AND ref!='' GROUP BY ref ORDER BY n DESC LIMIT 8"),
            "countries": q(f"SELECT country, COUNT(*) n FROM hits WHERE {w} AND country!='' GROUP BY country ORDER BY n DESC"),
        }

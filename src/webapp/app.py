"""
app.py — the CiO Costs web app: serves the public site and its small public API.

Run:   CIO_ADMIN_KEY=<long-secret> uvicorn --app-dir src/webapp app:app --host 127.0.0.1 --port 8000 \
           --proxy-headers --forwarded-allow-ips 127.0.0.1      (behind Caddy or a tunnel; see docs/DEPLOY.md)
Environment:
  CIO_DB               sqlite file (default data/live/exchange.sqlite)
  CIO_ADMIN_KEY        organiser password for /admin (admin is disabled when unset)
  CIO_SECURE_COOKIES   1 (default) = cookies only over HTTPS; set 0 for local http testing

Public site: public/ is served at / (built by src/site/build_index.py). Anyone can view it and report prices:
  POST /api/public/price   a price someone paid (anonymous; queried first when far from the usual price)
  POST /api/public/alert   an email alert on a forecast
  POST /api/public/hit     anonymous visit counting (no cookies, no IP stored)
Organiser: /admin (password = CIO_ADMIN_KEY) for the monthly pilot report.
"""
from __future__ import annotations

import contextvars
import hashlib
import hmac
import json
import html
import os
import sys
import threading
import time
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src" / "market"))
sys.path.insert(0, str(ROOT / "src" / "forecast"))

from country import load_country, list_countries        # noqa: E402
from reports import Participants, ReportError           # noqa: E402
from usage import Usage, visitor_id                      # noqa: E402
import pilot_report                                      # noqa: E402

DB = Path(os.environ.get("CIO_DB", ROOT / "data" / "live" / "exchange.sqlite"))
NOTES = ROOT / "countries"
ADMIN_COOKIE = "cio_admin"
SECURE = os.environ.get("CIO_SECURE_COOKIES", "1") != "0"

app = FastAPI(title="CiO construction cost pilot", docs_url=None, redoc_url=None)
COUNTRIES = {c: load_country(c) for c in list_countries()}
LIVE = [c for c in pilot_report.live_countries() if c in COUNTRIES]   # countries open on the public site


# Connections opened while handling a request are closed when the response is done.
_open: contextvars.ContextVar[list | None] = contextvars.ContextVar("cio_open", default=None)


def _track(obj):
    reg = _open.get()
    if reg is not None:
        reg.append(obj)
    return obj


def people() -> Participants:
    return _track(Participants(DB))


def usage() -> Usage:
    return _track(Usage(DB))


@app.middleware("http")
async def per_request(request: Request, call_next):
    reg: list = []
    token = _open.set(reg)
    try:
        response = await call_next(request)
    finally:
        _open.reset(token)
        for obj in reg:
            obj.close()
    if request.url.path in ("/embed.html", "/widget.js"):          # the website widget is meant to be shown on other sites
        response.headers["Content-Security-Policy"] = "frame-ancestors *"
    else:
        response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "same-origin"
    return response


class Limiter:
    """At most `limit` failed attempts per client IP per `window` seconds (in memory)."""

    def __init__(self, limit: int = 10, window: int = 900):
        self.limit, self.window = limit, window
        self.fails: dict[str, deque] = defaultdict(deque)
        self.lock = threading.Lock()

    def blocked(self, ip: str) -> bool:
        with self.lock:
            q = self.fails[ip]
            while q and q[0] < time.time() - self.window:
                q.popleft()
            return len(q) >= self.limit

    def fail(self, ip: str) -> None:
        with self.lock:
            self.fails[ip].append(time.time())


LIMIT = Limiter()


def _ip(request: Request) -> str:
    return request.client.host if request.client else "?"


e = html.escape

CSS = """
:root{--bg:#fbfaf7;--card:#fff;--fg:#1d1d1b;--mut:#6b6a66;--line:#e3e0d8;--acc:#b5651d;--acc2:#1f6f78;--bar:#f1e3d3}
@media (prefers-color-scheme:dark){:root{--bg:#141412;--card:#1d1c1a;--fg:#ecebe6;--mut:#a3a29c;--line:#33322e;--acc:#e0a060;--acc2:#5fb3bc;--bar:#3a2c1e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}
header{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--line);flex-wrap:wrap}
header b{color:var(--acc)}nav a{margin-left:14px;color:var(--fg);text-decoration:none}nav a:hover{color:var(--acc)}
main{max-width:860px;margin:0 auto;padding:16px}.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:12px 0}
h1{font-size:1.4rem;margin:.3em 0}h2{font-size:1.1rem;margin:.2em 0 .6em}.mut{color:var(--mut);font-size:.9rem}
table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:6px 6px;border-bottom:1px solid var(--line)}th{color:var(--mut);font-weight:600;font-size:.88rem}
.tw{overflow-x:auto}a{color:var(--acc2)}input,select,button{font:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--fg);width:100%}
button{background:var(--acc);color:#fff;border:0;cursor:pointer;font-weight:600}.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media (max-width:560px){.row{grid-template-columns:1fr}}label{display:block;margin:8px 0 4px;font-size:.9rem;color:var(--mut)}
.bar{position:relative;background:var(--bar);border-radius:6px;height:26px;overflow:hidden}.bar span{position:absolute;inset:0 auto 0 0;background:var(--acc);opacity:.75}
.bar em{position:absolute;left:8px;top:2px;font-style:normal;font-weight:600}.ok{color:var(--acc2)}.err{color:#c0392b}
"""


def page(title: str, body: str) -> HTMLResponse:
    """Organiser pages (the public site is static, in public/)."""
    return HTMLResponse(f"<!doctype html><html lang=en><head><meta charset=utf-8>"
                        f"<meta name=viewport content='width=device-width,initial-scale=1'><title>{e(title)}</title>"
                        f"<style>{CSS}</style></head><body><header><div><b>CiO Costs</b> · organiser</div>"
                        f"<nav><a href='/'>Public site</a><a href='/admin/pilot-report'>Pilot report</a><a href='/admin/logout'>Log out</a></nav>"
                        f"</header><main>{body}</main></body></html>")


@app.get("/app")
def old_members_area():
    """The invite-only members area is retired: anyone can view and contribute on the public site."""
    return RedirectResponse("/", status_code=301)


# ----------------------------------------------------------------- admin --

def _admin_token() -> str | None:
    """Stateless admin session: an HMAC of a fixed label under the admin password, so the
    password itself never sits in a cookie or a URL, and changing it logs everyone out."""
    key = os.environ.get("CIO_ADMIN_KEY")
    return hmac.new(key.encode(), b"cio-admin-session", hashlib.sha256).hexdigest() if key else None


def _is_admin(request: Request) -> bool:
    expected = _admin_token()
    return bool(expected) and hmac.compare_digest(request.cookies.get(ADMIN_COOKIE, ""), expected)


@app.get("/admin", response_class=HTMLResponse)
def admin(request: Request, err: str = ""):
    if not _admin_token():
        return HTMLResponse("Admin is disabled (CIO_ADMIN_KEY not set)", status_code=403)
    if not _is_admin(request):
        msg = f"<p class=err>{e(err)}</p>" if err else ""
        return page("Organiser login", f"""<div class=card><h1>Organiser login</h1>
<form method=post action=/admin/login><label>Admin password</label><input name=key type=password required>
<p><button>Log in</button></p></form>{msg}</div>""")
    from datetime import date as _date
    months = [(_date.today().replace(day=1) - __import__("datetime").timedelta(days=31 * i)).strftime("%Y-%m") for i in range(6)]
    links = "".join(f"<li><a href='/admin/pilot-report?month={m}'>{m}</a></li>" for m in dict.fromkeys(months))
    live = ", ".join(e(COUNTRIES[c]["country"]) for c in LIVE)
    return page("Organiser", f"""<div class=card><h1>Pilot</h1><p>Live countries: {live}.
Anyone can view the site and report prices; there are no accounts.</p><h2>Monthly pilot reports</h2><ul>{links}</ul></div>""")


@app.post("/admin/login")
def admin_login(request: Request, key: str = Form(...)):
    expected = os.environ.get("CIO_ADMIN_KEY")
    if LIMIT.blocked(_ip(request)):
        return RedirectResponse("/admin?err=Too+many+attempts.+Try+again+in+15+minutes", status_code=303)
    if not expected or not hmac.compare_digest(key, expected):
        LIMIT.fail(_ip(request))
        return RedirectResponse("/admin?err=Wrong+password", status_code=303)
    r = RedirectResponse("/admin", status_code=303)
    r.set_cookie(ADMIN_COOKIE, _admin_token(), httponly=True, samesite="strict", secure=SECURE, max_age=60 * 60 * 12)
    return r


@app.get("/admin/logout")
def admin_logout():
    r = RedirectResponse("/admin", status_code=303)
    r.delete_cookie(ADMIN_COOKIE)
    return r


@app.get("/admin/pilot-report", response_class=HTMLResponse)
def admin_pilot_report(request: Request, month: str = ""):
    if not _is_admin(request):
        return RedirectResponse("/admin", status_code=303)
    import re
    from datetime import date as _date
    month = month if re.fullmatch(r"\d{4}-\d{2}", month or "") else _date.today().strftime("%Y-%m")
    return HTMLResponse(pilot_report.build(DB, month))


# ----------------------------------------------------------- public API --
PUBLIC_LIMIT = Limiter(limit=30, window=3600)          # submissions per IP per hour
SALT = os.environ.get("CIO_ADMIN_KEY", "cio") + ":public"


def _anon(request: Request) -> str:
    """Anonymous reporter id: a salted hash of the IP, so one person counts once per item-week."""
    return "anon-" + hashlib.sha256((SALT + _ip(request)).encode()).hexdigest()[:10]


def _paid_on(months_ago) -> "date":
    """The date a reported price applies to: today, or the middle of a month up to BACKFILL_MONTHS ago."""
    from datetime import date as _date, timedelta as _td
    from reports import BACKFILL_MONTHS
    m = int(months_ago or 0)
    if not 0 <= m <= BACKFILL_MONTHS:
        raise ReportError(f"prices can go back {BACKFILL_MONTHS} months at most")
    return _date.today() if m == 0 else _date.today() - _td(days=30 * m)


@app.post("/api/public/price")
async def public_price(request: Request):
    if PUBLIC_LIMIT.blocked(_ip(request)):
        return JSONResponse({"ok": False, "error": "Too many reports from this connection; try later."}, status_code=429)
    PUBLIC_LIMIT.fail(_ip(request))                     # counts every submission, not only failures
    try:
        d = await request.json()
        country = str(d.get("country", ""))
        if country not in LIVE:
            raise ReportError("unknown country")
        items = [i["code"] for i in COUNTRIES[country].get("price_items", [])]
        price = float(d.get("price", 0))
        if price > 0 and not d.get("confirm"):
            usual = people().check_price(country, str(d.get("item", "")), price)
            if usual:                                    # likely a typo: ask before saving
                return {"ok": False, "check": True, "usual": round(usual)}
        rid = people().add_report(_anon(request), country, str(d.get("item", "")), float(d.get("price", 0)),
                                  str(d.get("location", ""))[:80], str(d.get("supplier", ""))[:60],
                                  note=("public; contact: " + str(d.get("contact", ""))[:80]) if d.get("contact") else "public",
                                  items=items, area=str(d.get("area", ""))[:10], on=_paid_on(d.get("months_ago", 0)))
        return {"ok": True, "id": rid}
    except (ReportError, ValueError, TypeError) as err:
        return JSONResponse({"ok": False, "error": str(err)}, status_code=400)


HIT_LIMIT = Limiter(limit=600, window=3600)            # page views + actions per IP per hour


@app.post("/api/public/hit")
async def public_hit(request: Request):
    """Anonymous visit counting: no cookies, no IP stored (see src/market/usage.py)."""
    ip = _ip(request)
    if HIT_LIMIT.blocked(ip):
        return JSONResponse({"ok": False}, status_code=429)
    HIT_LIMIT.fail(ip)
    try:
        d = json.loads((await request.body()) or b"{}")
        from urllib.parse import urlparse
        ref = urlparse(str(d.get("ref", ""))).hostname or ""
        if ref == request.url.hostname:
            ref = ""                                         # internal navigation is not a referrer
        usage().record(str(d.get("path", "/")), str(d.get("kind", "view")),
                       visitor_id(SALT, ip, request.headers.get("user-agent", "")),
                       lang=str(d.get("lang", "")), ref=ref, country=str(d.get("country", "")))
        return {"ok": True}
    except (ValueError, TypeError):
        return JSONResponse({"ok": False}, status_code=400)


@app.post("/api/public/alert")
async def public_alert(request: Request):
    if PUBLIC_LIMIT.blocked(_ip(request)):
        return JSONResponse({"ok": False, "error": "Too many requests; try later."}, status_code=429)
    PUBLIC_LIMIT.fail(_ip(request))
    try:
        d = await request.json()
        country = str(d.get("country", ""))
        if country not in LIVE:
            raise ReportError("unknown country")
        if not d.get("consent"):
            raise ReportError("please tick the box to agree to receive alerts")
        aid = people().add_alert(country, str(d.get("series", ""))[:80], float(d.get("threshold", 0)),
                                 str(d.get("channel", "")), str(d.get("contact", ""))[:120])
        return {"ok": True, "id": aid}
    except (ReportError, ValueError, TypeError) as err:
        return JSONResponse({"ok": False, "error": str(err)}, status_code=400)


# The public site (built into public/ by src/site/build_index.py) is served at the root.
# Only that folder is exposed: never the repository, raw data or the database.
PUBLIC_DIR = ROOT / "public"
if PUBLIC_DIR.exists():
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")

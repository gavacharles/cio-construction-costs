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
  POST /api/pro/contract   read the price adjustment data out of an uploaded contract (Claude; file never stored)
Organiser: /admin (password = CIO_ADMIN_KEY): monthly pilot report, data checks, data-scout proposals, Pro codes.
Assistant (src/ai/): on when ANTHROPIC_API_KEY is set; CIO_AI_MONTHLY_USD caps the spending.
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
import yaml
from fastapi import FastAPI, File, Form, Request, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src" / "market"))
sys.path.insert(0, str(ROOT / "src" / "forecast"))
sys.path.insert(0, str(ROOT / "src" / "ai"))
sys.path.insert(0, str(ROOT / "src" / "ingest"))

from country import load_country, list_countries        # noqa: E402
from reports import Participants, ReportError           # noqa: E402
from usage import Usage, visitor_id                      # noqa: E402
import pilot_report                                      # noqa: E402
import claude                                            # noqa: E402
import contract_reader                                   # noqa: E402

DB = Path(os.environ.get("CIO_DB", ROOT / "data" / "live" / "exchange.sqlite"))
NOTES = ROOT / "countries"
ADMIN_COOKIE = "cio_admin"
SECURE = os.environ.get("CIO_SECURE_COOKIES", "1") != "0"

app = FastAPI(title="CiO construction cost pilot", docs_url=None, redoc_url=None)
COUNTRIES = {c: load_country(c) for c in list_countries()}
LIVE = [c for c in pilot_report.live_countries() if c in COUNTRIES]   # countries open on the public site
TOWNS = yaml.safe_load((ROOT / "config" / "towns.yaml").read_text(encoding="utf-8"))   # towns to report from, ISO codes


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

CSS = """form.inline{display:inline;margin:0}code{font-weight:600}
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
                        f"<nav><a href='/'>Public site</a><a href='/admin'>Admin</a><a href='/admin/usage'>Usage</a><a href='/admin/pilot-report'>Pilot report</a><a href='/admin/logout'>Log out</a></nav>"
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


def waitlist_html() -> str:
    rows = people().waitlist()
    if not rows:
        return "<p class=mut>No sign-ups yet.</p>"
    codes = people().pro_codes()

    def code(email: str) -> str:
        if email in codes:
            return f"<code>{e(codes[email])}</code>"
        return (f"<form method=post action=/admin/pro-code class=inline><input type=hidden name=email value='{e(email)}'>"
                f"<button>Give a Pro code</button></form>")
    body = "".join(f"<tr><td>{e(r['created'][:10])}</td><td>{e(r['email'])}</td><td>{e(r['org'] or '')}</td><td>{e(r['role'] or '')}</td>"
                   f"<td>{e(r['country'] or '')}</td><td>{e(r['feature'] or '')}</td><td>{code(r['email'])}</td></tr>"
                   for r in {r['email']: r for r in rows}.values())
    return (f"<p class=mut>{len(rows)} sign-ups (private: never shown on the public site). A Pro code lets that person use "
            f"the contract reader up to {PRO_READS} times a day; send it to them yourself.</p><div class=tw><table><tr><th>Date</th><th>Email</th>"
            f"<th>Organisation</th><th>Role</th><th>Country</th><th>For</th><th>Pro code</th></tr>{body}</table></div>")


def scout_html() -> str:
    """Prices the data scout found in official notices, waiting for a decision."""
    on = "on" if claude.enabled() else "off (set ANTHROPIC_API_KEY to switch it on)"
    spent = people().ai_spend()
    head = (f"<p class=mut>Assistant {on}. Spent this month: US${spent:.2f} of US${claude.MONTHLY_USD:.0f}. "
            f"Each price below was read by Claude from an official notice and checked by code; nothing goes live until you approve it. "
            f"Open the notice and look for the quote before approving.</p>")
    rows = people().proposals()
    if not rows:
        return head + "<p class=mut>Nothing waiting.</p>"
    body = "".join(
        f"<tr><td>{e(r['country'])}</td><td>{e(r['item'])}</td><td>{e(r['month'])}</td><td><b>{r['price']:g}</b><br><span class=mut>{e(r['unit'])}</span></td>"
        f"<td>“{e(r['quote'])}”<br><a href='{e(r['source'])}' target=_blank rel=noopener>open the notice</a></td>"
        f"<td class={'ok' if r['checks'].startswith('quote found') and ';' not in r['checks'] else 'err'}>{e(r['checks'])}</td>"
        f"<td><form method=post action=/admin/scout/{r['id']} class=inline><button name=decision value=approve>Approve</button> "
        f"<button name=decision value=reject>Reject</button></form></td></tr>" for r in rows)
    return head + (f"<div class=tw><table><tr><th>Country</th><th>Item</th><th>Month</th><th>Price</th><th>Quote</th>"
                   f"<th>Checks</th><th></th></tr>{body}</table></div>")


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
    t = _date.today()
    months = [f"{(t.year * 12 + t.month - 1 - i) // 12}-{(t.month - 1 - i) % 12 + 1:02d}" for i in range(6)]
    links = "".join(f"<li><a href='/admin/pilot-report?month={m}'>{m}</a></li>" for m in dict.fromkeys(months))
    live = ", ".join(e(COUNTRIES[c]["country"]) for c in LIVE)
    chk = ROOT / "data" / "live" / "data_checks.json"
    checks = json.loads(chk.read_text()) if chk.exists() else {"run": "never", "checks": []}
    probs = [r for r in checks["checks"] if r["status"] != "ok"]
    rows = "".join(f"<tr><td class={'err' if r['status'] == 'fail' else 'mut'}>{e(r['status'])}</td><td>{e(r['country'])}</td>"
                   f"<td>{e(r['check'])}</td><td>{e(r['detail'])}</td></tr>" for r in probs) or "<tr><td colspan=4 class=ok>All checks pass.</td></tr>"
    ok = sum(r["status"] == "ok" for r in checks["checks"])
    return page("Organiser", f"""<div class=card><h1>Pilot</h1><p>Live countries: {live}.
Anyone can view the site and report prices; there are no accounts.</p><h2>Monthly pilot reports</h2><ul>{links}</ul></div>
<div class=card><h2>Health</h2>{problems_html()}<p><a href='/admin/usage'>How people use the site →</a></p></div>
<div class=card id=held><h2>Price reports held for review</h2>{held_html()}</div>
<div class=card id=scout><h2>Data scout: official prices to review</h2>{scout_html()}</div>
<div class=card><h2>CiO Costs Pro waitlist</h2>{waitlist_html()}</div>
<div class=card><h2>Data checks</h2><p class=mut>Last run {e(checks['run'])}: {ok} ok, {len(probs)} to look at.</p>
<div class=tw><table><tr><th>Status</th><th>Country</th><th>Check</th><th>Detail</th></tr>{rows}</table></div></div>""")


def _bars(days: list[dict]) -> str:
    """Visitors per day as a small bar chart (inline SVG)."""
    if not days:
        return "<p class=mut>No visits yet.</p>"
    top, w = max(d["visitors"] for d in days) or 1, 12
    bars = "".join(f"<rect x={i * (w + 3)} y={100 - 90 * d['visitors'] / top:.1f} width={w} height={90 * d['visitors'] / top:.1f} fill='#0a7f73'>"
                   f"<title>{e(d['day'])}: {d['visitors']} visitors, {d['views']} views</title></rect>" for i, d in enumerate(days))
    return (f"<svg viewBox='0 0 {len(days) * (w + 3)} 100' width='100%' height=120 preserveAspectRatio=none role=img "
            f"aria-label='Visitors per day'>{bars}</svg><p class=mut>{e(days[0]['day'])} → {e(days[-1]['day'])} · highest day: {top} visitors</p>")


def held_html() -> str:
    """Price reports held for review: they count nowhere until the organiser releases them."""
    rows = people().held_reports()
    if not rows:
        return "<p class=mut>Nothing held. Reports sent from another country, or far from what others nearby report, wait here.</p>"
    names = {c: COUNTRIES[c]["country"] for c in COUNTRIES}
    body = "".join(
        f"<tr><td>{e(r['ts'][:10])}</td><td>{e(names.get(r['country'], r['country']))}</td><td>{e(r['item'])}</td>"
        f"<td><b>{r['price']:,.0f}</b></td><td>{e(r['location'])}</td><td class=err>{e(r['held'])}</td>"
        f"<td><form method=post action=/admin/report/{r['id']} class=inline><button name=decision value=count>Count it</button> "
        f"<button name=decision value=delete>Delete</button></form></td></tr>" for r in rows)
    return ("<p class=mut>Saved but not counted in any typical price or index until you decide. Count honest ones "
            "(e.g. someone abroad paying for a project at home); delete the rest.</p><div class=tw><table><tr><th>Date</th>"
            f"<th>Country</th><th>Item</th><th>Price</th><th>Town</th><th>Why held</th><th></th></tr>{body}</table></div>")


@app.post("/admin/report/{rid}")
def admin_report(request: Request, rid: int, decision: str = Form(...)):
    if not _is_admin(request):
        return RedirectResponse("/admin", status_code=303)
    people().release_report(rid, keep=decision == "count")
    return RedirectResponse("/admin#held", status_code=303)


@app.get("/admin/usage", response_class=HTMLResponse)
def admin_usage(request: Request, days: int = 30):
    """How people use the site: visits, returning share, funnel, pages, countries, languages, referrers."""
    if not _is_admin(request):
        return RedirectResponse("/admin", status_code=303)
    from datetime import date as _date, timedelta as _td
    days = days if days in (7, 30, 90) else 30
    end = _date.today()
    start = end - _td(days=days - 1)
    u = usage().usage_report(start.isoformat(), end.isoformat())
    pct = lambda a, b: f"{100 * a / b:.0f}%" if b else "–"
    first = u["funnel"][0][1]
    funnel = "".join(f"<tr><td>{e(n)}</td><td>{c:,}</td><td>{pct(c, first)}</td>"
                     f"<td><div style='background:#0a7f73;height:10px;width:{(100 * c / first) if first else 0:.0f}%'></div></td></tr>"
                     for n, c in u["funnel"])
    tab = lambda rows, k, h: ("".join(f"<tr><td>{e(str(r[k]))}</td><td>{r['n']:,}</td></tr>" for r in rows)
                              or "<tr><td colspan=2 class=mut>None yet</td></tr>")
    names = {c: COUNTRIES[c]["country"] for c in COUNTRIES}
    ctry = [dict(r, country=names.get(r["country"], r["country"])) for r in u["countries"]]
    ret = f"{100 * u['returning']:.0f}%" if u["returning"] is not None else "–"
    pick = " · ".join(f"<a href='/admin/usage?days={d}'>{'<b>' if d == days else ''}{d} days{'</b>' if d == days else ''}</a>" for d in (7, 30, 90))
    return page("Usage", f"""<div class=card><h1>How people use the site</h1><p>{pick}</p>
<p class=mut>Counted without cookies or IP addresses; visitors who ask not to be tracked are not counted. A visitor id lasts one day,
so the same person on two days counts twice; "returning" comes from a yes/no flag the browser keeps, not an id.</p>
<div class=tw><table><tr><th>Visitors (per day, added up)</th><th>Page views</th><th>Views from returning browsers</th><th>Prices reported</th></tr>
<tr><td><b>{u['visitor_days']:,}</b></td><td><b>{u['views']:,}</b></td><td><b>{ret}</b></td><td><b>{u['funnel'][-1][1]:,}</b></td></tr></table></div>
{_bars(u['days'])}</div>
<div class=card><h2>How far visits get</h2><p class=mut>Each step counts visitors (per day) who reached it. The biggest drop is where to improve.</p>
<div class=tw><table><tr><th>Step</th><th>Visitors</th><th>of all</th><th></th></tr>{funnel}</table></div></div>
<div class=card><h2>Pages</h2><div class=tw><table><tr><th>Page</th><th>Views</th></tr>{tab(u['pages'], 'path', 'Page')}</table></div>
<h2>Countries chosen</h2><div class=tw><table><tr><th>Country</th><th>Times</th></tr>{tab(ctry, 'country', 'Country')}</table></div>
<h2>Actions</h2><div class=tw><table><tr><th>Action</th><th>Times</th></tr>{tab(u['actions'], 'kind', 'Action')}</table></div>
<h2>Languages</h2><div class=tw><table><tr><th>Language</th><th>Visitors</th></tr>{tab(u['langs'], 'lang', 'Language')}</table></div>
<h2>Where visitors come from</h2><div class=tw><table><tr><th>Site</th><th>Views</th></tr>{tab(u['refs'], 'ref', 'Site')}</table></div></div>""")


def problems_html() -> str:
    """Problems from the automatic runs (last 3 days) and the robot visitor's last check."""
    from datetime import datetime as _dt, timedelta as _td, timezone as _tz
    out = []
    f = ROOT / "data" / "live" / "organiser_alerts.json"
    if f.exists():
        cut = (_dt.now(_tz.utc) - _td(days=3)).isoformat()
        recent = [a for a in json.loads(f.read_text()).get("alerts", []) if a["utc"] >= cut]
        out += [f"<li>{e(a['utc'][:16].replace('T', ' '))} UTC · {e(a['job'])}: {e('; '.join(a['problems']))}</li>" for a in recent[:10]]
    sc = ROOT / "data" / "live" / "site_check.json"
    site = ""
    if sc.exists():
        r = json.loads(sc.read_text())
        items = "".join(f"<li>{e(x)}</li>" for x in r["problems"][:20]) + "".join(f"<li class=mut>{e(x)}</li>" for x in r["warnings"])
        site = (f"<h2>Robot visitor</h2><p class={'err' if r['status'] == 'fail' else 'mut'}>Last run {e(r['run'])}: opened {r['pages_opened']} "
                f"page views at {e(r['site'])}; {len(r['problems'])} problems, {len(r['warnings'])} warnings.</p>{'<ul>' + items + '</ul>' if items else ''}")
    import re as _re
    tl = ROOT / "data" / "live" / "launchd-tunnel.log"           # Mac install: the current public link
    links = _re.findall(r"https://[a-z0-9-]+\.trycloudflare\.com", tl.read_text(errors="replace")) if tl.exists() else []
    link = f"<p>Public link now: <a href='{e(links[-1])}' target=_blank rel=noopener>{e(links[-1])}</a> (changes when the tunnel restarts)</p>" if links else ""
    head = link + (f"<p class=err><b>Problems in the last 3 days</b></p><ul>{''.join(out)}</ul>" if out
            else "<p class=ok>No problems in the automatic runs in the last 3 days.</p>")
    return head + site


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


@app.post("/admin/scout/{pid}")
def admin_scout(request: Request, pid: int, decision: str = Form(...)):
    if not _is_admin(request):
        return RedirectResponse("/admin", status_code=303)
    p = people().decide_proposal(pid, decision == "approve")
    if p and decision == "approve":
        import scout
        import official_prices
        scout.approve_to_curated(p)
        official_prices.merge_curated()                 # in the site's data at the next refresh (every 3 hours)
    return RedirectResponse("/admin#scout", status_code=303)


@app.post("/admin/pro-code")
def admin_pro_code(request: Request, email: str = Form(...)):
    if not _is_admin(request):
        return RedirectResponse("/admin", status_code=303)
    if email.strip().lower() not in people().pro_codes():
        people().issue_pro_code(email)
    return RedirectResponse("/admin", status_code=303)


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
        # Where the report was sent from, per Cloudflare (absent when the site is reached directly). From another
        # country it is kept but held for review: honest cases exist (paying from abroad, roaming, VPNs).
        seen = request.headers.get("cf-ipcountry", "").upper()[:2]
        own = (TOWNS.get(country) or {}).get("iso2", "")
        hold = ("sent through Tor" if seen == "T1" else f"sent from another country: {seen}"
                if seen and seen != "XX" and own and seen != own else "")
        rid = people().add_report(_anon(request), country, str(d.get("item", "")), float(d.get("price", 0)),
                                  str(d.get("location", ""))[:80], str(d.get("supplier", ""))[:60],
                                  note=("public; contact: " + str(d.get("contact", ""))[:80]) if d.get("contact") else "public",
                                  items=items, on=_paid_on(d.get("months_ago", 0)), seen_from=seen, hold=hold,
                                  town_list=(TOWNS.get(country) or {}).get("towns"))
        held = bool(people().db.execute("SELECT held FROM price_reports WHERE id=?", (rid,)).fetchone()[0])
        if request.headers.get("dnt") != "1":                  # last step of the usage funnel (no cookies, no IP kept)
            usage().record("/report.html", "price", visitor_id(SALT, _ip(request), request.headers.get("user-agent", "")),
                           country=country)
        return {"ok": True, "id": rid, "held": held}
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
    agent = request.headers.get("user-agent", "")
    if any(w in agent.lower() for w in ("headless", "bot", "crawler", "spider", "lighthouse")):
        return {"ok": True}                                  # robots (incl. our own site check) are not visitors
    try:
        d = json.loads((await request.body()) or b"{}")
        from urllib.parse import urlparse
        ref = urlparse(str(d.get("ref", ""))).hostname or ""
        if ref == request.url.hostname:
            ref = ""                                         # internal navigation is not a referrer
        usage().record(str(d.get("path", "/")), str(d.get("kind", "view")),
                       visitor_id(SALT, ip, request.headers.get("user-agent", "")),
                       lang=str(d.get("lang", "")), ref=ref, country=str(d.get("country", "")),
                       ret=d.get("ret") if d.get("ret") in (0, 1) else None)
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


@app.post("/api/public/waitlist")
async def public_waitlist(request: Request):
    """Interest in CiO Costs Pro: email (+ optional organisation and role); consent required."""
    if PUBLIC_LIMIT.blocked(_ip(request)):
        return JSONResponse({"ok": False, "error": "Too many requests; try later."}, status_code=429)
    PUBLIC_LIMIT.fail(_ip(request))
    try:
        d = await request.json()
        if not d.get("consent"):
            raise ReportError("please tick the box so we may email you about Pro")
        country = str(d.get("country", ""))
        wid = people().join_waitlist(str(d.get("email", "")), str(d.get("org", "")), str(d.get("role", "")),
                                     country if country in LIVE else "", str(d.get("feature", "ipc"))[:40])
        return {"ok": True, "id": wid}
    except (ReportError, ValueError, TypeError) as err:
        return JSONResponse({"ok": False, "error": str(err)}, status_code=400)


# ------------------------------------------------- contract reader (Pro) --
FREE_READS = 1          # per person (anonymous IP hash) per day, to try it during the pilot
PRO_READS = 20          # per Pro code per day
ALL_READS = 60          # everyone together per day: protects the monthly budget


@app.post("/api/pro/contract")
async def pro_contract(request: Request, file: UploadFile = File(...), country: str = Form(...),
                       options: str = Form("{}"), code: str = Form("")):
    """The price adjustment data in an uploaded contract, with the words and page for each value.
    The file is read in memory and never stored."""
    def no(msg: str, status: int = 400):
        return JSONResponse({"ok": False, "error": msg}, status_code=status)
    if not claude.enabled():
        return no("The contract reader is not switched on yet. Join the Pro waitlist below and we will tell you when it is.", 503)
    if country not in LIVE:
        return no("unknown country")
    db = people()
    pro = db.pro_code_ok(code)
    who = code.strip().upper() if pro else _anon(request)
    if db.ai_spend() >= claude.MONTHLY_USD or db.ai_uses_today("contract") >= ALL_READS:
        return no("The contract reader has reached its limit for now. Please try again tomorrow.", 429)
    if code and not pro:
        return no("That Pro code is not valid.")
    if db.ai_uses_today("contract", who) >= (PRO_READS if pro else FREE_READS):
        return no("You have used today's free reading. Join the Pro waitlist for more." if not pro
                  else f"You have used today's {PRO_READS} readings.", 429)
    try:
        opts = {str(k)[:40]: str(v)[:80] for k, v in json.loads(options or "{}").items()}
    except (ValueError, AttributeError):
        opts = {}
    pdf = await file.read(contract_reader.MAX_BYTES + 1)
    try:
        out, usd = contract_reader.read(pdf, country, dict(list(opts.items())[:60]))
    except (contract_reader.ReadError, claude.AIError) as err:
        return no(str(err))
    db.log_ai("contract", who, round(usd, 4), country)
    return {"ok": True, "pro": pro, **out}


# The public site (built into public/ by src/site/build_index.py) is served at the root.
# Only that folder is exposed: never the repository, raw data or the database.
PUBLIC_DIR = ROOT / "public"
if PUBLIC_DIR.exists():
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")

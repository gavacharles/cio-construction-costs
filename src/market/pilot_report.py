"""
pilot_report.py — the monthly pilot report: is CiO Costs working in the pilot countries?

    python src/market/pilot_report.py                 # this month so far
    python src/market/pilot_report.py --month 2026-11 # a given month
Writes data/live/reports/pilot_<month>.html (also served to organisers at /admin/pilot-report).

Sections: headline scorecard against the pilot goals · price reports by country and item (anyone can contribute;
no accounts) · forecast accuracy (logged forecasts against official releases, plus the benchmark country) · site use.
"""
from __future__ import annotations

import argparse
import calendar
import csv
import html
import json
import os
import sqlite3
import sys
from datetime import date, timedelta
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).parent))
from reports import CAPITALS, MIN_REPORTERS, Participants, week_of   # noqa: E402
from usage import Usage                                               # noqa: E402

DEFAULT_DB = os.environ.get("CIO_DB") or str(ROOT / "data" / "live" / "exchange.sqlite")
ITEMS_GOAL = 5          # main items per country that should reach MIN_REPORTERS a week in the capital
e = html.escape


def site_cfg() -> dict:
    f = ROOT / "config" / "site.yaml"
    return (yaml.safe_load(f.read_text()) or {}) if f.exists() else {}


def live_countries() -> list[str]:
    """Countries open on the public site (the pilot list), plus the benchmark country."""
    c = site_cfg()
    return list(c.get("pilot_countries") or ["uganda", "kenya", "south_africa"]) + list(c.get("benchmark_countries") or [])


def pilot_countries() -> list[str]:
    return list(site_cfg().get("pilot_countries") or ["uganda", "kenya", "south_africa"])


def country_cfg(key: str) -> dict:
    return yaml.safe_load((ROOT / "countries" / key / "config.yaml").read_text())


def month_bounds(month: str) -> tuple[str, str]:
    y, m = int(month[:4]), int(month[5:7])
    return f"{month}-01", f"{month}-{calendar.monthrange(y, m)[1]:02d}"


def _rows(db: sqlite3.Connection, sql: str, *a) -> list[dict]:
    try:
        return [dict(r) for r in db.execute(sql, a)]
    except sqlite3.OperationalError:          # table not created yet (e.g. no trades before the market opens)
        return []


def _ym(base: str) -> str:
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    try:
        return (f"{base[-4:]}-{3 * (int(base[1]) - 1) + 1:02d}" if base.startswith("Q")
                else f"{base[-4:]}-{months.index(base[:3]) + 1:02d}")
    except (ValueError, IndexError):
        return ""


def accuracy(key: str) -> list[dict]:
    """Logged forecasts whose target month now has an official figure: inside the 8-in-10 range or not."""
    f, fj = ROOT / "data" / "live" / "forecast_log" / f"{key}.csv", ROOT / "countries" / key / "outputs" / "forecast_latest.json"
    if not f.exists() or not fj.exists():
        return []
    sp = json.loads(fj.read_text()).get("spark") or {}
    lvl = dict(zip(sp.get("dates") or [], sp.get("values") or []))
    out, seen = [], set()
    for r in sorted(csv.DictReader(open(f)), key=lambda r: r["made"]):
        b, t = _ym(r["base"]), r["target"]
        if (b, t) in seen or b not in lvl or t not in lvl or t <= b:
            continue
        seen.add((b, t))
        act = (lvl[t] / lvl[b] - 1) * 100
        out.append({"made": r["made"], "target": t, "median": float(r["median"]), "lo": float(r["lo"]), "hi": float(r["hi"]),
                    "actual": act, "inside": float(r["lo"]) <= act <= float(r["hi"])})
    return out


def build(db_path: str, month: str) -> str:
    start, end = month_bounds(month)
    pilot = pilot_countries()
    weeks = sorted({week_of(date.fromisoformat(start) + timedelta(days=i))
                    for i in range((date.fromisoformat(end) - date.fromisoformat(start)).days + 1)})
    db = sqlite3.connect(db_path)
    db.row_factory = sqlite3.Row
    with Participants(db_path):            # makes sure the tables exist
        pass

    # ---- price reports (anyone can contribute; typical prices pool the month, not single weeks)
    rep_rows, items_ok = [], {}
    earlier = {r["handle"] for r in _rows(db, "SELECT DISTINCT handle FROM price_reports WHERE substr(ts,1,10) < ? AND held IS NULL", start)}
    for k in pilot:
        cfg = country_cfg(k)
        items = cfg.get("price_items", [])
        df = _rows(db, "SELECT handle, item, area FROM price_reports WHERE country=? AND substr(ts,1,10) BETWEEN ? AND ? AND held IS NULL", k, start, end)
        people = {r["handle"] for r in df}
        ok_items = 0
        for it in items[:ITEMS_GOAL]:
            mine = [r for r in df if r["item"] == it["code"]]
            cap = {r["handle"] for r in mine if r["area"] in (None, "capital")}
            ok_items += len(cap) >= MIN_REPORTERS
            rep_rows.append((cfg["country"], it["name"], len(mine), len({r["handle"] for r in mine}), len(cap)))
        items_ok[k] = (ok_items, len(df), len(people), len(people & earlier))

    # ---- forecast accuracy (official countries only)
    acc = {k: [a for a in accuracy(k) if a["target"] <= month] for k in pilot}
    acc_all = [a for v in acc.values() for a in v]
    inside = (sum(a["inside"] for a in acc_all) / len(acc_all)) if acc_all else None

    # ---- contributors: everyone who reported this month, and how many came back from an earlier month
    contributors = sum(v[2] for v in items_ok.values())
    returning = sum(v[3] for v in items_ok.values())
    ret_share = returning / contributors if contributors else None

    # ---- benchmark: the same tool on timely official data (walk-forward test over the last 48 months)
    bench = []
    for k in site_cfg().get("benchmark_countries") or []:
        fj = ROOT / "countries" / k / "outputs" / "forecast_latest.json"
        b = (json.loads(fj.read_text()).get("benchmark") or {}) if fj.exists() else {}
        if b:
            bench.append(f"<tr><td>{e(country_cfg(k)['country'])}</td><td>{b['1']['inside']:.0%} / {b['3']['inside']:.0%}</td>"
                         f"<td>{b['1']['mae']:.2f} vs {b['1']['mae_nochange']:.2f}</td><td>{b['1']['n']}</td></tr>")

    # ---- site use and alerts
    with Usage(db_path) as u:
        use = u.summary(start, end)
    alerts = _rows(db, "SELECT country, COUNT(*) n FROM alerts WHERE substr(created,1,10) BETWEEN ? AND ? GROUP BY country", start, end)

    # ---- scorecard
    def goal(name, value, target, ok):
        mark = "–" if ok is None else ("✓" if ok else "✗")
        return f"<tr><td>{name}</td><td><b>{value}</b></td><td>{target}</td><td class=m>{mark}</td></tr>"
    items_hit = sum(v[0] for v in items_ok.values())
    score = "".join([
        goal("Main items with a typical price (3+ people in the capital this month)", f"{items_hit} of {ITEMS_GOAL * len(pilot)}",
             f"{ITEMS_GOAL} per country", items_hit >= ITEMS_GOAL * len(pilot) if any(v[1] for v in items_ok.values()) else None),
        goal("People who contributed prices", f"{contributors:,}", "growing month on month", None),
        goal("Contributors who came back (reported in an earlier month too)", "–" if ret_share is None else f"{ret_share:.0%}",
             "30% or more", None if ret_share is None else ret_share >= 0.3),
        goal("Forecasts inside the likely range", "–" if inside is None else f"{inside:.0%} ({len(acc_all)} checked)", "about 80%",
             None if inside is None else inside >= 0.7),
        goal("Site visits (visitor-days)", f"{use['visitor_days']:,}", "growing month on month", None),
    ])

    rep_html = "".join(f"<tr><td>{e(c)}</td><td>{e(i)}</td><td>{n}</td><td>{p}</td><td>{w}{' ✓' if w >= MIN_REPORTERS else ''}</td></tr>"
                       for c, i, n, p, w in rep_rows)
    country_html = "".join(f"<tr><td>{e(country_cfg(k)['country'])}</td><td>{v[1]}</td><td>{v[2]}</td><td>{v[3]}</td><td>{v[0]} of {ITEMS_GOAL}</td>"
                           f"<td>{next((a['n'] for a in alerts if a['country'] == k), 0)}</td></tr>" for k, v in items_ok.items())
    acc_html = "".join(f"<tr><td>{e(country_cfg(k)['country'])}</td><td>{a['made']}</td><td>{a['target']}</td><td>{a['median']:+.1f}% "
                       f"({a['lo']:+.1f} to {a['hi']:+.1f})</td><td>{a['actual']:+.1f}%</td><td class=m>{'✓' if a['inside'] else '✗'}</td></tr>"
                       for k, v in acc.items() for a in v[-3:]) or "<tr><td colspan=6>No logged forecast has reached an official release yet.</td></tr>"
    lst = lambda rows, a, b: "".join(f"<tr><td>{e(str(r[a]))}</td><td>{r[b]:,}</td></tr>" for r in rows) or "<tr><td colspan=2>None yet</td></tr>"
    names = ", ".join(country_cfg(k)["country"] for k in pilot)
    return f"""<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>CiO Costs pilot report — {month}</title><style>
body{{font:15px/1.55 system-ui,-apple-system,'Segoe UI',sans-serif;color:#15171a;background:#f4f7fa;margin:0}}main{{max-width:960px;margin:0 auto;padding:28px 18px}}
h1{{margin:0 0 4px}}h2{{margin:28px 0 8px;font-size:1.15rem;color:#8a6600;text-transform:uppercase;letter-spacing:.04em}}
table{{border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden;font-size:14px}}th,td{{text-align:left;padding:7px 10px;border-bottom:1px solid #e1e6ec}}
th{{background:#eef2f6;font-weight:600}}td.m{{font-size:17px;text-align:center}}.muted{{color:#5f646b}}.grid{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
@media(max-width:700px){{.grid{{grid-template-columns:1fr}}}}@media print{{body{{background:#fff}}}}</style></head><body><main>
<h1>CiO Costs — pilot report, {calendar.month_name[int(month[5:])]} {month[:4]}</h1>
<p class=muted>Pilot countries: {e(names)}. Period {start} to {end}. Generated {date.today().isoformat()}.</p>
<h2>Scorecard</h2><table><tr><th>Goal</th><th>This month</th><th>Target</th><th></th></tr>{score}</table>
<h2>By country</h2><table><tr><th>Country</th><th>Price reports</th><th>People reporting</th><th>Came back</th><th>Main items with a typical price</th>
<th>Alerts set</th></tr>{country_html}</table>
<h2>Price reports by item</h2><table><tr><th>Country</th><th>Item</th><th>Reports</th><th>People</th><th>People in the capital (3 needed)</th></tr>{rep_html}</table>
<h2>Forecast accuracy</h2><p class=muted>Each forecast saved on the site, checked against the official figure once it is published (Uganda, Kenya and
South Africa have official indexes; the other pilot countries are checked against reported prices on the site).</p>
<table><tr><th>Country</th><th>Forecast made</th><th>For</th><th>We said (likely range)</th><th>Official</th><th>Inside</th></tr>{acc_html}</table>
<h2>Benchmark</h2><p class=muted>The same forecasting tool on a country whose official index is published monthly and on time.</p>
<table><tr><th>Country</th><th>Inside the likely range (1 / 3 months ahead; aim 80%)</th><th>Average miss, 1 month (points) vs "no change"</th><th>Months tested</th></tr>
{"".join(bench) or "<tr><td colspan=4>No benchmark yet.</td></tr>"}</table>
<h2>Site use</h2><p>{use['views']:,} page views · {use['visitor_days']:,} visitor-days (each visitor counted once a day; no cookies or IP addresses kept).</p>
<div class=grid><table><tr><th>Top pages</th><th>Views</th></tr>{lst(use['pages'], 'path', 'n')}</table>
<table><tr><th>Actions</th><th>Count</th></tr>{lst(use['actions'], 'kind', 'n')}</table>
<table><tr><th>Language</th><th>Visitor-days</th></tr>{lst(use['langs'], 'lang', 'n')}</table>
<table><tr><th>Came from</th><th>Views</th></tr>{lst(use['refs'], 'ref', 'n')}</table></div>
</main></body></html>"""


def save(db_path: str, month: str) -> Path:
    out = ROOT / "data" / "live" / "reports" / f"pilot_{month}.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(build(db_path, month), encoding="utf-8")
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--month", default=date.today().strftime("%Y-%m"))
    ap.add_argument("--db", default=DEFAULT_DB)
    a = ap.parse_args()
    print(f"wrote {save(a.db, a.month)}")

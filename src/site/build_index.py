#!/usr/bin/env python3
"""
build_index.py — build the public CiO Costs site from the latest forecasts.

Pages (all open straight from disk; no server, no internet):
  index.html                    front page: date picker, featured question, costs at a glance, country cards
  countries/<c>/index.html      one page per country: what is happening to costs, by material, and the outlook
  play.html                     The Cost Call — a daily game on real price data, plus this week's calls
  method.html                   how it works, briefly
  assets/cio.css, assets/cio.js shared style (CiO brand, fonts embedded) and behaviour

Data: countries/<c>/outputs/forecast_latest.json (weekly_note.py), refreshed every 3 hours by
`cycle.py refresh`. Public pages only: no internal files, paths or model internals.

    python src/site/build_index.py
"""
from __future__ import annotations

import html
import json
import math
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "src" / "market"))

from country import load_country, list_countries   # noqa: E402

e = html.escape
REGION = {"uganda": "east", "kenya": "east", "rwanda": "east", "tanzania": "east", "ethiopia": "east",
          "south_africa": "south", "zambia": "south", "botswana": "south", "malawi": "south", "zimbabwe": "south",
          "namibia": "south", "mozambique": "south", "mauritius": "south",
          "ghana": "west", "nigeria": "west", "senegal": "west", "egypt": "north", "morocco": "north"}
REGION_NAME = {"east": "East Africa", "south": "Southern Africa", "west": "West Africa", "north": "North Africa"}
ISO2 = {"UGA": "UG", "KEN": "KE", "RWA": "RW", "TZA": "TZ", "ETH": "ET", "ZAF": "ZA", "ZMB": "ZM", "BWA": "BW",
        "MWI": "MW", "ZWE": "ZW", "NAM": "NA", "MOZ": "MZ", "MUS": "MU", "GHA": "GH", "NGA": "NG", "SEN": "SN",
        "EGY": "EG", "MAR": "MA"}
SOURCE = {"uganda": "Uganda Bureau of Statistics (UBOS)", "kenya": "Kenya National Bureau of Statistics (KNBS)",
          "south_africa": "Statistics South Africa (Stats SA)"}


def flag(iso3: str) -> str:
    return "".join(chr(0x1F1E6 + ord(c) - 65) for c in ISO2.get(iso3, ""))


def month_label(m: str) -> str:
    y, mo = m.split("-")
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][int(mo) - 1] + " " + y


# ------------------------------------------------------------------ data --
def country_data(key: str) -> dict | None:
    cfg = load_country(key)
    f = ROOT / "countries" / key / "outputs" / "forecast_latest.json"
    if not f.exists():
        return None
    d = json.loads(f.read_text(encoding="utf-8"))
    paths = d.get("paths") or {}
    if not paths:
        return None
    head = next(iter(paths))
    notes = sorted((ROOT / "countries" / key / "notes").glob(f"weekly_{key}_*.html"))
    off = cfg.get("official_reading")
    return {
        "key": key, "country": cfg["country"], "flag": flag(cfg["iso3"]), "currency": cfg["currency"],
        "region": REGION.get(key, ""), "kind": d.get("kind"), "official": d.get("kind") != "pressure",
        "base": d.get("base", ""), "head": head, "paths": paths, "spark": d.get("spark"),
        "materials": (d.get("materials") or {}).get("items", []), "step": (d.get("materials") or {}).get("step", "month"),
        "drivers": d.get("drivers", {}), "generated": d.get("generated", ""),
        "source": SOURCE.get(key) or (off["series"].split(",")[0] if off else None),
        "reading": ({"series": off["series"].split(",")[0], "period": str(off["period"]),
                     "year": off.get("change_year_pct"), "period_change": off.get("change_period_pct")} if off else None),
        "note": f"notes/{notes[-1].name}" if notes else None,
        "items": [i["name"] for i in cfg.get("price_items", [])],
    }


def crowd(key: str) -> list[dict]:
    db = ROOT / "data" / "live" / "exchange.sqlite"
    if not db.exists():
        return []
    try:
        from reports import Participants
        with Participants(db) as p:
            s = p.crowd_summary(key, load_country(key).get("price_items", []))
        return [r for r in s.to_dict("records") if r.get("reports")]
    except Exception:
        return []


def months_ahead(n: int = 12) -> list[str]:
    t = date.today()
    out = []
    for i in range(1, n + 1):
        y, m = t.year + (t.month - 1 + i) // 12, (t.month - 1 + i) % 12 + 1
        out.append(f"{y}-{m:02d}")
    return out


# ----------------------------------------------------------------- shell --
LOGO = ("<svg class=logo viewBox='0 0 24 24' width=24 height=24 aria-hidden=true><circle class=ring cx=12 cy=12 r=9.5 "
        "fill=none stroke='var(--accent-fill)' stroke-width=2 stroke-linecap=round pathLength=100 stroke-dasharray='62 38'/>"
        "<circle class=orbit cx=12 cy=2.5 r=1.6 fill='var(--teal)'/><circle class=core cx=12 cy=12 r=4 fill='var(--accent-fill)'/></svg>")


def shell(title: str, body: str, data: dict, rel: str = "", page: str = "", desc: str = "") -> str:
    nav = [("index.html#countries", "Countries", "home"), ("index.html#glance", "Costs at a glance", "glance"),
           ("play.html", "The Cost Call", "play"), ("method.html", "How it works", "method")]
    links = "".join(f"<a href='{rel}{h}'{' aria-current=page' if p == page else ''}>{t}</a>" for h, t, p in nav)
    payload = json.dumps(data, separators=(",", ":")).replace("</", "<\\/")
    return f"""<!doctype html>
<html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name=description content="{e(desc or 'Construction cost forecasts for 18 African countries.')}">
<link rel=stylesheet href="{rel}assets/cio.css"></head><body data-page="{page}" data-rel="{rel}">
<header class=topbar><div class=wrap>
 <a class=mark href="{rel}index.html">{LOGO}CiO <span>Costs</span></a>
 <nav class=nav aria-label=Main>{links}</nav>
 <a class="btn primary cta" href="{rel}index.html#join">Join the pilot</a>
 <button class=theme id=theme type=button aria-label=Theme>◐</button>
</div></header>
<main class=wrap>{body}</main>
<footer class=wrap>CiO Lab · Forecasts are estimates with ranges, not advice. The Cost Call is a game: points have no cash
value. Official data: UBOS, KNBS, Stats SA, GSS, ZimStat, ANSD, Statistics Mauritius; oil and exchange rates from public
market sources. Updated {e(data.get('updated', ''))}.</footer>
<script id=cio-data type="application/json">{payload}</script>
<script src="{rel}assets/cio.js"></script></body></html>
"""


def picker(months: list[str], default: str) -> str:
    opts = "".join(f"<option value={m}{' selected' if m == default else ''}>{month_label(m)}</option>" for m in months)
    return (f"<label class=when><span>Forecast to</span><select id=when aria-label='Forecast to month'>{opts}</select></label>")


# ------------------------------------------------------------------ pages --
def page_index(cs: list[dict], months: list[str], default: str) -> str:
    feat = next((c for c in cs if c["key"] == "uganda"), cs[0])
    tabs = [("all", "All"), ("east", "East Africa"), ("south", "Southern Africa"), ("west", "West Africa"),
            ("north", "North Africa"), ("official", "Official price index"), ("indicator", "Import-cost indicator"),
            ("rising", "Rising"), ("easing", "Easing")]
    tab_html = "".join(f"<button type=button data-tab={k} aria-pressed={'true' if k == 'all' else 'false'}>{v}</button>"
                       for k, v in tabs)
    cards = "".join(f"""<article class=card data-key={c['key']} data-region={c['region']}
 data-type={'official' if c['official'] else 'indicator'} data-search="{e(' '.join([c['country'], c['currency'], REGION_NAME.get(c['region'], ''), *c['items'], *(m['name'] for m in c['materials'])]).lower())}">
 <div class=card-top><span class=flag aria-hidden=true>{c['flag']}</span><a class=country href="countries/{c['key']}/index.html">{e(c['country'])}</a>
 <span class=chip>{'Official price index' if c['official'] else 'Import-cost indicator'}</span></div>
 <h3 class=q data-q></h3>
 <div class=odds><div><span class=pct data-pct>–</span><span class=pct-l>chance of a rise</span></div><div class=spark-slot data-spark></div></div>
 <div class=pbar><span data-bar></span></div>
 <dl class=facts><div><dt>Expected change</dt><dd data-exp>–</dd></div><div><dt>Likely range (8 in 10)</dt><dd data-rng>–</dd></div></dl>
 <p class=advice data-advice></p>
 <div class=card-foot><a class='btn primary' href="countries/{c['key']}/index.html">See costs in {e(c['country'])} <span aria-hidden=true>→</span></a>
 <a class=link href="play.html#{c['key']}">Make your call</a></div></article>""" for c in cs)
    glance = "".join(f"""<tr data-key={c['key']}><th scope=row><a href="countries/{c['key']}/index.html">{c['flag']} {e(c['country'])}</a></th>
 <td>{e(c['base'])}</td><td data-g=official>{'–' if not c['reading'] and not c['materials'] else ''}</td><td data-g=exp></td><td data-g=rng></td>
 <td data-g=pct></td><td data-g=fx></td></tr>""" for c in cs)
    body = f"""
<section class=hero><div><p class=eyebrow>Construction cost outlook · 18 African countries</p>
 <h1>Will building costs rise where you work?</h1>
 <p class=lede>Pick a month. See the chance that construction input prices rise, how much, and what is driving it —
 from official statistics, oil and exchange rates, updated every few hours.</p></div>
 <div class=hero-side>{picker(months, default)}<p class=muted id=when-note>Changes are measured from each country's latest
 official reading (or from today for import-cost indicators).</p></div></section>

<section class=featured data-key={feat['key']} aria-labelledby=fq>
 <div class=feat-main><div class=card-top><span class=flag aria-hidden=true>{feat['flag']}</span>
 <a class=country href="countries/{feat['key']}/index.html">{e(feat['country'])}</a><span class=chip>Featured</span></div>
 <h2 id=fq class=feat-q data-q></h2>
 <div class=feat-odds><div><span class=pct data-pct>–</span><span class=pct-l>chance of a rise</span></div>
 <div><span class='pct small' data-exp>–</span><span class=pct-l>expected change</span></div>
 <div><span class='pct small' data-rng>–</span><span class=pct-l>likely range (8 in 10)</span></div></div>
 <div class=pbar><span data-bar></span></div><div class=chart data-chart></div>
 <p class='advice big' data-advice></p>
 <div class=actions><a class='btn primary' href="countries/{feat['key']}/index.html">See costs by material</a>
 <a class=btn href="play.html">Play The Cost Call</a></div></div>
 <aside class=feat-side><h3>By material, to <span data-when-label></span></h3><ul class=breakdown data-breakdown></ul></aside>
</section>

<nav class=tabs id=countries aria-label="Filter countries">{tab_html}</nav>
<div class=toolbar><label class=search><span class=sr-only>Search</span>
 <input id=q type=search placeholder="Search a country, material or currency — e.g. cement" autocomplete=off></label>
 <span class=count id=count aria-live=polite></span></div>
<div class=grid id=grid>{cards}</div>
<p class=empty id=empty>No country matches. Try “cement”, “Kenya” or “West”.</p>

<section id=glance><div class=section-h><h2>Costs at a glance</h2><span class=muted>Click a column to sort</span></div>
<div class=tablewrap><table class=glance id=glance-table><thead><tr><th scope=col data-sort=text>Country</th>
<th scope=col data-sort=text>Latest official</th><th scope=col data-sort=num>Official change, year</th>
<th scope=col data-sort=num>Expected by <span data-when-label></span></th><th scope=col>Likely range</th>
<th scope=col data-sort=num>Chance of a rise</th><th scope=col data-sort=num>Currency vs USD, 13 weeks</th></tr></thead>
<tbody>{glance}</tbody></table></div></section>

<section class=gamebox><div><p class=eyebrow>New · daily game</p><h2>The Cost Call</h2>
<p>Five quick calls a day on real construction prices across Africa. Did cement go up or down? Keep your streak, share
your score, and test your instincts against the model.</p></div>
<a class='btn primary big' href=play.html>Play today's calls</a></section>

<section class=howto><div class=tile><span class=num>1</span><b>Chance of a rise</b><p>How likely prices are to be higher
by the month you picked. 80% means about 8 times in 10.</p></div>
<div class=tile><span class=num>2</span><b>Expected change</b><p>The most likely move. Apply it to your own latest quote
for the same item.</p></div><div class=tile><span class=num>3</span><b>Likely range</b><p>Where the change should land
8 times in 10. Wider ranges mean more uncertainty.</p></div>
<div class=tile><span class=num>4</span><b>Updated every few hours</b><p>Forecasts move with oil prices, exchange rates and
new official data. <a href=method.html>How it works</a>.</p></div></section>

<section class=join id=join><div><h2>Join the pilot</h2><p>Contractors, quantity surveyors, developers and lenders: report
the prices you pay each week, play The Cost Call for points on the leaderboard, and get the Monday note for your country.
Free. Ask CiO Lab for an invite code.</p></div><a class='btn primary big' href=play.html>Start with today's game</a></section>
"""
    return body


def chart_svg(c: dict, w: int = 760, h: int = 220) -> str:
    """History (official index or indicator) followed by the forecast median and its 80% band."""
    sp = c.get("spark") or {}
    hv, hd = sp.get("values") or [], sp.get("dates") or []
    path = c["paths"][c["head"]]
    if len(hv) < 2:
        return ""
    last = hv[-1]
    fv = [(q["month"], last * (1 + q["median"] / 100), last * (1 + q["lo"] / 100), last * (1 + q["hi"] / 100)) for q in path]
    allv = hv + [x for _, a, b, d in fv for x in (a, b, d)]
    lo, hi = min(allv), max(allv)
    n = len(hv) + len(fv)
    X = lambda i: 40 + i * (w - 60) / max(1, n - 1)
    Y = lambda v: h - 26 - (v - lo) * (h - 46) / ((hi - lo) or 1)
    hist = " ".join(f"{X(i):.1f},{Y(v):.1f}" for i, v in enumerate(hv))
    k0 = len(hv) - 1
    med = f"{X(k0):.1f},{Y(last):.1f} " + " ".join(f"{X(k0 + 1 + i):.1f},{Y(a):.1f}" for i, (_, a, _, _) in enumerate(fv))
    band = (f"{X(k0):.1f},{Y(last):.1f} " + " ".join(f"{X(k0 + 1 + i):.1f},{Y(d):.1f}" for i, (_, _, _, d) in enumerate(fv))
            + " " + " ".join(f"{X(k0 + 1 + i):.1f},{Y(b):.1f}" for i, (_, _, b, _) in reversed(list(enumerate(fv)))))
    xs = {m: round(X(k0 + 1 + i), 1) for i, (m, *_) in enumerate(fv)}
    ticks = "".join(f"<text x='{X(i):.1f}' y='{h - 6}' text-anchor=middle>{month_label(d)[:3]} {d[2:4]}</text>"
                    for i, d in enumerate(hd + [m for m, *_ in fv]) if i % 6 == 0)
    return (f"<svg class=fan viewBox='0 0 {w} {h}' role=img aria-label='History and forecast for {e(c['head'])}' data-xs='{json.dumps(xs)}'>"
            f"<line x1='{X(k0):.1f}' x2='{X(k0):.1f}' y1=10 y2='{h - 22}' class=nowline /><text x='{X(k0) + 4:.1f}' y=18 class=nowtext>forecast →</text>"
            f"<polygon points='{band}' class=band /><polyline points='{hist}' class=histline />"
            f"<polyline points='{med}' class=medline /><line class=marker y1=10 y2='{h - 22}' x1=0 x2=0 />{ticks}</svg>"
            f"<p class=muted>{e(sp.get('label', ''))}. Shaded: likely range (8 in 10).</p>")


def page_country(c: dict, months: list[str], default: str, crowd_rows: list[dict]) -> str:
    def yr(m):
        return "–" if m["change_year"] is None else format(m["change_year"], "+.1f") + "%"
    mats = "".join(f"<tr data-mat='{e(m['name'])}'><th scope=row>{e(m['name'])}</th><td>{m['change_period']:+.1f}%</td>"
                   f"<td>{yr(m)}</td><td data-mexp>–</td></tr>" for m in c["materials"])
    step = "quarter" if c["step"] == "quarter" else "month"
    if mats:
        mat_html = f"""<section><div class=section-h><h2>Costs by material</h2><span class=muted>Official figures,
latest {('quarter' if step == 'quarter' else 'month')}: {e(c['base'])}</span></div><div class=tablewrap><table class=glance>
<thead><tr><th scope=col>Material</th><th scope=col>Change on the previous {step}</th><th scope=col>Change on a year</th>
<th scope=col>Expected by <span data-when-label></span></th></tr></thead><tbody>{mats}</tbody></table></div></section>"""
    else:
        r = c["reading"]
        reading_txt = "."
        if r:
            yr_txt = (format(r["year"], "+.1f") + "% on a year.") if r.get("year") is not None else ""
            reading_txt = f", but the latest official reading is <b>{e(r['series'])}</b>, {e(r['period'])}: {yr_txt}"
        mat_html = f"""<section><div class=section-h><h2>Costs by material</h2></div><div class=tile><p>{e(c['country'])} does not
yet publish construction prices by material in a form we can use{reading_txt}
Prices reported by participants (below) fill the gap, material by material.</p></div></section>"""
    def ch(r):
        v = r.get("change_pct")
        return "–" if v is None or v != v else format(v, "+.1f") + "%"
    crowd_html = "".join(f"<tr><th scope=row>{e(r['name'])}</th><td>{r['median']:,.0f} {e(c['currency'])} per {e(r['unit'])}</td>"
                         f"<td>{r['reporters']}</td><td>{ch(r)}</td></tr>" for r in crowd_rows)
    crowd_sec = (f"<div class=tablewrap><table class=glance><thead><tr><th>Item</th><th>Median price</th><th>Reporters</th>"
                 f"<th>vs 4 weeks</th></tr></thead><tbody>{crowd_html}</tbody></table></div>") if crowd_rows else (
        f"<div class=tile><p>No prices reported yet for {e(c['country'])}. Pilot participants report what they pay for "
        f"{e(', '.join(c['items'][:5]).lower())} and more each week. <a href='../../index.html#join'>Join the pilot</a>.</p></div>")
    dr = c["drivers"]
    fx = (f"{e(c['currency'])} per US dollar: <b>{dr['fx']:,.1f}</b> ({'weaker' if (dr.get('fx_13w_pct') or 0) > 0 else 'stronger'} "
          f"{abs(dr.get('fx_13w_pct') or 0):.1f}% in 13 weeks)") if dr.get("fx") else ""
    note = f"<a class=btn href='{e(c['note'])}'>Read the weekly note</a>" if c["note"] else ""
    src = f"<p class=muted>Official data: {e(c['source'])}.</p>" if c["source"] else ""
    return f"""
<p class=crumbs><a href="../../index.html">All countries</a> › {e(REGION_NAME.get(c['region'], ''))}</p>
<section class="featured solo" data-key={c['key']}>
 <div class=feat-main><div class=card-top><span class='flag big' aria-hidden=true>{c['flag']}</span><h1 class=country-h>{e(c['country'])}</h1>
 <span class=chip>{'Official price index' if c['official'] else 'Import-cost indicator'}</span>{picker(months, default)}</div>
 <h2 class=feat-q data-q></h2>
 <div class=feat-odds><div><span class=pct data-pct>–</span><span class=pct-l>chance of a rise</span></div>
 <div><span class='pct small' data-exp>–</span><span class=pct-l>expected change</span></div>
 <div><span class='pct small' data-rng>–</span><span class=pct-l>likely range (8 in 10)</span></div></div>
 <div class=pbar><span data-bar></span></div>
 <div class=chart>{chart_svg(c)}</div><p class='advice big' data-advice></p>
 <div class=actions><a class='btn primary' href="../../play.html#{c['key']}">Make your call on {e(c['country'])}</a>{note}</div>{src}</div>
</section>
{mat_html}
<section><div class=section-h><h2>What is driving costs</h2></div><div class=howto>
 <div class=tile><b>Oil</b><p>Brent crude: <b>{dr.get('brent_usd', 0):,.0f} USD</b> a barrel ({'+' if (dr.get('brent_13w_pct') or 0) > 0 else ''}{(dr.get('brent_13w_pct') or 0):.1f}% in 13 weeks).
 Oil feeds diesel, transport, bitumen and plastics.</p></div>
 <div class=tile><b>Currency</b><p>{fx or 'Exchange-rate readings not available.'} A weaker currency makes imported steel, cement inputs,
 fittings and paint dearer.</p></div>
 <div class=tile><b>Official data</b><p>{e(c['base'])} is the latest period in the forecast's base. New official releases are
 added within a day of publication.</p></div></div></section>
<section><div class=section-h><h2>Prices reported by participants</h2></div>{crowd_sec}</section>
"""


def page_method() -> str:
    return """
<section class=prose><p class=eyebrow>How it works</p><h1>From official statistics to a forecast you can use</h1>
<p class=lede>CiO Costs combines official construction price statistics with the things that move construction costs
week to week, and turns them into a chance, an expected change and a likely range for each country.</p>
<div class=howto>
<div class=tile><span class=num>1</span><b>What goes in</b><p>Official construction price indices where they exist
(Uganda, Kenya and South Africa in full; latest readings for Ghana, Zimbabwe, Senegal and Mauritius), world oil prices,
exchange rates for 18 currencies, rainfall, and published tax changes such as fuel and cement duties.</p></div>
<div class=tile><span class=num>2</span><b>How it is forecast</b><p>Where a country publishes a detailed index, each
material is forecast from the drivers that move it — oil for diesel, the currency for imported steel, rainfall for sand
— and added back up the way the statistics office does. Elsewhere, an import-cost indicator tracks the share of costs
that moves with oil and the exchange rate.</p></div>
<div class=tile><span class=num>3</span><b>How it is checked</b><p>Every method is tested on years of past data, as if
it had been run at the time, and kept only if it beats simple rules of thumb. In Uganda the forecasts have been about
11–14% more accurate than a simple trend, and the likely ranges are set so that 8 in 10 past outcomes fell inside.</p></div>
<div class=tile><span class=num>4</span><b>How often it updates</b><p>Oil and exchange rates are refreshed every few hours
and the forecasts with them. Official data is added within a day of publication. A written note for each country comes
out every Monday.</p></div></div>
<h2>Reading the numbers</h2><ul class=plain>
<li><b>Chance of a rise</b>: how likely prices are to be higher by the month you pick.</li>
<li><b>Expected change</b>: the most likely move, measured from the latest official reading (or from today for
import-cost indicators).</li><li><b>Likely range</b>: where the change should land 8 times in 10.</li></ul>
<h2>Limits</h2><ul class=plain><li>Forecasts are estimates, not certainties. Always use the range.</li>
<li>Import-cost indicators see oil and currency effects only, not local materials or labour.</li>
<li>Where official statistics are published late, the forecast bridges the gap with the latest market data.</li>
<li>Nothing here is financial or contractual advice.</li></ul></section>
"""


def page_play() -> str:
    return """
<section class=play-head><div><p class=eyebrow>Daily game</p><h1>The Cost Call</h1>
<p class=lede>Five calls on real construction prices. Did each one go up or down? New calls every day.</p></div>
<div class=stats-row id=stats></div></section>
<section class=game id=game aria-live=polite></section>
<section><div class=section-h><h2>This week's calls</h2><span class=muted>On the next official releases — scored when the data
is published</span></div><div class=grid id=calls></div></section>
<p class=muted>Play for points and a place on the leaderboard in the pilot app. <a href="index.html#join">Join the pilot</a>.</p>
"""


# ------------------------------------------------------------------ build --
def build() -> Path:
    cs = [c for c in (country_data(k) for k in list_countries()) if c]
    cs.sort(key=lambda c: (not c["official"], c["country"]))
    months = months_ahead(12)
    default = months[2]
    updated = max((c["generated"] for c in cs), default=date.today().isoformat())
    slim = {c["key"]: {k: c[k] for k in ("country", "flag", "currency", "region", "kind", "official", "base", "head",
                                         "paths", "spark", "drivers", "materials", "step")} for c in cs}
    quiz = [{"key": c["key"], "country": c["country"], "flag": c["flag"], "material": m["name"], "period": p, "change": v,
             "step": c["step"]} for c in cs for m in c["materials"]
            for p, v in m.get("history", [])[-(8 if c["step"] == "quarter" else 12):] if abs(v) >= 0.2]   # recent periods only
    for c in slim.values():
        for m in c["materials"]:
            m.pop("history", None)
    base = {"updated": updated, "months": months, "default": default, "countries": slim}
    (ROOT / "assets").mkdir(exist_ok=True)
    fonts = "".join((SITE / "vendor" / f).read_text(encoding="utf-8") for f in ("clash-grotesk.css", "inter.css")
                    if (SITE / "vendor" / f).exists())
    (ROOT / "assets" / "cio.css").write_text(fonts + (SITE / "site.css").read_text(encoding="utf-8"), encoding="utf-8")
    (ROOT / "assets" / "cio.js").write_text((SITE / "site.js").read_text(encoding="utf-8"), encoding="utf-8")

    (ROOT / "index.html").write_text(shell("CiO Costs — will building costs rise?", page_index(cs, months, default), base,
                                           page="home"), encoding="utf-8")
    (ROOT / "method.html").write_text(shell("How it works — CiO Costs", page_method(), {"updated": updated}, page="method"),
                                      encoding="utf-8")
    (ROOT / "play.html").write_text(shell("The Cost Call — CiO Costs", page_play(), dict(base, quiz=quiz), page="play",
                                          desc="A daily game on real construction prices across Africa."), encoding="utf-8")
    for c in cs:
        d = ROOT / "countries" / c["key"]
        data = dict(base, countries={c["key"]: slim[c["key"]]}, focus=c["key"])
        (d / "index.html").write_text(shell(f"{c['country']} construction costs — CiO Costs",
                                            page_country(c, months, default, crowd(c["key"])), data, rel="../../",
                                            page="country", desc=f"Construction cost outlook for {c['country']}."),
                                      encoding="utf-8")
    return ROOT / "index.html"


if __name__ == "__main__":
    print("wrote", build())

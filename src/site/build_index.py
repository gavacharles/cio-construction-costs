#!/usr/bin/env python3
"""
build_index.py — build the public CiO Costs site from the latest forecasts.

Pages, written to public/ (open straight from disk, or served by the app):
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
import os
import math
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = Path(__file__).resolve().parent
OUT = ROOT / "public"            # everything public lives here; the app serves only this folder
sys.path.insert(0, str(ROOT / "src" / "market"))

from country import load_country, list_countries   # noqa: E402
import yaml                                          # noqa: E402

SITE_CFG = yaml.safe_load((ROOT / "config" / "site.yaml").read_text(encoding="utf-8")) if (ROOT / "config" / "site.yaml").exists() else {}
WA = str(SITE_CFG.get("whatsapp_number") or "").strip().lstrip("+")
FEATURED = SITE_CFG.get("glance_featured") or ["uganda", "kenya", "south_africa", "nigeria", "ghana"]
CHANNEL = str(SITE_CFG.get("whatsapp_channel_url") or "").strip()
PILOT = list(SITE_CFG.get("pilot_countries") or [])
BENCH = list(SITE_CFG.get("benchmark_countries") or [])
LIVE = PILOT + BENCH                               # only these appear on the site; the others wait for expansion


def country_options(cs: list[dict]) -> str:
    """Pilot countries first, then the rest, each alphabetical (with optgroup labels the page translates)."""
    opt = lambda grp: "".join(f"<option value={c['key']}>{c['flag']} {e(c['country'])}</option>" for c in sorted(grp, key=lambda c: c["country"]))
    pil, bench = [c for c in cs if c["key"] not in BENCH], [c for c in cs if c["key"] in BENCH]
    if not bench:
        return opt(pil)
    return f"<optgroup label='Pilot countries' data-grp=pilot>{opt(pil)}</optgroup><optgroup label='Benchmark' data-grp=bench>{opt(bench)}</optgroup>"
SITE_URL = (os.environ.get("CIO_SITE_URL") or str(SITE_CFG.get("site_url") or "")).strip().rstrip("/")
ALERTS_WA = bool(SITE_CFG.get("alerts_whatsapp"))
TIP_OFFICIAL = "Built from the country's official construction price statistics, updated with this week's oil and currency moves."
TIP_ESTIMATE = ("No usable official construction price index yet: an estimate of the pressure on imported materials "
                "from oil prices and the exchange rate. Local materials and labour are not included.")


def chip(official: bool) -> str:
    k, t, tip, tk = (("chip.officialdata", "Official data", TIP_OFFICIAL, "tip.official") if official else
                     ("chip.estimate", "Estimate", TIP_ESTIMATE, "tip.estimate"))
    return (f"<span class=chip><span data-i18n={k}>{t}</span> <span class=info tabindex=0 role=note "
            f"aria-label='{e(tip)}' data-tipkey={tk}>ⓘ<span class=tip data-i18n={tk}>{e(tip)}</span></span></span>")

e = html.escape
REGION = {"uganda": "east", "kenya": "east", "rwanda": "east", "tanzania": "east", "ethiopia": "east",
          "south_africa": "south", "zambia": "south", "botswana": "south", "malawi": "south", "zimbabwe": "south",
          "namibia": "south", "mozambique": "south", "mauritius": "south",
          "ghana": "west", "nigeria": "west", "senegal": "west", "egypt": "north", "morocco": "north"}
REGION_NAME = {"east": "East Africa", "south": "Southern Africa", "west": "West Africa", "north": "North Africa", "bench": "Benchmark"}
ISO2 = {"USA": "US", "AUT": "AT", "PHL": "PH", "BRA": "BR", "GBR": "GB", "HKG": "HK", "UGA": "UG", "KEN": "KE", "RWA": "RW", "TZA": "TZ", "ETH": "ET", "ZAF": "ZA", "ZMB": "ZM", "BWA": "BW",
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
        "region": "bench" if key in BENCH else REGION.get(key, ""), "bench": key in BENCH, "bstats": d.get("benchmark"), "kind": d.get("kind"), "official": d.get("kind") != "pressure",
        "base": d.get("base", ""), "head": head, "paths": paths, "trend": d.get("trend") or [], "trend_stats": d.get("trend_stats") or {}, "spark": d.get("spark"),
        "materials": (d.get("materials") or {}).get("items", []), "step": (d.get("materials") or {}).get("step", "month"),
        "drivers": d.get("drivers", {}), "generated": d.get("generated", ""),
        "source": SOURCE.get(key) or (off["series"].split(",")[0] if off else None),
        "reading": ({"series": off["series"].split(",")[0], "period": str(off["period"]),
                     "year": off.get("change_year_pct"), "period_change": off.get("change_period_pct")} if off else None),
        "note": f"notes/{notes[-1].name}" if notes else None,
        "items": [i["name"] for i in cfg.get("price_items", [])],
    }


try:
    from reports import CAPITALS                      # noqa: E402
except Exception:                                     # the site still builds without the market package
    CAPITALS = {}


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


def crowd_series(key: str) -> dict:
    """Reported-price index per item (name -> monthly rows), from the live database."""
    db = ROOT / "data" / "live" / "exchange.sqlite"
    if not db.exists():
        return {}
    try:
        from reports import Participants
        with Participants(db) as p:
            return {i["name"]: r for i in load_country(key).get("price_items", []) if (r := p.crowd_index(key, i["code"]))}
    except Exception:
        return {}


def weeks_ahead(n: int = 8) -> list[str]:
    """Mondays of the next n weeks, as YYYY-MM-DD."""
    from datetime import timedelta
    t = date.today()
    first = t + timedelta(days=(7 - t.weekday()) % 7 or 7)
    return [(first + timedelta(weeks=i)).isoformat() for i in range(n)]


def target_options(months: list[str]) -> list[tuple[str, str, str]]:
    """(value, label, group): the next 8 weeks, then months after the last week."""
    wk = weeks_ahead(8)
    out = [(f"W:{d}", "Week of " + str(int(d[8:])) + " " + month_label(d[:7]), "Weeks") for d in wk]
    out += [(f"M:{m}", month_label(m), "Months") for m in months if m > wk[-1][:7]]
    return out


def months_ahead(n: int = 12) -> list[str]:
    t = date.today()
    out = []
    for i in range(1, n + 1):
        y, m = t.year + (t.month - 1 + i) // 12, (t.month - 1 + i) % 12 + 1
        out.append(f"{y}-{m:02d}")
    return out


# ----------------------------------------------------------------- shell --
WA_ICON = ("<svg viewBox='0 0 24 24' width=18 height=18 aria-hidden=true><path fill='currentColor' d='M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z'/></svg>")
LOGO = ("<svg class=logo viewBox='0 0 24 24' width=24 height=24 aria-hidden=true><circle class=ring cx=12 cy=12 r=9.5 "
        "fill=none stroke='var(--accent-fill)' stroke-width=2 stroke-linecap=round pathLength=100 stroke-dasharray='62 38'/>"
        "<circle class=orbit cx=12 cy=2.5 r=1.6 fill='var(--teal)'/><circle class=core cx=12 cy=12 r=4 fill='var(--accent-fill)'/></svg>")


# Editorial type: Instrument Serif for headings, JetBrains Mono for figures and labels (body text: the phone's own font).
FONTS = ("<link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin>"
               "<link rel=stylesheet href='https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600&display=swap'>")


def shell(title: str, body: str, data: dict, rel: str = "", page: str = "", desc: str = "", head: str = "") -> str:
    nav = [("index.html#countries", "Prices", "home", "nav.prices"), ("calculator.html", "Bids & contracts", "calc", "nav.plan"),
           ("report.html", "Report a price", "report", "nav.reportshort"), ("play.html", "Play", "play", "nav.playshort")]
    minor: set[str] = set()
    links = "".join(f"<a href='{rel}{h}' data-i18n='{k}'{' class=minor' if p in minor else ''}{' aria-current=page' if p == page else ''}>{t}</a>"
                    for h, t, p, k in nav)
    icons = {"home": "M3 11l9-7 9 7v9h-6v-6H9v6H3z", "calc": "M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2",
             "report": "M4 20h4L19 9l-4-4L4 16zM14 6l4 4", "play": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M8 12h8"}
    bottom = "".join(f"<a href='{rel}{h}'{' aria-current=page' if p == page else ''}><svg viewBox='0 0 24 24' aria-hidden=true><path d='{icons[p]}'/></svg>"
                     f"<span data-i18n='{k}'>{t}</span></a>" for h, t, p, k in nav)
    payload = json.dumps(data, separators=(",", ":")).replace("</", "<\\/")
    return f"""<!doctype html>
<html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name=description content="{e(desc or 'Construction cost forecasts and prices people pay, in seven African countries.')}">
<link rel=stylesheet href="{rel}assets/cio.css?v={BUILT_TAG}">{FONTS}{head}</head><body data-page="{page}" data-rel="{rel}">
<header class=topbar><div class=wrap>
 <a class=mark href="{rel}index.html">{LOGO}CiO <span>Costs</span></a>
 <nav class=nav aria-label=Main>{links}</nav>
 {f"<a class='btn wa cta-wa' href='https://wa.me/{WA}' target=_blank rel=noopener aria-label='Chat with us on WhatsApp'>{WA_ICON}</a>" if WA else ""}
 <a class="btn primary cta" href="{rel}report.html" data-i18n=cta.report>Report a price</a>
 <select class=lang id=lang aria-label="Language"><option value=en>EN</option><option value=sw>Kiswahili</option><option value=fr>Français</option></select>
 <button class=theme id=theme type=button aria-label=Theme>◐</button>
</div></header>
<main class=wrap>{body}</main>
<nav class=bottombar aria-label=Main>{bottom}</nav>
<footer class=wrap><p class=footlinks><a href="{rel}method.html" data-i18n=nav.method>How it works</a> · <a href="{rel}glance.html" data-i18n=glance.h>Costs at a glance</a> · <a href="{rel}calculator.html#adjust" data-i18n=ci.short>Contract index</a> · <a href="{rel}method.html#track" data-i18n=trust.track>Track record</a>
{f" · <a href='{CHANNEL}' target=_blank rel=noopener data-i18n=wa.follow>Follow on WhatsApp (free)</a>" if CHANNEL else ""}</p><span data-i18n=footer.short>CiO Lab · Forecasts are estimates with ranges, not advice. The Cost Call is a game: points have no cash
value. Official data: UBOS, KNBS, Stats SA; benchmarks: US BLS, Statistics Austria (Eurostat), PSA Philippines, FGV Brazil; oil and exchange rates from public
market sources. Updated {e(data.get('updated', ''))}.</span></footer>
<script id=cio-data type="application/json">{payload}</script>
<script src="{rel}assets/cio.js?v={BUILT_TAG}"></script></body></html>
"""


def picker(months: list[str], default: str) -> str:
    groups = {}
    for v, lab, g in target_options(months):
        groups.setdefault(g, []).append(f"<option value='{v}'{' selected' if v == default else ''}>{lab}</option>")
    opts = "".join(f"<optgroup label='{g}'>{''.join(o)}</optgroup>" for g, o in groups.items())
    hz = "".join(f"<button type=button data-h={h} data-i18n={k}>{t}</button>" for h, k, t in
                 ((1, "h.1", "Next month"), (3, "h.3", "3 months"), (6, "h.6", "6 months"), ("pick", "h.pick", "Pick a date")))
    return (f"<div class=when><span data-i18n=when.label>Forecast to</span><div class=horizon role=group aria-label='Forecast to'>{hz}</div>"
            f"<select id=when aria-label='Forecast to' hidden>{opts}</select></div>")


# ------------------------------------------------------------------ pages --
def page_index(cs: list[dict], months: list[str], default: str) -> str:
    feat = next((c for c in cs if c["key"] == "uganda"), cs[0])      # replaced in the browser by the visitor's country
    tabs = [("all", "All"), ("east", "East Africa"), ("south", "Southern Africa"), ("west", "West Africa"),
            ("bench", "Benchmark"), ("official", "Official data"), ("indicator", "Estimates"),
            ("rising", "Rising"), ("easing", "Easing")]
    tab_html = "".join(f"<button type=button data-tab={k} data-i18n=tab.{k} aria-pressed={'true' if k == 'all' else 'false'}>{v}</button>"
                       for k, v in tabs)
    cards = "".join(f"""<article class=card data-key={c['key']} data-region={c['region']}
 data-type={'official' if c['official'] else 'indicator'} data-search="{e(' '.join([c['country'], c['currency'], REGION_NAME.get(c['region'], ''), *c['items'], *(m['name'] for m in c['materials'])]).lower())}">
 <div class=card-top><span class=flag aria-hidden=true>{c['flag']}</span><a class=country data-cc={ISO2.get(load_country(c['key'])['iso3'], '')} href="countries/{c['key']}/index.html">{e(c['country'])}</a>
 {chip(c['official'])}</div>
 <h3 class=q data-q></h3>
 <div class=odds><div><span class="pct verdict" data-verdict>–</span><span class=pct-l data-sub></span></div><div class=spark-slot data-spark></div></div>
 <div class=pbar><span data-bar></span></div>
 <dl class=facts><div><dt data-i18n=lbl.chance.cap>Chance of a rise</dt><dd data-pct>–</dd></div><div><dt data-i18n=lbl.range.cap>Likely range (8 in 10)</dt><dd data-rng>–</dd></div></dl>
 <p class=advice data-advice></p><ul class=match data-match hidden></ul>
 <div class=card-foot><a class='btn primary' href="countries/{c['key']}/index.html"><span data-i18n=btn.seecosts data-c="{e(c['country'])}">See costs in {e(c['country'])}</span> <span aria-hidden=true>→</span></a>
 <a class=link href="play.html#{c['key']}" data-i18n=link.makecall>Play today's game</a></div></article>""" for c in cs)
    return _home(cs, months, default, feat, tab_html, cards)


def page_glance(cs: list[dict], months: list[str], default: str) -> str:
    order = sorted(cs, key=lambda c: (c["key"] not in FEATURED, FEATURED.index(c["key"]) if c["key"] in FEATURED else 0, c["country"]))
    glance = "".join(f"""<tr data-key={c['key']}><th scope=row><a href="countries/{c['key']}/index.html">{c['flag']} {e(c['country'])}</a></th>
 <td>{e(c['base'])}</td><td data-g=official>{'–' if not c['reading'] and not c['materials'] else ''}</td><td data-g=exp></td><td data-g=rng></td>
 <td data-g=pct></td><td data-g=fx></td></tr>""" for c in order)
    return f"""
<p class=crumbs><a href=index.html data-i18n=crumbs.all>All countries</a></p>
<div class=section-h><h1 data-i18n=glance.h>Costs at a glance</h1>{picker(months, default)}</div><p class=muted data-i18n=glance.sort>Click a column to sort</p>
<div class=tablewrap><table class=glance id=glance-table><thead><tr><th scope=col data-sort=text data-i18n=th.country>Country</th>
<th scope=col data-sort=text data-i18n=th.latest>Latest official</th><th scope=col data-sort=num data-i18n=th.offyear>Official change, year</th>
<th scope=col data-sort=num><span data-i18n=th.expby>Expected by</span> <span data-when-label></span></th><th scope=col data-i18n=th.range>Likely range</th>
<th scope=col data-sort=num data-i18n=th.chance>Chance of a rise</th><th scope=col data-sort=num data-i18n=th.fx>Currency vs USD, 13 weeks</th></tr></thead>
<tbody>{glance}</tbody></table></div>"""


def _home(cs, months, default, feat, tab_html, cards):
    bcs = [c for c in cs if c.get("bench") and c.get("bstats")]
    rows = "".join(f"<a class=bench-row href='countries/{c['key']}/index.html'><span>{c['flag']} {e(c['country'])}</span>"
                   f"<b>{c['bstats']['1']['inside']:.0%}</b><b>{c['bstats']['3']['inside']:.0%}</b>"
                   f"<span class={'beat' if c['bstats']['1']['mae'] < c['bstats']['1']['mae_nochange'] else 'nobeat'}>"
                   f"{'✓' if c['bstats']['1']['mae'] < c['bstats']['1']['mae_nochange'] else '–'}</span></a>" for c in bcs)
    BENCH_STRIP = "" if not bcs else (
        f"<section class=bench><div class=bench-text><p class=eyebrow data-i18n=bench.eyebrow>How good are the forecasts?</p>"
        f"<h2 data-i18n=bench.h2>Benchmarks: the same tool where official data is good</h2>"
        f"<p data-i18n=bench.d2>We also run CiO Costs on official construction prices in North America, Europe, Asia and Latin America. They are "
        f"published every month and on time, so anyone can check how well the forecasts do. The aim: the real change lands inside the likely "
        f"range 8 times in 10.</p></div><div class=bench-table><div class='bench-row head'><span></span><span data-i18n=bench.c1>Inside range, 1 month</span>"
        f"<span data-i18n=bench.c3>3 months</span><span data-i18n=bench.cb>Beats “no change”</span></div>{rows}</div></section>")
    body = f"""
<section class=hero><div><p class=eyebrow data-i18n=home.eyebrow>Construction cost outlook · 7 African countries</p>
 <h1 data-i18n=home.h1>Will construction costs rise where you work?</h1>
 <p class=lede data-i18n=home.lede>Choose your country and a date. See whether construction costs — the prices of materials, fuel and labour — are likely to go up, by how much, and what that means for the price you pay. Updated every few hours.</p>
 <p class=whatis data-i18n=whatis>CiO Costs is a forecasting tool. It estimates how construction costs (materials, fuel and labour) are likely to move, with a range. It is not an official statistic, a price list or financial advice.</p></div>
 <div class=hero-side><label class="when-box country-pick"><span data-i18n=pick.country>Your country</span><select id=mycountry aria-label="Your country">
 {country_options(cs)}</select></label>
 {picker(months, default)}</div></section>
<p class=trust><span data-i18n=trust.sources>Official data from UBOS, KNBS and Stats SA</span>
 · <span id=updated-ago data-built="{BUILT}"></span> · <a href="method.html#track" data-i18n=trust.track>Track record</a>
 {f" · <a href='{CHANNEL}' target=_blank rel=noopener data-i18n=wa.weekly>Free weekly update on WhatsApp</a>" if CHANNEL else ""}</p>
<section class=featured data-key={feat['key']} aria-labelledby=fq>
 <div class=feat-main><div class=card-top><span class=flag aria-hidden=true>{feat['flag']}</span>
 <a class=country data-feat-name data-cc={ISO2.get(load_country(feat['key'])['iso3'], '')} href="countries/{feat['key']}/index.html">{e(feat['country'])}</a><span class=chip data-i18n=chip.yours>Your country</span></div>
 <h2 id=fq class=feat-q data-q></h2>
 <div class=feat-odds><div class=needle data-needle aria-hidden=true></div><div><span class="pct verdict" data-verdict>–</span><span class=pct-l data-sub></span></div>
 <div><span class='pct small' data-pct>–</span><span class=pct-l data-i18n=lbl.chance>chance of a rise</span></div>
 <div><span class='pct small' data-rng>–</span><span class=pct-l data-i18n=lbl.range>likely range (8 in 10)</span></div></div>
 <p class=fineprint data-i18n=fc.note>Forecast, not a guarantee: 8 times in 10 the real change falls inside the range.</p>
 <div class=chart data-chart></div>
 <p class='advice big' data-advice></p>
 <div class=buy><span data-i18n=buy.q>What are you buying?</span>{BUY}</div>
 {MONEY}
 <div class=actions><a class='btn primary' data-feat-link href="countries/{feat['key']}/index.html" data-i18n=btn.bymaterial>See costs by material</a>
 <a class=btn data-feat-bid href="calculator.html?c={feat['key']}#bid" data-i18n=bc.pricebid>Price a bid</a>
 <a class=btn href="play.html" data-i18n=btn.play>Play The Cost Call</a>
 <button class='btn share' type=button data-share><svg viewBox="0 0 24 24" width=16 height=16 aria-hidden=true fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M12 3v12M7 8l5-5 5 5M5 14v5h14v-5"/></svg> <span data-i18n=share>Share</span></button></div></div>
 <aside class=feat-side><h3><span data-i18n=feat.bymaterial>By material, to</span> <span data-when-label></span></h3><ul class=breakdown data-breakdown></ul></aside>
</section>

{DRIVERS}
{QUICK}
<nav class=tabs id=countries aria-label="Filter countries">{tab_html}</nav>
<form class=toolbar id=searchform role=search><label class=search><span class=sr-only>Search</span>
 <input id=q type=search data-i18n-ph=search.ph placeholder="Search countries and materials — e.g. Kenya Uganda cement" autocomplete=off enterkeyhint=search></label>
 <button class='btn primary' type=submit data-i18n=search.btn>Search</button>
 <span class=count id=count aria-live=polite></span></form>
<div class="grid folded" id=grid>{cards}</div>
<p class=empty id=empty data-i18n=empty>No country matches. Try “cement”, “Kenya” or “West”.</p>

{BENCH_STRIP}
<p class=center><button class=btn type=button id=grid-open data-i18n=grid.open>Show all countries</button></p>
<p class=moreline><a href=glance.html data-i18n=glance.link>Compare all countries in one table →</a></p>
<p class=gameline>🎯 <span data-i18n=game.line>Five quick calls a day on real prices.</span> <a href=play.html data-i18n=game.cta>Play today's calls</a></p>
"""
    return body


BUY = "".join(f"<button type=button class=pill data-buy={k} data-i18n=buy.{k}>{t}</button>" for k, t in
              (("cement", "Cement"), ("steel", "Steel"), ("sand", "Sand"), ("diesel", "Diesel"), ("roofing", "Roofing")))
DRIVERS = """<section class=drivers aria-labelledby=dv-h><div class=dv-head><h2 id=dv-h data-i18n=dv.h>What is moving costs</h2>
 <span class=muted data-dv=for></span></div><div class=dv-grid>
 <div class=dv><span class=dv-k data-i18n=dv.oil>World oil (Brent)</span><b data-dv=oil></b><span class=dv-s data-dv=oilch></span></div>
 <div class=dv><span class=dv-k data-dv=fxk></span><b data-dv=fx></b><span class=dv-s data-dv=fxch></span></div>
 <div class=dv><span class=dv-k data-i18n=dv.off>Latest official figures</span><b data-dv=off></b><span class=dv-s data-dv=offsrc></span></div>
 <div class=dv><span class=dv-k data-i18n=dv.upd>Forecast updated</span><b data-dv=upd></b><span class=dv-s data-i18n=dv.every>Refreshed every 3 hours as oil and currencies move</span></div>
 </div></section>"""
WHEN = """<label class=when-paid><span data-i18n=rep.when>When did you pay?</span><select name=months_ago>
 <option value=0 data-i18n=when.0>This month</option><option value=1 data-i18n=when.1>Last month</option>
 <option value=2 data-i18n=when.2>2 months ago</option><option value=3 data-i18n=when.3>3 months ago</option>
 <option value=4 data-i18n=when.4>4 months ago</option><option value=5 data-i18n=when.5>5 months ago</option>
 <option value=6 data-i18n=when.6>6 months ago</option></select></label>"""
QUICK = """<section class=quickrep aria-labelledby=qr-h><div class=qr-head><h2 id=qr-h data-i18n=qr.h2>What did you pay recently?</h2>
 <p class=muted data-i18n=qr.d2>Tell us one price — today or from the last few months. It is anonymous and takes 20 seconds; once 3 people report an item, everyone sees the typical price.</p>
 <p class=qr-progress data-qr-progress></p></div>
 <form class=qr-form><label><span data-i18n=rep.item>Item</span><select name=item></select></label>
 <label><span><span data-i18n=rep.price>Price</span> <span class=muted data-qr-ccy></span></span><input name=price type=number min=1 step=any inputmode=decimal required></label>
 <fieldset class=areapick><legend data-i18n=rep.area>Where is that?</legend>
  <label><input type=radio name=area value=capital checked><span><span data-i18n=rep.incap>In</span> <b data-capital></b></span></label>
  <label><input type=radio name=area value=other><span data-i18n=rep.elsewhere>Elsewhere in the country</span></label></fieldset>
 {WHEN}
 <label class=qr-town hidden><span data-i18n=rep.town>Town or area</span><input name=location></label>
 <button class='btn primary big' type=submit data-i18n=rep.send>Send price</button>
 <p class='formmsg muted' role=status></p></form></section>"""


QUICK = QUICK.replace("{WHEN}", WHEN)


MONEY = """<div class=money><b data-i18n=money.h>Your price</b>
 <label><span class=sr-only>Material</span><select data-money-mat></select></label>
 <label class=money-in><span class=sr-only>Your latest price</span><input data-money-price type=number min=0 step=any inputmode=decimal
 placeholder="Your latest price"><span data-money-ccy></span></label>
 <p class=money-out data-money-out aria-live=polite></p></div>"""


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
    # hover points: every month, with its value (history) or its forecast and range, read by the page script
    pts = [{"x": round(X(i), 1), "y": round(Y(v), 1), "m": d, "v": round(v, 2),
            "c": None if i == 0 else round((v / hv[i - 1] - 1) * 100, 2)} for i, (d, v) in enumerate(zip(hd, hv))]
    pts += [{"x": round(X(k0 + 1 + i), 1), "y": round(Y(a), 1), "m": m, "v": round(a, 2), "f": 1, "e": q["median"], "lo": q["lo"], "hi": q["hi"]}
            for i, ((m, a, _, _), q) in enumerate(zip(fv, path))]
    return (f"<div class=fanwrap><svg class=fan viewBox='0 0 {w} {h}' role=img aria-label='History and forecast for {e(c['head'])}' data-xs='{json.dumps(xs)}' "
            f"data-pts='{json.dumps(pts)}' data-base='{e(c.get('base', ''))}'>"
            f"<line x1='{X(k0):.1f}' x2='{X(k0):.1f}' y1=10 y2='{h - 22}' class=nowline /><text x='{X(k0) + 4:.1f}' y=18 class=nowtext>forecast →</text>"
            f"<polygon points='{band}' class=band /><polyline points='{hist}' class=histline />"
            f"<polyline points='{med}' class=medline /><line class=marker y1=10 y2='{h - 22}' x1=0 x2=0 />{ticks}"
            f"<line class=hoverline y1=10 y2='{h - 22}' x1=-10 x2=-10 /><circle class=hoverdot r=4.5 cx=-10 cy=-10 /></svg>"
            f"<div class=fantip role=status hidden></div></div>"
            f"<p class=muted>{e(sp.get('label', ''))}. Shaded: likely range (8 in 10).</p>")


WHY = [(("diesel", "fuel", "asphalt", "bitumen"), "Oil prices and the exchange rate"),
       (("steel", "rebar", "reinforc", "roofing", "nails", "iron"), "World steel prices and the exchange rate"),
       (("cement", "lime", "ready-mix", "concrete", "block", "brick"), "Fuel and power costs, the exchange rate, local demand"),
       (("sand", "aggregate", "ballast", "stone", "hardcore", "murram"), "Rain (quarrying and haulage), fuel, local demand"),
       (("paint", "pipe", "tile", "plastic"), "Imports: the exchange rate and oil-based inputs"),
       (("timber", "wood"), "Local supply and general inflation"), (("labour",), "Local wages and inflation")]


def why(name: str) -> str:
    n = name.lower()
    return next((t for keys, t in WHY if any(k in n for k in keys)), "Local and imported costs")


def page_country(c: dict, months: list[str], default: str, crowd_rows: list[dict]) -> str:
    def yr(m):
        return "–" if m["change_year"] is None else arrow(m["change_year"]) + " " + format(m["change_year"], "+.1f") + "%"
    mats = "".join(f"<tr data-mat='{e(m['name'])}'><th scope=row data-matname='{e(m['name'])}'>{e(m['name'])}</th><td>{arrow(m['change_period'])} {m['change_period']:+.1f}%</td>"
                   f"<td>{yr(m)}</td><td data-mexp>–</td><td class=why>{why(m['name'])}</td>"
                   f"<td><button type=button class=addbill data-addbill='{e(m['name'])}' data-i18n=bc.add>+ Add to my bill</button></td></tr>" for m in c["materials"])
    step = "quarter" if c["step"] == "quarter" else "month"
    if mats:
        mat_html = f"""<section><div class=section-h><h2 data-i18n=sec.materials>Costs by material</h2><span class=muted><span data-i18n=lbl.offlatest{step}>Official figures, latest {step}:</span> {e(c['base'])}</span></div><div class=tablewrap><table class=glance>
<thead><tr><th scope=col data-i18n=th.material>Material</th><th scope=col data-i18n=th.prev{step}>Change on the previous {step}</th><th scope=col data-i18n=th.year>Change on a year</th>
<th scope=col><span data-i18n=th.expby>Expected by</span> <span data-when-label></span></th><th scope=col data-i18n=th.why>What moves it</th><th><span class=sr-only>Bill</span></th></tr></thead><tbody>{mats}</tbody></table></div></section>"""
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
    def price(r):
        if r.get("published"):
            return f"{r['median']:,.0f} {e(c['currency'])} per {e(r['unit'])}"
        return (f"<span class=progress-line><b>{r.get('pending', 0)} of 3</b> people in the last 2 months · "
                f"<a href='../../report.html#{c['key']}'>add yours</a></span>")
    def area(r, a):
        v = r.get(a)
        return f"{v:,.0f}" if v is not None and v == v else f"<span class=muted>{r.get(a + '_n', 0) or 0} of 3</span>"
    cap = CAPITALS.get(c["key"], "capital")
    cidx = crowd_series(c["key"])
    def trend(r):
        rows = cidx.get(r["name"]) or []
        if len(rows) < 2:
            return "<span class=muted>–</span>"
        v = [x["v"] for x in rows[-12:]]
        lo, hi = min(v), max(v)
        pts = " ".join(f"{i * 60 / (len(v) - 1):.1f},{18 - (x - lo) * 16 / ((hi - lo) or 1):.1f}" for i, x in enumerate(v))
        return (f"<svg class=cspark viewBox='0 0 60 20' aria-hidden=true><polyline points='{pts}'/></svg> "
                f"<span title='{len(rows)} months'>{rows[-1]['v']:.1f}</span>")
    crowd_html = "".join(f"<tr><th scope=row>{e(r['name'])}</th><td>{price(r)}</td><td>{area(r, 'capital')}</td><td>{area(r, 'other')}</td>"
                         f"<td>{r['reporters'] if r.get('published') else '–'}</td><td>{ch(r)}</td><td>{trend(r)}</td></tr>" for r in crowd_rows)
    crowd_sec = (f"<div class=tablewrap><table class=glance><thead><tr><th data-i18n=th.item>Item</th><th data-i18n=th.typical>Typical price</th>"
                 f"<th>{e(cap)}</th><th data-i18n=th.elsewhere>Elsewhere</th><th data-i18n=th.reporters>Reporters</th>"
                 f"<th data-i18n=th.vsprev>vs previous 2 months</th><th data-i18n=th.cidx>Price index</th></tr></thead><tbody>{crowd_html}</tbody></table></div>"
                 f"<p class=muted data-i18n=crowd.areas2>Typical prices pool the last 2 months, so people can report whenever they buy. Area prices appear once 3 people report from that area.</p>") if crowd_rows else (
        f"<div class=tile><p><b>0 of 3</b> people have reported prices for {e(c['country'])} in the last 2 months. Prices appear here once 3 people report "
        f"what they pay for an item ({e(', '.join(c['items'][:4]).lower())}…). "
        f"<a href='../../report.html#{c['key']}'>Be the first — it takes a minute and is anonymous</a>.</p></div>")
    dr = c["drivers"]
    fx = (f"{e(c['currency'])} per US dollar: <b>{dr['fx']:,.1f}</b> ({'weaker' if (dr.get('fx_13w_pct') or 0) > 0 else 'stronger'} "
          f"{abs(dr.get('fx_13w_pct') or 0):.1f}% in 13 weeks)") if dr.get("fx") else ""
    note = f"<a class=btn href='{e(c['note'])}' data-i18n=btn.note>Read the weekly note</a>" if c["note"] else ""
    src = f"<p class=muted><span data-i18n=lbl.officialdata>Official data:</span> {e(c['source'])}.</p>" if c["source"] else ""
    return f"""
<p class=crumbs><a href="../../index.html" data-i18n=crumbs.all>All countries</a> › <span data-i18n=tab.{c['region']}>{e(REGION_NAME.get(c['region'], ''))}</span></p>
<section class="featured solo" data-key={c['key']}>
 <div class=feat-main><div class=card-top><span class='flag big' aria-hidden=true>{c['flag']}</span><h1 class=country-h data-cc={ISO2.get(load_country(c['key'])['iso3'], '')}>{e(c['country'])}</h1>
 {chip(c['official'])}{picker(months, default)}</div>
 <h2 class=feat-q data-q></h2>
 <div class=feat-odds><div class=needle data-needle aria-hidden=true></div><div><span class="pct verdict" data-verdict>–</span><span class=pct-l data-sub></span></div>
 <div><span class='pct small' data-pct>–</span><span class=pct-l data-i18n=lbl.chance>chance of a rise</span></div>
 <div><span class='pct small' data-rng>–</span><span class=pct-l data-i18n=lbl.range>likely range (8 in 10)</span></div></div>
 <p class=fineprint data-i18n=fc.note>Forecast, not a guarantee: 8 times in 10 the real change falls inside the range.</p>
 <div class=chart>{chart_svg(c)}</div><p class='advice big' data-advice></p>
 {track_country(c, crowd_rows)}
 {MONEY}
 <div class=actions><a class='btn primary' href="../../calculator.html?c={c['key']}#bid" data-i18n=bc.pricebid>Price a bid</a>
 <a class=btn href="../../calculator.html?c={c['key']}#adjust" data-i18n=bc.useindex>Use as contract index</a>{note}
 <button class='btn share' type=button data-share><svg viewBox="0 0 24 24" width=16 height=16 aria-hidden=true fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M12 3v12M7 8l5-5 5 5M5 14v5h14v-5"/></svg> <span data-i18n=share>Share</span></button></div>{src}</div>
</section>
{mat_html}
<section><div class=section-h><h2 data-i18n=sec.drivers>What is driving costs</h2></div><div class=howto>
 <div class=tile><b>Oil</b><p>Brent crude: <b>{dr.get('brent_usd', 0):,.0f} USD</b> a barrel ({'+' if (dr.get('brent_13w_pct') or 0) > 0 else ''}{(dr.get('brent_13w_pct') or 0):.1f}% in 13 weeks).
 Oil feeds diesel, transport, bitumen and plastics.</p></div>
 <div class=tile><b>Currency</b><p>{fx or 'Exchange-rate readings not available.'} A weaker currency makes imported steel, cement inputs,
 fittings and paint dearer.</p></div>
 <div class=tile><b>Official data</b><p>{e(c['base'])} is the latest period in the forecast's base. New official releases are
 added within a day of publication.</p></div></div></section>
<div data-key={c['key']}>{QUICK}</div>
<section><div class=section-h><h2 data-i18n=sec.crowd>Prices reported by people who buy them</h2>
<p class=fineprint data-i18n=crowd.note>Typical prices reported by buyers — not official or supplier prices.</p>
<a class='btn primary' href="../../report.html#{c['key']}" data-i18n=tool.report.t>Report a price</a></div>{crowd_sec}</section>
<section class=alertbox data-country={c['key']}><div><h2 data-i18n=alert.h>Get a price alert</h2><p data-i18n=alert.d>We'll message you when the expected change
for a material in {e(c['country'])} reaches your level.</p></div>
<form class=alertform><label><span data-i18n=th.material>Material</span><select name=series>{''.join(f"<option>{e(k)}</option>" for k in c['paths'])}</select></label>
<label><span data-i18n=alert.at>Alert me at</span><select name=threshold><option value=3>+3%</option><option value=5 selected>+5%</option><option value=10>+10%</option>
<option value=-3>−3% (prices falling)</option></select></label>
{"<label><span data-i18n=alert.by>By</span><select name=channel><option value=whatsapp>WhatsApp</option><option value=email>Email</option></select></label>" if ALERTS_WA else "<input type=hidden name=channel value=email>"}
<label><span data-i18n={'alert.contact' if ALERTS_WA else 'alert.email'}>{'Number or email' if ALERTS_WA else 'Email'}</span><input name=contact required {'' if ALERTS_WA else 'type=email '}placeholder="{'+256… or you@company.com' if ALERTS_WA else 'you@company.com'}"></label>
<label class=consent><input type=checkbox name=consent required> <span data-i18n=alert.consent>I agree to receive these alerts from CiO Costs by
the channel above. Reply STOP at any time to stop them.</span></label>
<button class='btn primary' type=submit data-i18n=alert.btn>Set alert</button><p class='muted formmsg' role=status></p></form></section>
<details class=embed data-key={c['key']}><summary data-i18n=embed.s>Put this forecast on your website</summary>
<div class=embed-grid><div class=embed-opts>
 <label><span data-i18n=emb.lang>Language</span><select data-emb=lang><option value="" data-i18n=emb.visitor>Visitor's language</option><option value=en>English</option><option value=sw>Kiswahili</option><option value=fr>Français</option></select></label>
 <label><span data-i18n=emb.theme>Colours</span><select data-emb=theme><option value=auto data-i18n=emb.match>Match the visitor</option><option value=light data-i18n=emb.light>Light</option><option value=dark data-i18n=emb.dark>Dark</option></select></label>
 <p class=muted data-i18n=emb.help>Copy this code into any web page. On WordPress, add a “Custom HTML” block and paste it there. It updates by itself.</p>
 <textarea readonly rows=3 data-emb-code aria-label="Code to copy"></textarea>
 <p><button class='btn primary' type=button data-emb-copy data-i18n=emb.copy>Copy code</button> <span class=muted data-emb-note></span></p></div>
 <div><p class=muted data-i18n=emb.preview>Preview</p><iframe data-emb-preview title="Preview" src="../../embed.html?c={c['key']}&amp;id=pv"></iframe></div></div></details>
"""


def _ym(base: str) -> str:
    """'Apr 2026' -> '2026-04'; 'Q2 2026' -> '2026-04' (first month of the quarter, as in the history series)."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    try:
        if base.startswith("Q"):
            return f"{base[-4:]}-{3 * (int(base[1]) - 1) + 1:02d}"
        return f"{base[-4:]}-{months.index(base[:3]) + 1:02d}"
    except (ValueError, IndexError):
        return ""


def arrow(v: float) -> str:
    return "⬆" if v >= 0.25 else ("⬇" if v <= -0.25 else "➡")


def track_country(c: dict, crowd_rows: list[dict] = ()) -> str:
    """'Last time we said X, it came in at Y': logged live forecasts once they mature, else Uganda's back-test.
    Countries without an official index compare the estimate with what people report paying."""
    import csv
    if not c["official"]:
        v = (c.get("spark") or {}).get("values") or []
        est = (v[-1] / v[-2] - 1) * 100 if len(v) >= 2 and v[-2] else None
        got = [r for r in crowd_rows if r.get("published") and r.get("change_pct") is not None]
        if not got or est is None:
            return (f"<p class='track muted'><b data-i18n=track.h>Track record</b>: <span data-i18n=track.crowdsoon2>once 3 people have reported an item "
                    f"over two periods of 2 months, we show the change in what they pay next to our estimate here.</span> <a href='../../report.html#{c['key']}' data-i18n=track.addyours>Report a price</a></p>")
        li = "".join(f"<li>{e(r['name'])}: {arrow(r['change_pct'])} <b>{r['change_pct']:+.1f}%</b> <span class=muted>"
                     f"({r['reporters']} people, vs previous 2 months)</span></li>" for r in got[:4])
        return (f"<div class=track><b data-i18n=track.h>Track record</b> <span class=muted>· <span data-i18n=track.vscrowd>our estimate vs "
                f"what people pay</span></span><ul><li><span data-i18n=track.est>Our import-cost estimate, last month</span>: {arrow(est)} "
                f"<b>{est:+.1f}%</b></li>{li}</ul></div>")
    sp = c.get("spark") or {}
    lvl = dict(zip(sp.get("dates") or [], sp.get("values") or []))
    rows, label = [], "Live forecasts"
    log = ROOT / "data" / "live" / "forecast_log" / f"{c['key']}.csv"
    if log.exists():
        seen = set()
        for r in sorted(csv.DictReader(open(log)), key=lambda r: r["made"]):
            b, t = _ym(r["base"]), r["target"]
            if t in seen or b not in lvl or t not in lvl or t <= b:
                continue
            seen.add(t)
            rows.append((f"Said on {r['made']}", t, float(r["median"]), float(r["lo"]), float(r["hi"]), (lvl[t] / lvl[b] - 1) * 100))
    if not rows:
        f = ROOT / "countries" / c["key"] / "outputs" / "forecast" / "backtest_errors.csv"
        if f.exists():
            for r in [r for r in csv.DictReader(open(f)) if r["target"] == "ALL" and r["h"] == "3"][-3:]:
                y, m = int(r["origin"][:4]), int(r["origin"][5:7]) + 3
                t = f"{y + (m - 1) // 12}-{(m - 1) % 12 + 1:02d}"
                rows.append((f"Data to {month_label(r['origin'][:7])}", t, float(r["structural"]), float(r["lo"]), float(r["hi"]), float(r["actual"])))
            label = "Tested on past data"
    if not rows:
        return ("<p class='track muted'><b data-i18n=track.h>Track record</b>: "
                "<span data-i18n=track.soon>we log every forecast and will show it here next to the official figure once it is published.</span></p>")
    li = "".join(f"<li>{e(w)}, for <b>{month_label(t)}</b>: {arrow(m)} {m:+.1f}% <span class=muted>({lo:+.1f} to {hi:+.1f})</span> → "
                 f"official {arrow(a)} <b>{a:+.1f}%</b> {'✓' if lo <= a <= hi else '✗'}</li>" for w, t, m, lo, hi, a in rows[-3:])
    summary = ""
    if c.get("bstats"):
        b1, b3 = c["bstats"].get("1") or {}, c["bstats"].get("3") or {}
        summary = (f"<p class=bench-sum><b>{b1.get('inside', 0):.0%}</b> of 1-month and <b>{b3.get('inside', 0):.0%}</b> of 3-month outcomes fell "
                   f"inside the likely range over the last {b1.get('n', 0)} months (the aim is 80%). Average miss: {b1.get('mae', 0):.2f} points "
                   f"one month ahead, against {b1.get('mae_nochange', 0):.2f} for simply assuming no change.</p>")
    return f"<div class=track><b data-i18n=track.h>Track record</b> <span class=muted>· {label}</span>{summary}<ul>{li}</ul></div>"


def track_record() -> str:
    """Public summary of the Uganda backtest: accuracy vs a simple trend, and range coverage."""
    import csv
    f = ROOT / "countries" / "uganda" / "outputs" / "forecast" / "backtest_metrics.csv"
    if not f.exists():
        return ""
    rows = [r for r in csv.DictReader(open(f)) if r["target"] == "ALL"]
    if not rows:
        return ""
    cells = "".join(f"<tr><td>{r['h']} month{'s' if r['h'] != '1' else ''} ahead</td>"
                    f"<td>{(1 - float(r['rel_structural'])) * 100:.0f}% smaller</td>"
                    f"<td>{float(r['coverage80']) * 100:.0f}% raw → about 80% after calibration</td></tr>" for r in rows)
    return (f"<h2 id=track>Track record</h2><p>Uganda, overall construction input index, tested month by month since 2021 using only "
            f"the data available at each point:</p><div class=tablewrap><table class=glance><thead><tr><th>Horizon</th>"
            f"<th>Errors vs a simple trend</th><th>Outcomes inside the likely range</th></tr></thead><tbody>{cells}</tbody>"
            f"</table></div><p class=muted>Each month we will also publish our forecast next to the official figure.</p>")


def page_method() -> str:
    return f"""
<section class=prose><p class=eyebrow data-i18n=nav.method>How it works</p><h1 data-i18n=m.h1>From official statistics to a forecast you can use</h1>
<p class=lede>CiO Costs combines official construction price statistics with the things that move construction costs
week to week, and turns them into a chance, an expected change and a likely range for each country.</p>
<div class=howto>
<div class=tile><span class=num>1</span><b data-i18n=m.in>What goes in</b><p>Official construction price indices where they exist
(Uganda, Kenya and South Africa in full; latest readings for Ghana, Zimbabwe, Senegal and Mauritius), world oil prices,
exchange rates, rainfall, and published tax changes such as fuel and cement duties.</p></div>
<div class=tile><span class=num>2</span><b data-i18n=m.how>How it is forecast</b><p>Where a country publishes a detailed index, each
material is forecast from the drivers that move it — oil for diesel, the currency for imported steel, rainfall for sand
— and added back up the way the statistics office does. Elsewhere, an import-cost indicator tracks the share of costs
that moves with oil and the exchange rate.</p></div>
<div class=tile><span class=num>3</span><b data-i18n=m.check>How it is checked</b><p>Every method is tested on years of past data, as if
it had been run at the time, and kept only if it beats simple rules of thumb. In Uganda the forecasts have been about
11–14% more accurate than a simple trend, and the likely ranges are set so that 8 in 10 past outcomes fell inside.</p></div>
<div class=tile><span class=num>4</span><b data-i18n=m.often>How often it updates</b><p>Oil and exchange rates are refreshed every few hours
and the forecasts with them. Official data is added within a day of publication. A written note for each country comes
out every Monday.</p></div></div>
{track_record()}
<h2 data-i18n=m.read>Reading the numbers</h2><ul class=plain>
<li><b>Chance of a rise</b>: how likely prices are to be higher by the month you pick.</li>
<li><b>Expected change</b>: the most likely move, measured from the latest official reading (or from today for
import-cost indicators).</li><li><b>Likely range</b>: where the change should land 8 times in 10.</li></ul>
<h2 data-i18n=m.limits>Limits</h2><ul class=plain><li>Forecasts are estimates, not certainties. Always use the range.</li>
<li>Import-cost indicators see oil and currency effects only, not local materials or labour.</li>
<li>Where official statistics are published late, the forecast bridges the gap with the latest market data.</li>
<li>Nothing here is financial or contractual advice.</li></ul></section>
<section class=join id=join><div><h2 data-i18n=join.h>Take part</h2><p data-i18n=join.d2>Anyone can use CiO Costs and add prices — no account.
Tell us what you paid for cement, steel, sand or diesel whenever you buy, even months later, and follow the free weekly update.</p></div>
<div class=actions>{f"<a class='btn big' href='{CHANNEL}' target=_blank rel=noopener data-i18n=wa.follow>Follow on WhatsApp (free)</a>" if CHANNEL else ""}
<a class='btn primary big' href=report.html data-i18n=cta.report>Report a price</a></div></section>
"""


def page_play() -> str:
    return """
<section class=play-head><div><p class=eyebrow data-i18n=game.eyebrow2>Daily game</p><h1 data-i18n=tool.play.t>The Cost Call</h1>
<p class=lede data-i18n=game.lede>Five calls on real construction prices. Did each one go up or down? New calls every day.</p></div>
<div class=stats-row id=stats></div></section>
<section class=game id=game aria-live=polite></section>
<section class=drawit><div class=section-h><h2 data-i18n=draw.h>Draw it</h2><span class=muted data-i18n=draw.d>Guess how an official
price index moved. Draw the line, then reveal the real one.</span></div><div id=draw class=drawbox></div></section>
<dialog id=results class=results aria-labelledby=res-h></dialog>

"""


def page_report(keys: list[str]) -> str:
    opts = country_options([{"key": k, "flag": flag(load_country(k)["iso3"]), "country": load_country(k)["country"]} for k in keys])
    return f"""
<section class=prose><p class=eyebrow data-i18n=nav.report>Report prices</p><h1 data-i18n=rep.h1>What did you pay?</h1>
<p class=lede data-i18n=rep.lede2>Tell us a price you paid or were quoted for a construction material — today or up to 6 months ago, whenever you
have a moment. Reports are anonymous: we publish typical prices from at least 3 people — never names, numbers or single reports.</p></section>
<section class=reportgrid><form id=reportform class=panel>
 <label><span data-i18n=th.country>Country</span><select name=country required>{opts}</select></label>
 <label><span data-i18n=rep.item>Item</span><select name=item required></select></label>
 <div class=row2><label><span data-i18n=rep.price>Price</span> (<span data-ccy></span>)<input name=price type=number min=1 step=any required inputmode=decimal></label>
 <label><span data-i18n=rep.unit>Unit</span><input name=unit readonly tabindex=-1></label></div>
 <div class=row2><label><span data-i18n=rep.town>Town or area</span><input name=location required placeholder="e.g. Kampala – Nakawa"></label>
 <label><span data-i18n=rep.from>Bought from</span><select name=supplier><option>Hardware shop</option><option>Factory or depot</option><option>Quarry</option>
 <option>Fuel station</option><option>Contractor or site</option><option>Other</option></select></label></div>
 <fieldset class=areapick><legend data-i18n=rep.area>Where is that?</legend>
  <label><input type=radio name=area value=capital checked><span><span data-i18n=rep.incap>In</span> <b data-capital></b></span></label>
  <label><input type=radio name=area value=other><span data-i18n=rep.elsewhere>Elsewhere in the country</span></label></fieldset>
 {WHEN}
 <label><span data-i18n=rep.contact>Your phone or email</span> <span class=muted data-i18n=rep.contact.note>(optional, never published — only if you want follow-ups)</span><input name=contact></label>
 <button class='btn primary big' type=submit data-i18n=rep.send>Send price</button><p class='formmsg muted' role=status></p></form>
 <aside class=panel><h2 data-i18n=rep.others>What others report</h2><div id=crowdview></div>
 <p class=fineprint data-i18n=crowd.note>Typical prices reported by buyers — not official or supplier prices.</p>
 <p class=muted data-i18n=rep.median>Medians of each person's reports, so repeated or wild entries can't move the numbers.</p></aside></section>
"""


def page_calc(cs: list[dict]) -> str:
    """Bids & contracts: price a bid (bill of quantities first, quick estimate for those without one) or adjust a payment."""
    return f"""
<section class=prose><p class=eyebrow data-i18n=ci.eyebrow>Free during the pilot</p><h1 data-i18n=bc.h1>Bids &amp; contracts</h1>
<p class=lede data-i18n=bc.lede>Before the job: price your bid with the expected change in material costs. During the job: adjust payments with a
monthly index both sides can check.</p></section>
<div class=bctabs role=tablist><button type=button role=tab data-bc=bid aria-selected=true data-i18n=bc.bid>Price a bid</button>
<button type=button role=tab data-bc=adjust aria-selected=false data-i18n=bc.adjust>Adjust a payment</button></div>
<div data-bc-pane=bid>
<section class=boq id=boq><div class=section-h><div><p class=eyebrow data-i18n=boq.eyebrow>Free during the pilot · up to 10 lines</p>
<h2 data-i18n=boq.h>Bill of quantities escalation</h2>
<p class=muted data-i18n=boq.d>Enter your lines at today's rates. Each line is matched to the forecast for that material, and you get the expected
cost over the work period, with a likely range. Paste straight from Excel: description, quantity, unit, rate.</p></div></div>
<form id=boqform class=panel>
 <div class=boq-top><label><span data-i18n=th.country>Country</span><select name=country></select></label>
 <label><span data-i18n=calc.start>Work starts</span><select name=start></select></label>
 <label><span data-i18n=calc.end>Work ends</span><select name=end></select></label></div>
 <p class=boq-kind data-boq-kind></p>
 <div class=tablewrap><table class="glance boq-table"><thead><tr><th data-i18n=boq.desc>Description</th><th data-i18n=boq.qty>Quantity</th>
 <th data-i18n=rep.unit>Unit</th><th><span data-i18n=boq.rate>Rate today</span> (<span data-boq-ccy></span>)</th><th data-i18n=boq.series>Price follows</th>
 <th data-i18n=boq.today>Amount today</th><th data-i18n=boq.exp>Expected</th><th><span class=sr-only>Remove</span></th></tr></thead><tbody id=boqrows></tbody>
 <tfoot><tr><th colspan=5 data-i18n=boq.total>Total</th><th data-boq-t0></th><th data-boq-t1></th><th></th></tr></tfoot></table></div>
 <div class=actions><button class=btn type=button data-boq-add data-i18n=boq.add>Add a line</button>
 <button class=btn type=button data-boq-paste data-i18n=boq.paste>Paste from Excel</button>
 <button class=btn type=button data-boq-csv data-i18n=boq.csv>Download CSV</button>
 <button class='btn primary' type=button onclick="window.print()" data-i18n=calc.print>Print or save as PDF</button></div>
 <textarea data-boq-pastebox hidden rows=5 placeholder="Cement 50 kg bag	400	bag	35000"></textarea>
 <p class=boq-sum aria-live=polite data-boq-sum></p>
 <p class=fineprint data-boq-limit data-i18n=boq.limit>Up to 10 lines free during the pilot. Larger bills, saved projects and branded PDFs are planned for CiO Costs Pro.</p>
</form></section>
<details class=quickcalc><summary data-i18n=bc.quick>No bill of quantities? Quick estimate</summary>

<p class=eyebrow data-i18n=tool.calc.t>Bid escalation calculator</p><h2 data-i18n=calc.h1>How much could input prices move over your contract?</h2>
<p class=lede data-i18n=calc.lede>Enter your contract and the mix of inputs. You get the expected escalation in your currency, with a likely
range — a starting point for contingencies and price-adjustment clauses.</p>
<section class=reportgrid><form id=calcform class=panel>
 <label><span data-i18n=th.country>Country</span><select name=country></select></label>
 <div class=row2><label><span data-i18n=calc.value>Contract value</span> (<span data-ccy></span>)<input name=value type=number min=0 step=any value=1000000000 inputmode=decimal></label>
 <label><span data-i18n=calc.share>Inputs share of contract (%)</span><input name=share type=number min=5 max=100 value=60></label></div>
 <div class=row2><label><span data-i18n=calc.start>Work starts</span><select name=start></select></label><label><span data-i18n=calc.end>Work ends</span><select name=end></select></label></div>
 <label><span data-i18n=calc.type>Type of work</span><select name=preset><option value=building data-i18n=calc.building>Building</option><option value=road data-i18n=calc.road>Road</option>
 <option value=water data-i18n=calc.water>Water and drainage</option><option value=custom data-i18n=calc.custom>Custom mix</option></select></label>
 <fieldset id=mix><legend>Mix of inputs (%)</legend></fieldset></form>
 <aside class=panel id=calcout aria-live=polite></aside></section>
<p class=muted>Assumes spending spread evenly over the contract and prices measured from today. Estimates with ranges, not
advice. Uses the same forecasts as the country pages, refreshed every few hours.</p>
</details>
</div>
<div data-bc-pane=adjust hidden>{page_contract_index(cs)}</div>
"""



def contract_series(c: dict) -> list[dict]:
    """The headline index month by month: official prints, then provisional values (our forecast's central value,
    replaced when the official figure is published) up to the current month. Estimate-only countries: the import-cost index."""
    sp = c.get("spark") or {}
    rows = [{"m": d, "v": round(float(v), 2), "s": "official" if c["official"] else "estimate"}
            for d, v in zip(sp.get("dates") or [], sp.get("values") or [])]
    if not rows:
        return rows
    last, now = rows[-1], date.today().strftime("%Y-%m")
    step = 3 if c["step"] == "quarter" else 1
    seen = {r["m"] for r in rows}
    for q in c["paths"][c["head"]]:
        m = q["month"]
        if m in seen or c["kind"] == "pressure":
            continue
        if step == 3 and (int(m[5:7]) - int(last["m"][5:7])) % 3:
            continue
        y, mo = int(m[:4]), int(m[5:7]) + step - 1          # last month of the period (quarters are dated by their first month)
        if f"{y + (mo - 1) // 12}-{(mo - 1) % 12 + 1:02d}" >= now:
            continue                                         # only periods that have ended: a month under way has no figure yet
        rows.append({"m": m, "v": round(last["v"] * (1 + q["median"] / 100), 2), "s": "provisional"})
        seen.add(m)
    return rows


def material_series(c: dict) -> dict:
    """Per-material indices for multi-index price adjustment: official changes rebuilt into a level (first period
    before the history = 100), then provisional values for ended periods from that material's forecast."""
    out, now = {}, date.today().strftime("%Y-%m")
    step = 3 if c["step"] == "quarter" else 1
    for m in c["materials"]:
        hist = m.get("history") or []
        if len(hist) < 4:
            continue
        lvl, rows = 100.0, []
        for per, ch in hist:
            lvl *= 1 + ch / 100
            rows.append({"m": per, "v": round(lvl, 2), "s": "official"})
        pth = c["paths"].get(m["name"]) or (c["paths"].get("Rebar") if m["name"] == "Reinforcement steel" else None)
        last, seen = rows[-1], {r["m"] for r in rows}
        for q in pth or []:
            mo = q["month"]
            if mo in seen or (step == 3 and (int(mo[5:7]) - int(last["m"][5:7])) % 3):
                continue
            y, e = int(mo[:4]), int(mo[5:7]) + step - 1
            if f"{y + (e - 1) // 12}-{(e - 1) % 12 + 1:02d}" >= now:
                continue
            rows.append({"m": mo, "v": round(last["v"] * (1 + q["median"] / 100), 2), "s": "provisional"})
            seen.add(mo)
        out[m["name"]] = rows
    return out


def page_contract_index(cs: list[dict]) -> str:
    """Price adjustment for an Interim Payment Certificate, the way FIDIC contracts do it (Sub-Clause 13.7 of the
    2017 books, 13.8 of 1999): Schedule of cost indexation, Base Date indices, current indices 49 days before the end
    of each IPC period, Pn = a + sum(coefficient x In / Io), adjustment = (Pn - 1) x value of work certified."""
    opts = country_options([c for c in cs if not c.get("bench")])
    return f"""
<section class=prose><h2 data-i18n=fd.h>Price adjustment for an Interim Payment Certificate</h2>
<p class=lede data-i18n=fd.lede>The FIDIC way (Sub-Clause 13.7 of the 2017 books, 13.8 of 1999): enter the Schedule of cost indexation from your
Contract Data, the Base Date and the value of work in each IPC. CiO Costs looks up the indices and works out each adjustment.</p></section>
<form id=fd-form class=fd autocomplete=off>
 <div class="panel fd-step"><h3><span class=fd-n>1</span> <span data-i18n=fd.s1>Contract</span></h3>
  <div class=fd-row><label><span data-i18n=th.country>Country</span><select id=ci-country>{opts}</select></label>
  <label><span data-i18n=fd.base>Base Date</span><input type=date name=base required></label>
  <p class=fineprint data-i18n=fd.basehelp>Base Date = 28 days before the latest date for submitting the Tender (as stated in the contract).</p></div>
  <p class=ci-what data-ci-what></p></div>
 <div class="panel fd-step"><h3><span class=fd-n>2</span> <span data-i18n=fd.s2>Schedule of cost indexation</span></h3>
  <p class=muted data-i18n=fd.s2d>Copy it from the Contract Data. The coefficients, including the fixed part, must add up to 1.00.</p>
  <div class=tablewrap><table class="glance fd-table"><thead><tr><th data-i18n=fd.el>Element</th><th data-i18n=fd.coef>Coefficient</th>
  <th data-i18n=fd.src>Index</th><th><span class=sr-only>Remove</span></th></tr></thead><tbody id=fd-sched></tbody>
  <tfoot><tr><th data-i18n=boq.total>Total</th><th data-fd-sum></th><th colspan=2></th></tr></tfoot></table></div>
  <p class=actions><button type=button class=btn data-fd-addel data-i18n=fd.addel>Add an element</button></p></div>
 <div class="panel fd-step"><h3><span class=fd-n>3</span> <span data-i18n=fd.s3>Interim Payment Certificates</span></h3>
  <p class=muted data-i18n=fd.s3d>Value of work certified in each period, without items valued at current prices, dayworks and provisional sums.</p>
  <div class=tablewrap><table class="glance fd-table"><thead><tr><th>IPC</th><th data-i18n=fd.end>Period ends</th>
  <th><span data-i18n=fd.value>Value of work</span> (<span data-ci-ccy></span>)</th><th data-i18n=fd.idate>Index date (−49 days)</th>
  <th>P<sub>n</sub></th><th data-i18n=fd.adj>Adjustment</th><th><span class=sr-only>Remove</span></th></tr></thead><tbody id=fd-ipcs></tbody>
  <tfoot><tr><th colspan=5 data-i18n=fd.total>Total price adjustment</th><th data-fd-total></th><th></th></tr></tfoot></table></div>
  <p class=actions><button type=button class=btn data-fd-addipc data-i18n=fd.addipc>Add an IPC</button>
  <button type=button class="btn primary" onclick="window.print()" data-i18n=fd.print>Print price adjustment statement</button>
  <a class=btn data-ci-csv download data-i18n=fd.csv>Download the index (CSV)</a></p></div>
 <div class="panel fd-statement" data-fd-detail aria-live=polite></div>
</form>
<details class=fd-index><summary data-i18n=fd.seeidx>See the headline index month by month</summary>
 <div class=tablewrap><table class=glance><thead><tr><th data-i18n=ci.month>Month</th><th data-i18n=ci.index>Index</th><th data-i18n=ci.chg>Change</th>
 <th data-i18n=ci.status>Status</th></tr></thead><tbody id=ci-rows></tbody></table></div></details>
<section class=prose><h2 data-i18n=ci.how>How to use it — and its limits</h2><ul class=plain>
<li data-i18n=fd.l1>Indices: the month of the Base Date gives I₀; the month 49 days before the end of each IPC period gives Iₙ (quarterly indices:
that quarter). If an index is not yet published, the latest one is used and the line is marked, so it can be revised later as FIDIC allows.</li>
<li data-i18n=ci.l1>Official months come straight from the statistics office (UBOS, KNBS, Stats SA). Provisional months are our forecast, used only until
the official figure is published; agree in the contract that provisional values are replaced.</li>
<li data-i18n=fd.l2>Countries without official indices (Nigeria, Rwanda, Tanzania, Zambia): use the CiO import-cost estimate for imported inputs, or type in
the values of whatever index your contract names (for example a national CPI for labour).</li>
<li data-i18n=ci.l3>This is free during the pilot. Indices by material and city, long history, monthly certificates and a data feed are planned for
CiO Costs Pro.</li></ul></section>
"""


def page_embed() -> str:
    return "<div id=embed class=embedcard></div>"


# ------------------------------------------------------- benchmark pages --
BENCH_REGION = {"united_states": "North America", "united_kingdom": "Europe", "austria": "Europe", "hong_kong": "Asia",
                "philippines": "Asia", "brazil": "Latin America"}


def backtest_svg(key: str, h: int, n: int = 24, w: int = 760, ht: int = 260) -> str:
    """Forecast vs what happened: for each of the last n test months, our 8-in-10 range (bar), our central forecast (tick)
    and the official outcome (dot: teal inside the range, red outside)."""
    import csv
    f = ROOT / "countries" / key / "outputs" / "forecast" / "backtest_errors.csv"
    if not f.exists():
        return ""
    rows = [r for r in csv.DictReader(open(f)) if r["h"] == str(h)][-n:]
    if not rows:
        return ""
    vals = [float(r[k]) for r in rows for k in ("lo", "hi", "actual")]
    lo, hi = min(vals + [0]), max(vals + [0])
    pad = (hi - lo) * 0.08 or 1
    lo, hi = lo - pad, hi + pad
    L, R, T, Bt = 46, 12, 14, 34
    step = (w - L - R) / len(rows)
    X = lambda i: L + step * (i + 0.5)
    Y = lambda v: T + (hi - v) * (ht - T - Bt) / (hi - lo)
    out = [f"<line class=zero x1={L} x2={w - R} y1={Y(0):.1f} y2={Y(0):.1f} />"]
    for v in sorted({round(lo + (hi - lo) * k / 4, 1) for k in (1, 2, 3)}):
        out.append(f"<text class=ax x={L - 6} y={Y(v) + 4:.1f} text-anchor=end>{v:+.1f}%</text>")
    hits = 0
    for i, r in enumerate(rows):
        a, l, u, m = float(r["actual"]), float(r["lo"]), float(r["hi"]), float(r["structural"])
        inside = l <= a <= u
        hits += inside
        y, mo = int(r["origin"][:4]), int(r["origin"][5:7]) + h
        tgt = f"{y + (mo - 1) // 12}-{(mo - 1) % 12 + 1:02d}"
        out.append(f"<g><title>{month_label(tgt)}: forecast {m:+.1f}% (range {l:+.1f} to {u:+.1f}), official {a:+.1f}%</title>"
                   f"<rect class=rng x={X(i) - step * 0.32:.1f} width={step * 0.64:.1f} y={Y(u):.1f} height={max(1.5, Y(l) - Y(u)):.1f} />"
                   f"<line class=mid x1={X(i) - step * 0.32:.1f} x2={X(i) + step * 0.32:.1f} y1={Y(m):.1f} y2={Y(m):.1f} />"
                   f"<circle class={'hit' if inside else 'miss'} cx={X(i):.1f} cy={Y(a):.1f} r=4.2 /></g>")
        if i % 4 == 0:
            out.append(f"<text class=ax x={X(i):.1f} y={ht - 12} text-anchor=middle>{month_label(tgt)[:3]} {tgt[2:4]}</text>")
    return (f"<svg class=btsvg viewBox='0 0 {w} {ht}' role=img aria-label='Forecast {h} month(s) ahead vs official outcome, last {len(rows)} months: "
            f"{hits} of {len(rows)} inside the range' data-bt={h}{'' if h == 1 else ' hidden'}>{''.join(out)}</svg>")


def bench_drivers(c: dict) -> str:
    """Oil and the currency against the US dollar (the broad dollar index for the United States), 3-month change."""
    d = c.get("drivers") or {}
    cell = lambda k, v, ch: f"<div class=nx><span class=nx-h>{k}</span><b>{v}</b><span class=nx-r>{ch}</span></div>"
    pc = lambda x: "" if x is None else f"{'⬆' if x > 0 else '⬇'} {abs(x):.1f}% in 3 months"
    oil = cell("World oil (Brent)", f"US$ {d['brent_usd']:.0f}" if d.get("brent_usd") else "–", pc(d.get("brent_13w_pct")))
    if d.get("usd_index"):
        fx = cell("US dollar vs major currencies", f"{d['fx']:.1f}" if d.get("fx") else "–",
                  pc(d.get("fx_13w_pct")).replace("in 3 months", "in 3 months (index; up = stronger dollar)"))
    else:
        fx = cell(f"{e(c['currency'])} per US dollar", f"{d['fx']:,.3f}".rstrip("0").rstrip(".") if d.get("fx") else "–",
                  pc(d.get("fx_13w_pct")) + (" (up = weaker " + e(c["currency"]) + ")" if d.get("fx_13w_pct") is not None else ""))
    return (f"<section class=bm-sec><div class=bm-sec-h><h2 data-i18n=dv.h>What is moving costs</h2></div>"
            f"<div class='bm-next bm-drv'>{oil}{fx}</div></section>")


def page_benchmark(c: dict, number: int) -> str:
    cfg = load_country(c["key"])
    b = c.get("bstats") or {}
    b1, b3 = b.get("1") or {}, b.get("3") or {}
    beat = b1.get("mae", 9) < b1.get("mae_nochange", 0)
    region = BENCH_REGION.get(c["key"], "")
    gauge = lambda v: (f"<span class=ruler aria-hidden=true><i style='left:{v * 100:.0f}%'></i><em style='left:80%'></em></span>")
    path = c["paths"][c["head"]]
    nxt = "".join(
        f"<div class=nx><span class=nx-h>{lab}</span><b>{q['median']:+.1f}%</b><span class=nx-r>{q['lo']:+.1f} to {q['hi']:+.1f}</span>"
        f"<span class=nx-bar aria-hidden=true><i style='left:{50 + q['lo'] * 4:.1f}%;width:{max(0.8, (q['hi'] - q['lo']) * 4):.1f}%'></i>"
        f"<em style='left:{50 + q['median'] * 4:.1f}%'></em></span><span class=nx-m>{month_label(q['month'])}</span></div>"
        for lab, q in (("1 month", path[0]), ("3 months", path[2]), ("6 months", path[5])) if q)
    note = f"<a href='{e(c['note'])}' data-i18n=btn.note>Read the weekly note</a>" if c["note"] else ""
    src = cfg["settlement"]
    return f"""
<article class=bm>
<header class=bm-mast><p class=bm-kick><span>Benchmark № {number:02d}</span><span>{e(region)}</span><span>{e(src['statistics_office'])}</span></p>
<h1><span class=bm-flag aria-hidden=true>{c['flag']}</span>{e(c['country'])}</h1>
<p class=bm-q data-i18n=bm.q>How well does CiO Costs forecast construction prices where the official data is good?</p>
<p class=bm-src>{e(src['publication'])} · <span data-i18n=bm.latest>latest</span> {e(c['base'])}</p></header>

<section class=bm-score aria-label="Scoreboard">
 <div><b>{b1.get('inside', 0):.0%}</b><span data-i18n=bm.in1>inside the likely range, 1 month ahead</span>{gauge(b1.get('inside', 0))}</div>
 <div><b>{b3.get('inside', 0):.0%}</b><span data-i18n=bm.in3>inside the likely range, 3 months ahead</span>{gauge(b3.get('inside', 0))}</div>
 <div><b>{b1.get('mae', 0):.2f}<small> / {b1.get('mae_nochange', 0):.2f}</small></b><span data-i18n=bm.miss>average miss (points), ours / “no change”</span>
  <span class='verdict-tag {'ok' if beat else 'meh'}' data-i18n={'bm.beat' if beat else 'bm.nobeat'}>{'Beats “no change”' if beat else 'Does not beat “no change” yet'}</span></div>
 <div><b>{b1.get('n', 0)}</b><span data-i18n=bm.months>months tested, each with only the data known at the time</span></div>
</section>
<p class=bm-aim data-i18n=bm.aim>The aim is 80%: the real change should land inside our likely range 8 times in 10. Much higher means the range is too cautious; much lower, too bold.</p>

<section class=bm-sec><div class=bm-sec-h><h2 data-i18n=bm.vs>Forecast vs what happened</h2>
 <div class=bm-toggle role=group><button type=button data-bt-show=1 aria-pressed=true data-i18n=bm.t1>1 month ahead</button><button type=button data-bt-show=3 aria-pressed=false data-i18n=bm.t3>3 months ahead</button></div></div>
 <div class=bm-chart>{backtest_svg(c['key'], 1)}{backtest_svg(c['key'], 3)}</div>
 <p class=bm-legend><span class=lg-rng></span><span data-i18n=bm.lg.rng>our likely range</span><span class=lg-mid></span><span data-i18n=bm.lg.mid>our central forecast</span>
 <span class=lg-hit></span><span data-i18n=bm.lg.hit>official result, inside</span><span class=lg-miss></span><span data-i18n=bm.lg.miss>official result, outside</span></p></section>

{bench_drivers(c)}
<section class=bm-sec><div class=bm-sec-h><h2 data-i18n=bm.next>What we expect next</h2><span class=bm-small data-i18n=bm.next.d>change from {e(c['base'])}, with the likely range</span></div>
 <div class=bm-next>{nxt}</div></section>

<section class=bm-sec><div class=bm-sec-h><h2 data-i18n=bm.idx>The official index</h2></div><div class=chart>{chart_svg(c)}</div></section>

<section class='bm-sec bm-how'><h2 data-i18n=bm.how>How this test works</h2><ol>
 <li data-i18n=bm.how1>Every month in the past four years, we made a forecast using only the figures that were published by then.</li>
 <li data-i18n=bm.how2>We compared it with the official figure that came out later: did it land inside our likely range?</li>
 <li data-i18n=bm.how3>We also compare with the simplest rule — “prices stay where they are” — to see whether the forecast adds anything.</li></ol>
 <p class=bm-links>{note}<a href='{e(src['url'])}' target=_blank rel=noopener data-i18n=bm.source>Official source</a><a href='../../index.html' data-i18n=bm.back>The seven pilot countries</a></p></section>
</article>"""


# ------------------------------------------------------------------ build --
BUILT = ""
BUILT_TAG = ""                                     # cache-busting tag on assets, new on every build


def build() -> Path:
    global BUILT, BUILT_TAG
    from datetime import datetime, timezone
    BUILT = datetime.now(timezone.utc).isoformat(timespec="minutes")
    BUILT_TAG = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    cs = [c for c in (country_data(k) for k in list_countries() if not LIVE or k in LIVE) if c]
    gone = OUT / "countries"                          # countries not live yet: no public page
    if gone.exists():
        import shutil
        for d in gone.iterdir():
            if d.is_dir() and d.name not in {c["key"] for c in cs}:
                shutil.rmtree(d)
    cs.sort(key=lambda c: (c["key"] in BENCH, not c["official"], c["country"]))
    months = months_ahead(12)
    default = f"M:{months[2]}"
    updated = max((c["generated"] for c in cs), default=date.today().isoformat())
    slim = {c["key"]: dict({k: c[k] for k in ("country", "flag", "currency", "region", "kind", "official", "base", "head",
                                              "paths", "spark", "drivers", "materials", "step", "items", "bench", "trend", "trend_stats")},
                           aliases=load_country(c["key"]).get("aliases") or [],
                           office=load_country(c["key"])["settlement"].get("statistics_office", ""),
                           cc=ISO2.get(load_country(c["key"])["iso3"], ""),
                           crowd={r["name"]: r["median"] for r in crowd(c["key"]) if r.get("published")},
                           pitems=[{"code": i["code"], "name": i["name"], "unit": i["unit"]} for i in load_country(c["key"]).get("price_items", [])],
                           pending={r["item"]: (r["reporters"] if r.get("published") else r.get("pending", 0)) for r in crowd(c["key"])},
                           capital=CAPITALS.get(c["key"], "")) for c in cs}
    quiz = [{"key": c["key"], "country": c["country"], "flag": c["flag"], "cc": slim[c["key"]]["cc"], "material": m["name"], "period": p, "change": v,
             "step": c["step"]} for c in cs for m in c["materials"]
            for p, v in m.get("history", [])[-(8 if c["step"] == "quarter" else 12):] if abs(v) >= 0.2]   # recent periods only
    mats_series = {c["key"]: material_series(c) for c in cs if c["official"] and not c.get("bench")}
    for c in slim.values():
        for m in c["materials"]:
            m.pop("history", None)
    opts = [v for v, _, _ in target_options(months)]
    base = {"updated": updated, "months": opts, "default": default, "countries": slim, "site": SITE_URL}
    (OUT / "assets").mkdir(parents=True, exist_ok=True)
    # Body text uses the phone's own font; only the display face is embedded, loaded without blocking the page.
    display = SITE / "vendor" / "clash-grotesk.css"
    (OUT / "assets" / "fonts.css").write_text(display.read_text(encoding="utf-8") if display.exists() else "", encoding="utf-8")
    (OUT / "assets" / "cio.css").write_text((SITE / "site.css").read_text(encoding="utf-8"), encoding="utf-8")
    (OUT / "widget.js").write_text((SITE / "widget.js").read_text(encoding="utf-8"), encoding="utf-8")
    (OUT / "sw.js").write_text((SITE / "sw.js").read_text(encoding="utf-8").replace("__BUILT__", BUILT), encoding="utf-8")
    (OUT / "assets" / "cio.js").write_text((SITE / "i18n.js").read_text(encoding="utf-8") + "\n"
                                           + (SITE / "site.js").read_text(encoding="utf-8"), encoding="utf-8")

    (OUT / "index.html").write_text(shell("CiO Costs — will construction costs rise?", page_index(cs, months, default), base,
                                           page="home"), encoding="utf-8")
    (OUT / "glance.html").write_text(shell("Costs at a glance — CiO Costs", page_glance(cs, months, default), base, page="glance"),
                                      encoding="utf-8")
    (OUT / "method.html").write_text(shell("How it works — CiO Costs", page_method(), {"updated": updated}, page="method"),
                                      encoding="utf-8")
    (OUT / "play.html").write_text(shell("The Cost Call — CiO Costs", page_play(), dict(base, quiz=quiz), page="play",
                                          desc="A daily game on real construction prices across Africa."), encoding="utf-8")
    keys = [c["key"] for c in cs if load_country(c["key"]).get("price_items")]      # the benchmark takes no price reports
    items = {c["key"]: {"country": c["country"], "flag": c["flag"], "currency": c["currency"], "cc": slim[c["key"]]["cc"],
                        "capital": CAPITALS.get(c["key"], ""),
                        "items": load_country(c["key"]).get("price_items", []), "crowd": crowd(c["key"])} for c in cs}
    (OUT / "report.html").write_text(shell("Report prices — CiO Costs", page_report(keys), dict(base, report=items),
                                           page="report", desc="Report construction input prices in 18 African countries."),
                                     encoding="utf-8")
    cindex = {c["key"]: {"country": c["country"], "flag": c["flag"], "cc": slim[c["key"]]["cc"], "currency": c["currency"],
                         "official": c["official"], "office": load_country(c["key"])["settlement"].get("statistics_office", ""),
                         "step": c["step"], "rows": contract_series(c), "mats": mats_series.get(c["key"], {}),
                         "crowd": {n: r for n, r in crowd_series(c["key"]).items() if len(r) >= 6}} for c in cs if not c.get("bench")}
    (OUT / "data").mkdir(exist_ok=True)
    import csv as _csv
    for old in (OUT / "data").glob("crowd_index_*.csv"):     # never leave a file from an earlier build behind
        old.unlink()
    for c in cs:                                      # reported-price indices, free download
        cser = crowd_series(c["key"])
        if cser:
            with open(OUT / "data" / f"crowd_index_{c['key']}.csv", "w", newline="", encoding="utf-8") as fh:
                w = _csv.writer(fh)
                w.writerow(["item", "month", "typical_price", "people", "index"])
                w.writerows([n, r["m"], r["price"], r["people"], r["v"]] for n, rows in cser.items() for r in rows)
    for k, v in cindex.items():                       # free CSV downloads
        (OUT / "data" / f"contract_index_{k}.csv").write_text(
            "month,index,status\n" + "".join(f"{r['m']},{r['v']},{r['s']}\n" for r in v["rows"]), encoding="utf-8")
    (OUT / "calculator.html").write_text(shell("Bids & contracts — CiO Costs", page_calc(cs), dict(base, cindex=cindex), page="calc",
                                               desc="Price a bid with expected material cost changes, or adjust a contract payment with a monthly index."),
                                         encoding="utf-8")
    (OUT / "contract-index.html").write_text("<!doctype html><meta charset=utf-8><meta http-equiv=refresh content='0; url=calculator.html#adjust'>"
                                             "<title>Contract index — CiO Costs</title><a href='calculator.html#adjust'>Contract index</a>", encoding="utf-8")
    (OUT / "embed.html").write_text(
        "<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
        "<title>CiO Costs</title><base target=_blank><link rel=stylesheet href='assets/cio.css?v=" + BUILT_TAG + "'></head><body class=embed-body>" + page_embed()
        + "<script id=cio-data type='application/json'>" + json.dumps(base, separators=(",", ":")).replace("</", "<\\/")
        + "</script><script src='assets/cio.js?v=" + BUILT_TAG + "'></script></body></html>", encoding="utf-8")
    for c in cs:
        d = OUT / "countries" / c["key"]
        (d / "notes").mkdir(parents=True, exist_ok=True)
        if c["note"]:                                  # publish only the latest note's HTML
            src_note = ROOT / "countries" / c["key"] / c["note"]
            (d / c["note"]).write_text(src_note.read_text(encoding="utf-8"), encoding="utf-8")
        data = dict(base, countries={c["key"]: slim[c["key"]]}, focus=c["key"])
        (d / "index.html").write_text(shell(f"{c['country']} construction costs — CiO Costs",
                                            page_benchmark(c, BENCH.index(c["key"]) + 1) if c.get("bench") else
                                            page_country(c, months, default, crowd(c["key"])), data, rel="../../",
                                            page="bench" if c.get("bench") else "country",
                                            desc=(f"How well CiO Costs forecasts construction prices in {c['country']}: a benchmark."
                                                  if c.get("bench") else f"Construction cost outlook for {c['country']}.")),

                                      encoding="utf-8")
    # a convenience entry point at the repo root for opening the site locally
    (ROOT / "index.html").write_text("<!doctype html><meta charset=utf-8><meta http-equiv=refresh content='0; url=public/index.html'>"
                                     "<title>CiO Costs</title><a href='public/index.html'>Open CiO Costs</a>", encoding="utf-8")
    return OUT / "index.html"


if __name__ == "__main__":
    print("wrote", build())

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


def shell(title: str, body: str, data: dict, rel: str = "", page: str = "", desc: str = "") -> str:
    nav = [("index.html#countries", "Prices", "home", "nav.prices"), ("calculator.html", "Plan a bid", "calc", "nav.plan"),
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
<title>{e(title)}</title><meta name=description content="{e(desc or 'Construction cost forecasts for 18 African countries.')}">
<link rel=stylesheet href="{rel}assets/cio.css"><link rel=stylesheet href="{rel}assets/fonts.css" media=print onload="this.media='all'"></head><body data-page="{page}" data-rel="{rel}">
<header class=topbar><div class=wrap>
 <a class=mark href="{rel}index.html">{LOGO}CiO <span>Costs</span></a>
 <nav class=nav aria-label=Main>{links}</nav>
 {f"<a class='btn wa cta-wa' href='https://wa.me/{WA}' target=_blank rel=noopener aria-label='Chat with us on WhatsApp'>{WA_ICON}</a>" if WA else ""}
 <a class="btn primary cta" href="{rel}method.html#join" data-i18n=cta.join>Join the pilot</a>
 <select class=lang id=lang aria-label="Language"><option value=en>EN</option><option value=sw>Kiswahili</option><option value=fr>Français</option></select>
 <button class=theme id=theme type=button aria-label=Theme>◐</button>
</div></header>
<main class=wrap>{body}</main>
<nav class=bottombar aria-label=Main>{bottom}</nav>
<footer class=wrap><p class=footlinks><a href="{rel}method.html" data-i18n=nav.method>How it works</a> · <a href="{rel}glance.html" data-i18n=glance.h>Costs at a glance</a> · <a href="{rel}method.html#track" data-i18n=trust.track>Track record</a>
{f" · <a href='{CHANNEL}' target=_blank rel=noopener data-i18n=wa.follow>Follow on WhatsApp (free)</a>" if CHANNEL else ""}</p><span data-i18n=footer.short>CiO Lab · Forecasts are estimates with ranges, not advice. The Cost Call is a game: points have no cash
value. Official data: UBOS, KNBS, Stats SA, GSS, ZimStat, ANSD, Statistics Mauritius; oil and exchange rates from public
market sources. Updated {e(data.get('updated', ''))}.</span></footer>
<script id=cio-data type="application/json">{payload}</script>
<script src="{rel}assets/cio.js"></script></body></html>
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
            ("north", "North Africa"), ("official", "Official data"), ("indicator", "Estimates"),
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
 <a class=link href="play.html#{c['key']}" data-i18n=link.makecall>Make your call</a></div></article>""" for c in cs)
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
    body = f"""
<section class=hero><div><p class=eyebrow data-i18n=home.eyebrow>Construction cost outlook · 18 African countries</p>
 <h1 data-i18n=home.h1>Will building costs rise where you work?</h1>
 <p class=lede data-i18n=home.lede>Choose your country and a date. See whether building material prices are likely to go up, by how much,
 and what that means for the price you pay — updated every few hours.</p>
 <p class=whatis data-i18n=whatis>CiO Costs is a forecasting tool. It estimates how building material prices are likely to move, with a range.
 It is not an official statistic, a price list or financial advice.</p></div>
 <div class=hero-side><label class="when-box country-pick"><span data-i18n=pick.country>Your country</span><select id=mycountry aria-label="Your country">
 {''.join(f"<option value={c['key']}>{c['flag']} {e(c['country'])}</option>" for c in sorted(cs, key=lambda c: c['country']))}</select></label>
 {picker(months, default)}</div></section>
<p class=trust><span data-i18n=trust.sources>Official data from UBOS, KNBS, Stats SA, GSS, ZimStat, ANSD and Statistics Mauritius</span>
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
 <a class=btn href="play.html" data-i18n=btn.play>Play The Cost Call</a>
 <button class='btn share' type=button data-share><svg viewBox="0 0 24 24" width=16 height=16 aria-hidden=true fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M12 3v12M7 8l5-5 5 5M5 14v5h14v-5"/></svg> <span data-i18n=share>Share</span></button></div></div>
 <aside class=feat-side><h3><span data-i18n=feat.bymaterial>By material, to</span> <span data-when-label></span></h3><ul class=breakdown data-breakdown></ul></aside>
</section>

{QUICK}
<nav class=tabs id=countries aria-label="Filter countries">{tab_html}</nav>
<div class=toolbar><label class=search><span class=sr-only>Search</span>
 <input id=q type=search data-i18n-ph=search.ph placeholder="Search countries and materials — e.g. Kenya Uganda cement" autocomplete=off></label>
 <span class=count id=count aria-live=polite></span></div>
<div class="grid folded" id=grid>{cards}</div>
<p class=empty id=empty data-i18n=empty>No country matches. Try “cement”, “Kenya” or “West”.</p>

<p class=center><button class=btn type=button id=grid-open data-i18n=grid.open>Show all 18 countries</button></p>
<p class=moreline><a href=glance.html data-i18n=glance.link>Compare all countries in one table →</a></p>
<p class=gameline>🎯 <span data-i18n=game.line>Five quick calls a day on real prices.</span> <a href=play.html data-i18n=game.cta>Play today's calls</a></p>
"""
    return body


BUY = "".join(f"<button type=button class=pill data-buy={k} data-i18n=buy.{k}>{t}</button>" for k, t in
              (("cement", "Cement"), ("steel", "Steel"), ("sand", "Sand"), ("diesel", "Diesel"), ("roofing", "Roofing")))
QUICK = """<section class=quickrep aria-labelledby=qr-h><div class=qr-head><h2 id=qr-h data-i18n=qr.h>What did you pay this week?</h2>
 <p class=muted data-i18n=qr.d>Tell us one price. It is anonymous and takes 20 seconds — and once 3 people report an item, everyone sees the typical price.</p>
 <p class=qr-progress data-qr-progress></p></div>
 <form class=qr-form><label><span data-i18n=rep.item>Item</span><select name=item></select></label>
 <label><span><span data-i18n=rep.price>Price</span> <span class=muted data-qr-ccy></span></span><input name=price type=number min=1 step=any inputmode=decimal required></label>
 <fieldset class=areapick><legend data-i18n=rep.area>Where is that?</legend>
  <label><input type=radio name=area value=capital checked><span><span data-i18n=rep.incap>In</span> <b data-capital></b></span></label>
  <label><input type=radio name=area value=other><span data-i18n=rep.elsewhere>Elsewhere in the country</span></label></fieldset>
 <label class=qr-town hidden><span data-i18n=rep.town>Town or area</span><input name=location></label>
 <button class='btn primary big' type=submit data-i18n=rep.send>Send price</button>
 <p class='formmsg muted' role=status></p></form></section>"""


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
    return (f"<svg class=fan viewBox='0 0 {w} {h}' role=img aria-label='History and forecast for {e(c['head'])}' data-xs='{json.dumps(xs)}'>"
            f"<line x1='{X(k0):.1f}' x2='{X(k0):.1f}' y1=10 y2='{h - 22}' class=nowline /><text x='{X(k0) + 4:.1f}' y=18 class=nowtext>forecast →</text>"
            f"<polygon points='{band}' class=band /><polyline points='{hist}' class=histline />"
            f"<polyline points='{med}' class=medline /><line class=marker y1=10 y2='{h - 22}' x1=0 x2=0 />{ticks}</svg>"
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
                   f"<td>{yr(m)}</td><td data-mexp>–</td><td class=why>{why(m['name'])}</td></tr>" for m in c["materials"])
    step = "quarter" if c["step"] == "quarter" else "month"
    if mats:
        mat_html = f"""<section><div class=section-h><h2 data-i18n=sec.materials>Costs by material</h2><span class=muted><span data-i18n=lbl.offlatest{step}>Official figures, latest {step}:</span> {e(c['base'])}</span></div><div class=tablewrap><table class=glance>
<thead><tr><th scope=col data-i18n=th.material>Material</th><th scope=col data-i18n=th.prev{step}>Change on the previous {step}</th><th scope=col data-i18n=th.year>Change on a year</th>
<th scope=col><span data-i18n=th.expby>Expected by</span> <span data-when-label></span></th><th scope=col data-i18n=th.why>What moves it</th></tr></thead><tbody>{mats}</tbody></table></div></section>"""
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
        return (f"<span class=progress-line><b>{r.get('pending', 0)} of 3</b> reports this week · "
                f"<a href='../../report.html#{c['key']}'>add yours</a></span>")
    def area(r, a):
        v = r.get(a)
        return f"{v:,.0f}" if v is not None and v == v else f"<span class=muted>{r.get(a + '_n', 0) or 0} of 3</span>"
    cap = CAPITALS.get(c["key"], "capital")
    crowd_html = "".join(f"<tr><th scope=row>{e(r['name'])}</th><td>{price(r)}</td><td>{area(r, 'capital')}</td><td>{area(r, 'other')}</td>"
                         f"<td>{r['reporters'] if r.get('published') else '–'}</td><td>{ch(r)}</td></tr>" for r in crowd_rows)
    crowd_sec = (f"<div class=tablewrap><table class=glance><thead><tr><th data-i18n=th.item>Item</th><th data-i18n=th.typical>Typical price</th>"
                 f"<th>{e(cap)}</th><th data-i18n=th.elsewhere>Elsewhere</th><th data-i18n=th.reporters>Reporters</th>"
                 f"<th data-i18n=th.vs4>vs 4 weeks</th></tr></thead><tbody>{crowd_html}</tbody></table></div>"
                 f"<p class=muted data-i18n=crowd.areas>Area prices use the last 4 weeks and appear once 3 people report from that area.</p>") if crowd_rows else (
        f"<div class=tile><p><b>0 of 3</b> reports this week for {e(c['country'])}. Prices appear here once 3 people report "
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
 <div class=actions><a class='btn primary' href="../../play.html#{c['key']}" data-i18n=link.makecall>Make your call</a>{note}
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
            return (f"<p class='track muted'><b data-i18n=track.h>Track record</b>: <span data-i18n=track.crowdsoon>once 3 people report an item "
                    f"for 4 weeks, we show what they pay next to our estimate here.</span> <a href='../../report.html#{c['key']}' data-i18n=track.addyours>Report a price</a></p>")
        li = "".join(f"<li>{e(r['name'])}: {arrow(r['change_pct'])} <b>{r['change_pct']:+.1f}%</b> <span class=muted>"
                     f"({r['reporters']} people, 4 weeks)</span></li>" for r in got[:4])
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
    if not rows and c["key"] == "uganda":
        f = ROOT / "countries" / "uganda" / "outputs" / "forecast" / "backtest_errors.csv"
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
    return f"<div class=track><b data-i18n=track.h>Track record</b> <span class=muted>· {label}</span><ul>{li}</ul></div>"


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
exchange rates for 18 currencies, rainfall, and published tax changes such as fuel and cement duties.</p></div>
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
<section class=join id=join><div><h2 data-i18n=cta.join>Join the pilot</h2><p data-i18n=join.d>Contractors, quantity surveyors, developers and lenders: report
the prices you pay each week, play The Cost Call for points on the leaderboard, and get the Monday note for your country.
Free. Ask CiO Lab for an invite code.</p></div><div class=actions>{f"<a class='btn big' href='{CHANNEL}' target=_blank rel=noopener data-i18n=wa.follow>Follow on WhatsApp (free)</a>" if CHANNEL else ""}
<a class='btn primary big' href=app data-i18n=join.signin>Pilot sign-in</a></div></section>
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
<section><div class=section-h><h2 data-i18n=calls.h>This week's calls</h2><span class=muted data-i18n=calls.d>On the next official releases — scored when the data
is published</span></div><div class=grid id=calls></div></section>
<p class=muted>Play for points and a place on the leaderboard in the pilot app. <a href="method.html#join">Join the pilot</a>.</p>
"""


def page_report(keys: list[str]) -> str:
    opts = "".join(f"<option value={k}>{flag(load_country(k)['iso3'])} {e(load_country(k)['country'])}</option>" for k in keys)
    return f"""
<section class=prose><p class=eyebrow data-i18n=nav.report>Report prices</p><h1 data-i18n=rep.h1>What did you pay this week?</h1>
<p class=lede data-i18n=rep.lede>Tell us the price you paid or were quoted for a construction input, in any of our 18 countries. Reports are
anonymous: we publish medians by country, item and week — never names, numbers or single reports.</p></section>
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
 <label><span data-i18n=rep.contact>Your phone or email</span> <span class=muted data-i18n=rep.contact.note>(optional, never published — only if you want follow-ups)</span><input name=contact></label>
 <button class='btn primary big' type=submit data-i18n=rep.send>Send price</button><p class='formmsg muted' role=status></p></form>
 <aside class=panel><h2 data-i18n=rep.others>What others report</h2><div id=crowdview></div>
 <p class=fineprint data-i18n=crowd.note>Typical prices reported by buyers — not official or supplier prices.</p>
 <p class=muted data-i18n=rep.median>Medians of each person's reports, so repeated or wild entries can't move the numbers.</p></aside></section>
"""


def page_calc() -> str:
    return """
<section class=prose><p class=eyebrow data-i18n=tool.calc.t>Bid escalation calculator</p><h1 data-i18n=calc.h1>How much could input prices move over your contract?</h1>
<p class=lede data-i18n=calc.lede>Enter your contract and the mix of inputs. You get the expected escalation in your currency, with a likely
range — a starting point for contingencies and price-adjustment clauses.</p></section>
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
"""


def page_embed() -> str:
    return "<div id=embed class=embedcard></div>"


# ------------------------------------------------------------------ build --
BUILT = ""


def build() -> Path:
    global BUILT
    from datetime import datetime, timezone
    BUILT = datetime.now(timezone.utc).isoformat(timespec="minutes")
    cs = [c for c in (country_data(k) for k in list_countries()) if c]
    cs.sort(key=lambda c: (not c["official"], c["country"]))
    months = months_ahead(12)
    default = f"M:{months[2]}"
    updated = max((c["generated"] for c in cs), default=date.today().isoformat())
    slim = {c["key"]: dict({k: c[k] for k in ("country", "flag", "currency", "region", "kind", "official", "base", "head",
                                              "paths", "spark", "drivers", "materials", "step", "items")},
                           cc=ISO2.get(load_country(c["key"])["iso3"], ""),
                           crowd={r["name"]: r["median"] for r in crowd(c["key"]) if r.get("published")},
                           pitems=[{"code": i["code"], "name": i["name"], "unit": i["unit"]} for i in load_country(c["key"]).get("price_items", [])],
                           pending={r["item"]: (r["reporters"] if r.get("published") else r.get("pending", 0)) for r in crowd(c["key"])},
                           capital=CAPITALS.get(c["key"], "")) for c in cs}
    quiz = [{"key": c["key"], "country": c["country"], "flag": c["flag"], "cc": slim[c["key"]]["cc"], "material": m["name"], "period": p, "change": v,
             "step": c["step"]} for c in cs for m in c["materials"]
            for p, v in m.get("history", [])[-(8 if c["step"] == "quarter" else 12):] if abs(v) >= 0.2]   # recent periods only
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

    (OUT / "index.html").write_text(shell("CiO Costs — will building costs rise?", page_index(cs, months, default), base,
                                           page="home"), encoding="utf-8")
    (OUT / "glance.html").write_text(shell("Costs at a glance — CiO Costs", page_glance(cs, months, default), base, page="glance"),
                                      encoding="utf-8")
    (OUT / "method.html").write_text(shell("How it works — CiO Costs", page_method(), {"updated": updated}, page="method"),
                                      encoding="utf-8")
    (OUT / "play.html").write_text(shell("The Cost Call — CiO Costs", page_play(), dict(base, quiz=quiz), page="play",
                                          desc="A daily game on real construction prices across Africa."), encoding="utf-8")
    keys = [c["key"] for c in cs]
    items = {c["key"]: {"country": c["country"], "flag": c["flag"], "currency": c["currency"], "cc": slim[c["key"]]["cc"],
                        "capital": CAPITALS.get(c["key"], ""),
                        "items": load_country(c["key"]).get("price_items", []), "crowd": crowd(c["key"])} for c in cs}
    (OUT / "report.html").write_text(shell("Report prices — CiO Costs", page_report(keys), dict(base, report=items),
                                           page="report", desc="Report construction input prices in 18 African countries."),
                                     encoding="utf-8")
    (OUT / "calculator.html").write_text(shell("Bid escalation calculator — CiO Costs", page_calc(), base, page="calc",
                                               desc="Expected input-cost escalation over your contract, with a range."),
                                         encoding="utf-8")
    (OUT / "embed.html").write_text(
        "<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
        "<title>CiO Costs</title><base target=_blank><link rel=stylesheet href='assets/cio.css'></head><body class=embed-body>" + page_embed()
        + "<script id=cio-data type='application/json'>" + json.dumps(base, separators=(",", ":")).replace("</", "<\\/")
        + "</script><script src='assets/cio.js'></script></body></html>", encoding="utf-8")
    for c in cs:
        d = OUT / "countries" / c["key"]
        (d / "notes").mkdir(parents=True, exist_ok=True)
        if c["note"]:                                  # publish only the latest note's HTML
            src_note = ROOT / "countries" / c["key"] / c["note"]
            (d / c["note"]).write_text(src_note.read_text(encoding="utf-8"), encoding="utf-8")
        data = dict(base, countries={c["key"]: slim[c["key"]]}, focus=c["key"])
        (d / "index.html").write_text(shell(f"{c['country']} construction costs — CiO Costs",
                                            page_country(c, months, default, crowd(c["key"])), data, rel="../../",
                                            page="country", desc=f"Construction cost outlook for {c['country']}."),
                                      encoding="utf-8")
    # a convenience entry point at the repo root for opening the site locally
    (ROOT / "index.html").write_text("<!doctype html><meta charset=utf-8><meta http-equiv=refresh content='0; url=public/index.html'>"
                                     "<title>CiO Costs</title><a href='public/index.html'>Open CiO Costs</a>", encoding="utf-8")
    return OUT / "index.html"


if __name__ == "__main__":
    print("wrote", build())

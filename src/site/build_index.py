#!/usr/bin/env python3
"""
build_index.py — write index.html at the repo root: the project's front page.

Design: a prediction-market layout (top bar with search, category tabs, a featured
question, question cards with one big "chance" number, a probability bar and a trend
line), in CiO Lab's brand (near-black ground, amber #ffc21a and teal accents, Clash
Grotesk display + Inter text, the animated CiO mark), worded for contractors.

Self-contained: fonts are embedded, no external requests, so it opens straight from
disk (file://). Data: countries/<c>/outputs/forecast_latest.json (written by
weekly_note.py). The Monday job (src/market/cycle.py weekly) rebuilds it.

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
ISO2 = {"UGA": "UG", "KEN": "KE", "RWA": "RW", "TZA": "TZ", "ETH": "ET", "ZAF": "ZA", "ZMB": "ZM", "BWA": "BW",
        "MWI": "MW", "ZWE": "ZW", "NAM": "NA", "MOZ": "MZ", "MUS": "MU", "GHA": "GH", "NGA": "NG", "SEN": "SN",
        "EGY": "EG", "MAR": "MA"}
KIND = {"structural": "Official index · full model", "quarterly": "Official index · quarterly model",
        "nowcast": "Official index · monthly", "pressure": "Import-cost outlook"}


def flag(iso3: str) -> str:
    return "".join(chr(0x1F1E6 + ord(c) - 65) for c in ISO2.get(iso3, "")) or "🏳️"


def chance(r: dict) -> float | None:
    """P(change > 0): the contract probability where we have it, else from the 80% range
    assuming a normal spread (range half-width = 1.2816 sd)."""
    if r.get("p_up") is not None:
        return min(0.99, max(0.01, r["p_up"]))
    if r.get("median") is None or r.get("lo") is None or r.get("hi") is None or r["hi"] <= r["lo"]:
        return None
    sd = (r["hi"] - r["lo"]) / (2 * 1.2816)
    p = 0.5 * (1 + math.erf(r["median"] / (sd * math.sqrt(2))))
    return min(0.99, max(0.01, p))          # never show certainty, as prediction markets don't


def pick(d: dict) -> dict | None:
    rows = [r for r in d.get("rows", []) if r.get("median") is not None]
    if not rows:
        return None
    if d.get("kind") in ("structural", "quarterly"):
        return [x for x in rows if x["series"] == rows[0]["series"]][-1]       # headline series, furthest month
    return rows[-1] if d.get("kind") == "pressure" else rows[0]


def question(cfg: dict, d: dict, r: dict) -> str:
    c = cfg["country"]
    if d.get("kind") == "pressure":
        return f"Will import costs push {c}'s building prices up over the next 6 months?"
    when = r["period"]
    verb = "in" if d.get("kind") == "nowcast" else "by"
    return f"Will {c}'s construction input prices rise {verb} {when}?"


def advice(r: dict, kind: str) -> str:
    m = r["median"]
    if kind == "pressure":
        return (f"Import costs point {'up' if m > 0 else 'down'} about {abs(m):.1f}% — check supplier quotes "
                "before fixing prices.")
    if m >= 0.25:
        return f"Allow about +{m:.1f}% on quotes for work priced to {r['period']}."
    if m <= -0.25:
        return f"Prices may ease about {abs(m):.1f}% by {r['period']} — consider delaying bulk buying."
    return f"Little change expected to {r['period']} — today's quotes are a fair guide."


def spark_svg(sp: dict | None, w: int = 120, h: int = 36, big: bool = False) -> str:
    vals = (sp or {}).get("values") or []
    if len(vals) < 2:
        return ""
    lo, hi = min(vals), max(vals)
    span = (hi - lo) or 1.0
    pts = [(i * (w - 4) / (len(vals) - 1) + 2, h - 3 - (v - lo) * (h - 8) / span) for i, v in enumerate(vals)]
    line = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    area = f"2,{h} " + line + f" {w - 2},{h}"
    up = vals[-1] >= vals[0]
    gid = "g" + str(abs(hash(line)) % 10**8)
    dot = f"<circle cx='{pts[-1][0]:.1f}' cy='{pts[-1][1]:.1f}' r='{3.2 if big else 2.4}' fill='var(--trend)'/>"
    label = e(f"{sp.get('label', 'trend')}: {vals[0]:.1f} to {vals[-1]:.1f}")
    return (f"<svg class='spark{' big' if big else ''}' viewBox='0 0 {w} {h}' preserveAspectRatio='none' role='img' "
            f"aria-label='{label}'><defs><linearGradient id='{gid}' x1='0' y1='0' x2='0' y2='1'>"
            f"<stop offset='0' stop-color='var(--trend)' stop-opacity='.28'/><stop offset='1' stop-color='var(--trend)' "
            f"stop-opacity='0'/></linearGradient></defs><polygon points='{area}' fill='url(#{gid})'/>"
            f"<polyline points='{line}' fill='none' stroke='var(--trend)' stroke-width='{2.2 if big else 1.6}' "
            f"stroke-linejoin='round' stroke-linecap='round' vector-effect='non-scaling-stroke'/>{dot}</svg>"
            f"<span class=sr-only>{'Rising' if up else 'Falling'} trend</span>")


def load(key: str) -> dict:
    cfg = load_country(key)
    f = ROOT / "countries" / key / "outputs" / "forecast_latest.json"
    d = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    r = pick(d)
    notes = sorted((ROOT / "countries" / key / "notes").glob(f"weekly_{key}_*.html"))
    return {"key": key, "cfg": cfg, "d": d, "r": r, "p": chance(r) if r else None,
            "note": f"countries/{key}/notes/{notes[-1].name}" if notes else None}


def bar(p: float | None) -> str:
    if p is None:
        return "<div class=pbar aria-hidden=true><span style='width:50%'></span></div>"
    return (f"<div class=pbar role=img aria-label='{p:.0%} chance of a rise'><span style='width:{p * 100:.0f}%'></span></div>")


def chips(x: dict) -> str:
    cfg = x["cfg"]
    live = f"<span class='chip live'><i></i>{len(cfg['markets'])} live contracts</span>" if cfg["markets"] else ""
    return f"{live}<span class=chip>{e(KIND.get(x['d'].get('kind', ''), 'Forecast'))}</span>"


def card(x: dict) -> str:
    cfg, d, r, p = x["cfg"], x["d"], x["r"], x["p"]
    if not r:
        return ""
    trend = "rising" if r["median"] > 0.05 else ("easing" if r["median"] < -0.05 else "flat")
    rng = f"{r['lo']:+.1f}% to {r['hi']:+.1f}%" if r.get("lo") is not None else "range not modelled"
    pct = "–" if p is None else f"{p * 100:.0f}%"
    off = cfg.get("official_reading")
    official = (f"<p class=official>Official: {e(off['series'].split(',')[0].split('(')[0].strip())} "
                f"{off['change_year_pct']:+.1f}% on a year</p>") if off and off.get("change_year_pct") is not None else ""
    note = f"<a class=btn href='{e(x['note'])}'>Weekly note <span aria-hidden=true>→</span></a>" if x["note"] else ""
    search = " ".join([cfg["country"], cfg["currency"], REGION.get(x["key"], ""), trend,
                       *(m["title"] for m in cfg["markets"]), *(i["name"] for i in cfg.get("price_items", []))]).lower()
    return f"""<article class="card {'is-live' if cfg['markets'] else ''}" data-region="{REGION.get(x['key'], '')}"
 data-live="{'1' if cfg['markets'] else '0'}" data-trend="{trend}" data-search="{e(search)}">
 <div class=card-top><span class=flag aria-hidden=true>{flag(cfg['iso3'])}</span><span class=country>{e(cfg['country'])}</span>
 <span class=chips>{chips(x)}</span></div>
 <h3 class=q>{e(question(cfg, d, r))}</h3>
 <div class=odds><div><span class=pct>{pct}</span><span class=pct-l>chance of a rise</span></div>{spark_svg(d.get('spark'))}</div>
 {bar(p)}
 <dl class=facts><div><dt>Expected</dt><dd>{r['median']:+.1f}%</dd></div><div><dt>Likely range</dt><dd>{e(rng)}</dd></div></dl>
 <p class=advice>{e(advice(r, d.get('kind', '')))}</p>{official}
 <div class=card-foot>{note}<a class=link href='countries/{x['key']}/README.md'>Details</a></div>
</article>"""


def featured(x: dict) -> str:
    cfg, d, r, p = x["cfg"], x["d"], x["r"], x["p"]
    sp = d.get("spark") or {}
    dates = sp.get("dates") or []
    span = f"{dates[0]} to {dates[-1]}" if dates else ""
    note = f"<a class='btn primary' href='{e(x['note'])}'>Read this week's note</a>" if x["note"] else ""
    rows = [q for q in d.get("rows", []) if q.get("period") == r["period"]][:6]
    items = "".join(f"<li><span>{e(q['series'])}</span><b>{q['median']:+.1f}%</b></li>" for q in rows)
    return f"""<section class=featured aria-labelledby=feat-q>
 <div class=feat-main>
  <div class=card-top><span class=flag aria-hidden=true>{flag(cfg['iso3'])}</span><span class=country>{e(cfg['country'])}</span>
  <span class=chips>{chips(x)}</span></div>
  <h2 id=feat-q class=feat-q>{e(question(cfg, d, r))}</h2>
  <div class=feat-odds><div><span class=pct>{'–' if p is None else f'{p * 100:.0f}%'}</span><span class=pct-l>chance of a rise</span></div>
   <div><span class=pct small>{r['median']:+.1f}%</span><span class=pct-l>expected change</span></div>
   <div><span class=pct small>{r['lo']:+.1f}% to {r['hi']:+.1f}%</span><span class=pct-l>likely range (80%)</span></div></div>
  {bar(p)}
  <div class=feat-chart>{spark_svg(sp, 640, 150, big=True)}<p class=muted>{e(sp.get('label', ''))}, {e(span)}</p></div>
  <p class="advice big">{e(advice(r, d.get('kind', '')))}</p>
  <div class=actions>{note}<a class=btn href=FORECASTING.md>How we forecast</a></div>
 </div>
 <aside class=feat-side aria-label="Breakdown"><h3>By material, to {e(r['period'])}</h3><ul class=breakdown>{items}</ul>
 <p class=muted>{e(d.get('basis', ''))}.</p></aside>
</section>"""


def movers(xs: list[dict]) -> str:
    fx = [(x["cfg"]["country"], x["cfg"]["currency"], x["d"].get("drivers", {}).get("fx_13w_pct")) for x in xs]
    fx = sorted([f for f in fx if f[2] is not None], key=lambda f: -abs(f[2]))[:5]
    brent = next((x["d"]["drivers"] for x in xs if x["d"].get("drivers")), {})
    rows = "".join(f"<li><span>{e(c)} <small>{e(cur)}</small></span><b class={'up' if v > 0 else 'down'}>"
                   f"{'weaker' if v > 0 else 'stronger'} {abs(v):.1f}%</b></li>" for c, cur, v in fx)
    b = brent.get("brent_13w_pct")
    return f"""<aside class=movers aria-labelledby=mv><h3 id=mv>This week's movers</h3>
 <p class=mover-lead>Oil (Brent) <b>{brent.get('brent_usd', 0):,.0f} USD</b>
 <span class={'up' if (b or 0) > 0 else 'down'}>{'+' if (b or 0) > 0 else ''}{(b or 0):.1f}% in 13 weeks</span></p>
 <p class=muted>Biggest currency moves against the US dollar (13 weeks). A weaker currency makes imported materials
 dearer.</p><ul class=breakdown>{rows}</ul></aside>"""


def css() -> str:
    fonts = "".join((SITE / "vendor" / f).read_text(encoding="utf-8") for f in ("clash-grotesk.css", "inter.css")
                    if (SITE / "vendor" / f).exists())
    return fonts + """
:root{--display:'Clash Grotesk','Inter',system-ui,sans-serif;--text:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
--page:#f4f7fa;--surface:#ffffff;--raise:#eef2f6;--ink:#0e0f11;--ink-2:#44474c;--ink-3:#5f646b;--line:#e1e6ec;
--accent:#9a7200;--accent-fill:#ffc21a;--accent-ink:#141108;--teal:#027f8d;--trend:#027f8d;--up:#b3261e;--down:#0a7a3e;
--bar-bg:#e3e9ef;--focus:#027f8d;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--page:#0a0a0b;--surface:#141416;--raise:#1b1b1e;
--ink:#f5f5f2;--ink-2:#c9c9c4;--ink-3:#9a9a96;--line:#26262a;--accent:#ffc21a;--accent-fill:#ffc21a;--teal:#12a9ba;
--trend:#12a9ba;--up:#ff7b72;--down:#3fb950;--bar-bg:#26262a;--focus:#ffc21a;color-scheme:dark}}
:root[data-theme=dark]{--page:#0a0a0b;--surface:#141416;--raise:#1b1b1e;--ink:#f5f5f2;--ink-2:#c9c9c4;--ink-3:#9a9a96;
--line:#26262a;--accent:#ffc21a;--accent-fill:#ffc21a;--teal:#12a9ba;--trend:#12a9ba;--up:#ff7b72;--down:#3fb950;
--bar-bg:#26262a;--focus:#ffc21a;color-scheme:dark}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--page);color:var(--ink);
font:16px/1.5 var(--text);-webkit-font-smoothing:antialiased}
a{color:inherit}:focus-visible{outline:2px solid var(--focus);outline-offset:2px;border-radius:6px}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.wrap{max-width:1200px;margin:0 auto;padding:0 16px}
/* top bar */
.topbar{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--page) 88%,transparent);
backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--line)}
.topbar .wrap{display:flex;align-items:center;gap:14px;height:62px}
.mark{display:flex;align-items:center;gap:9px;font-family:var(--display);font-weight:600;font-size:19px;
letter-spacing:-.01em;text-decoration:none;white-space:nowrap}.mark small{color:var(--ink-3);font:500 13px var(--text)}
.logo{overflow:visible}.logo .ring{transform-origin:12px 12px;animation:cio-spin 9s linear infinite}
.logo .orbit{transform-origin:12px 12px;animation:cio-spin 4.5s linear infinite reverse}
.logo .core{transform-origin:12px 12px;animation:cio-breathe 3.2s ease-in-out infinite}
@keyframes cio-spin{to{transform:rotate(360deg)}}@keyframes cio-breathe{0%,100%{transform:scale(1)}50%{transform:scale(.82)}}
@media (prefers-reduced-motion:reduce){.logo *{animation:none!important}}
.search{flex:1;max-width:460px;position:relative}.search input{width:100%;height:40px;border-radius:999px;
border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:0 16px 0 40px;font:inherit;font-size:15px}
.search svg{position:absolute;left:14px;top:12px;color:var(--ink-3)}
.nav{display:flex;gap:4px;margin-left:auto}.nav a{padding:8px 12px;border-radius:999px;text-decoration:none;
color:var(--ink-2);font-weight:500;font-size:15px}.nav a:hover{background:var(--raise);color:var(--ink)}
.cta{background:var(--accent-fill);color:var(--accent-ink)!important;font-weight:600!important}
.theme{border:1px solid var(--line);background:var(--surface);color:var(--ink);height:36px;min-width:36px;border-radius:999px;cursor:pointer;font-size:15px}
/* tabs */
.tabs{display:flex;gap:6px;overflow-x:auto;padding:12px 0;scrollbar-width:none}.tabs::-webkit-scrollbar{display:none}
.tabs button{flex:none;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);border-radius:999px;
padding:7px 14px;font:500 14px var(--text);cursor:pointer}.tabs button[aria-pressed=true]{background:var(--ink);color:var(--page);border-color:var(--ink)}
/* intro */
.intro{display:flex;flex-wrap:wrap;gap:8px 24px;align-items:baseline;justify-content:space-between;margin:14px 0 18px}
.intro h1{font:600 clamp(1.6rem,3.4vw,2.3rem)/1.1 var(--display);margin:0;letter-spacing:-.015em}
.intro p{margin:0;color:var(--ink-3);max-width:60ch}
/* featured */
.top{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;align-items:start}
.featured{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:20px;background:var(--surface);border:1px solid var(--line);
border-radius:18px;padding:20px}.feat-q{font:600 clamp(1.3rem,2.6vw,1.75rem)/1.2 var(--display);margin:10px 0 14px;letter-spacing:-.01em}
.feat-odds{display:flex;flex-wrap:wrap;gap:12px 32px;align-items:flex-end;margin-bottom:10px}
.feat-chart{margin:14px 0 6px}.spark.big{width:100%;height:150px;display:block}
.feat-side h3,.movers h3{font:600 15px var(--text);margin:0 0 10px}
.breakdown{list-style:none;margin:0;padding:0}.breakdown li{display:flex;justify-content:space-between;gap:10px;padding:8px 0;
border-bottom:1px solid var(--line);font-size:14px}.breakdown li:last-child{border-bottom:0}
.movers{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:18px}
.mover-lead{font-size:15px;margin:0 0 6px}.up{color:var(--up)}.down{color:var(--down)}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
/* cards */
.section-h{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:30px 0 12px}
.section-h h2{font:600 1.35rem var(--display);margin:0}.count{color:var(--ink-3);font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:14px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:16px;display:flex;flex-direction:column;
transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}
.card:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--accent) 55%,var(--line));
box-shadow:0 10px 30px -18px rgba(0,0,0,.35)}
.card-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.flag{font-size:20px;line-height:1}
.country{font-weight:600;font-size:14px;color:var(--ink-2)}.chips{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}
.chip{font-size:11.5px;font-weight:500;color:var(--ink-3);background:var(--raise);border-radius:999px;padding:3px 9px;white-space:nowrap}
.chip.live{color:var(--accent);background:color-mix(in srgb,var(--accent-fill) 16%,transparent);display:inline-flex;align-items:center;gap:5px}
.chip.live i{width:6px;height:6px;border-radius:50%;background:var(--accent-fill);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent-fill) 30%,transparent)}
.q{font:600 1.08rem/1.3 var(--display);margin:10px 0 12px;letter-spacing:-.005em;min-height:2.6em}
.odds{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.pct{display:block;font:600 2.1rem/1 var(--display);letter-spacing:-.02em}.pct.small,.pct[small]{font-size:1.35rem}
.pct-l{display:block;color:var(--ink-3);font-size:12.5px;margin-top:4px}
.spark{width:120px;height:36px;flex:none}
.pbar{height:8px;border-radius:999px;background:var(--bar-bg);overflow:hidden;margin:10px 0 12px}
.pbar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--teal),var(--accent-fill))}
.facts{display:grid;grid-template-columns:1fr 1.4fr;gap:8px;margin:0 0 10px}.facts div{background:var(--raise);border-radius:10px;padding:8px 10px}
.facts dt{font-size:11.5px;color:var(--ink-3)}.facts dd{margin:2px 0 0;font-weight:600;font-size:14px}
.advice{font-size:14px;color:var(--ink-2);margin:0 0 8px;padding-left:10px;border-left:3px solid var(--accent-fill)}
.advice.big{font-size:15.5px;margin-top:12px}.official{font-size:12.5px;color:var(--ink-3);margin:0 0 8px}
.card-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:8px}
.btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink);
border-radius:999px;padding:8px 14px;font-weight:600;font-size:14px;text-decoration:none}
.btn:hover{background:var(--raise)}.btn.primary{background:var(--accent-fill);color:var(--accent-ink);border-color:var(--accent-fill)}
.link{color:var(--ink-3);font-size:14px}.muted{color:var(--ink-3);font-size:13px;margin:6px 0 0}
.empty{display:none;text-align:center;color:var(--ink-3);padding:30px}
/* explainers */
.howto{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:16px}
.tile b{display:block;font:600 1.05rem var(--display);margin-bottom:4px}.tile p{margin:0;color:var(--ink-2);font-size:14.5px}
.num{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--accent-fill);
color:var(--accent-ink);font-weight:700;font-size:13px;margin-bottom:8px}
.join{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:22px;display:grid;
grid-template-columns:1.3fr 1fr;gap:18px;align-items:center;margin-top:30px}
.join h2{font:600 1.5rem var(--display);margin:0 0 6px}.join p{margin:0;color:var(--ink-2)}
.docs{columns:2 240px;padding-left:18px;color:var(--ink-2)}.docs li{margin:5px 0}
footer{color:var(--ink-3);font-size:13px;border-top:1px solid var(--line);margin-top:36px;padding:16px 0 40px}
@media (max-width:980px){.top{grid-template-columns:1fr}.featured{grid-template-columns:1fr}}
@media (max-width:720px){.nav a:not(.cta){display:none}.search{max-width:none}.mark small{display:none}
.join{grid-template-columns:1fr}.facts{grid-template-columns:1fr 1fr}}
"""


JS = """
(function(){
 const root=document.documentElement,btn=document.getElementById('theme'),order=['auto','light','dark'],
 icon={auto:'◐',light:'☀',dark:'☾'};
 let t='auto';try{t=localStorage.getItem('cio-theme')||'auto'}catch(e){}
 function apply(v){t=v;if(v==='auto')root.removeAttribute('data-theme');else root.setAttribute('data-theme',v);
  btn.textContent=icon[v];btn.setAttribute('aria-label','Theme: '+v);try{localStorage.setItem('cio-theme',v)}catch(e){}}
 apply(t);btn.onclick=()=>apply(order[(order.indexOf(t)+1)%3]);
 const cards=[...document.querySelectorAll('.grid .card')],tabs=[...document.querySelectorAll('.tabs button')],
 q=document.getElementById('q'),count=document.getElementById('count'),empty=document.getElementById('empty');
 let tab='all';
 function show(){const s=q.value.trim().toLowerCase();let n=0;cards.forEach(c=>{const d=c.dataset;
  const okTab=tab==='all'||(tab==='live'?d.live==='1':(tab==='rising'||tab==='easing')?d.trend===tab:d.region===tab);
  const ok=okTab&&(!s||d.search.includes(s));c.hidden=!ok;if(ok)n++});
  count.textContent=n+' of '+cards.length+' countries';empty.style.display=n?'none':'block'}
 tabs.forEach(b=>b.onclick=()=>{tab=b.dataset.tab;tabs.forEach(x=>x.setAttribute('aria-pressed',x===b));show()});
 q.addEventListener('input',show);document.addEventListener('keydown',ev=>{if(ev.key==='/'&&document.activeElement!==q){ev.preventDefault();q.focus()}});
 show();
})();
"""

LOGO = ("<svg class=logo viewBox='0 0 24 24' width=24 height=24 aria-hidden=true><circle class=ring cx=12 cy=12 r=9.5 "
        "fill=none stroke='var(--accent-fill)' stroke-width=2 stroke-linecap=round pathLength=100 stroke-dasharray='62 38'/>"
        "<circle class=orbit cx=12 cy=2.5 r=1.6 fill='var(--teal)'/><circle class=core cx=12 cy=12 r=4 fill='var(--accent-fill)'/></svg>")
SEARCH = ("<svg width=16 height=16 viewBox='0 0 24 24' fill=none stroke=currentColor stroke-width=2.4 aria-hidden=true>"
          "<circle cx=11 cy=11 r=7 /><path d='m20 20-3.5-3.5'/></svg>")


def build() -> Path:
    xs = [load(k) for k in list_countries()]
    xs = [x for x in xs if x["r"]]
    live = [x for x in xs if x["cfg"]["markets"]]
    feat = next((x for x in xs if x["key"] == "uganda"), live[0] if live else xs[0])
    ordered = sorted(xs, key=lambda x: (not x["cfg"]["markets"], -(x["p"] or 0)))
    updated = max((x["d"].get("generated", "") for x in xs), default=date.today().isoformat())
    tabs = [("all", "All"), ("live", "Live contracts"), ("east", "East Africa"), ("south", "Southern Africa"),
            ("west", "West Africa"), ("north", "North Africa"), ("rising", "Rising"), ("easing", "Easing")]
    tab_html = "".join(f"<button data-tab={k} aria-pressed={'true' if k == 'all' else 'false'}>{v}</button>" for k, v in tabs)
    page = f"""<!doctype html>
<html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>CiO Construction Costs</title>
<meta name=description content="Will construction input prices rise? Weekly chances, expected changes and ranges for 18 African countries.">
<style>{css()}</style></head><body>
<header class=topbar><div class=wrap>
 <a class=mark href="#">{LOGO}CiO <span>Costs</span><small>· construction cost forecasts</small></a>
 <label class=search>{SEARCH}<span class=sr-only>Search</span>
  <input id=q type=search placeholder="Search: cement, Kenya…" autocomplete=off></label>
 <nav class=nav aria-label=Main><a href="#markets">Countries</a><a href="#how">How it works</a><a href="#docs">Documents</a>
  <a class=cta href="#join">Join the pilot</a></nav>
 <button class=theme id=theme type=button aria-label="Theme">◐</button>
</div></header>
<main class=wrap>
 <nav class=tabs aria-label="Filter countries">{tab_html}</nav>
 <div class=intro><h1>Will building costs rise?</h1>
 <p>Weekly chances and expected changes for construction inputs in {len(xs)} African countries, from official
 statistics and live market drivers. Updated {e(updated)}.</p></div>
 <div class=top>{featured(feat)}{movers(xs)}</div>
 <div class=section-h id=markets><h2>All countries</h2><span class=count id=count aria-live=polite></span></div>
 <div class=grid>{''.join(card(x) for x in ordered)}</div>
 <p class=empty id=empty>No country matches. Try "cement", "Kenya" or "East".</p>

 <div class=section-h id=how><h2>How to read a card</h2></div>
 <div class=howto>
  <div class=tile><span class=num>1</span><b>The question</b><p>Each card asks one plain question: will input prices for
  construction rise over the period shown?</p></div>
  <div class=tile><span class=num>2</span><b>The chance</b><p>The big number is how likely a rise is. 80% means a rise is
  expected in about 8 cases out of 10. The bar shows the same thing.</p></div>
  <div class=tile><span class=num>3</span><b>Expected change and range</b><p>The expected % is the most likely move; the range
  covers 8 in 10 outcomes. Apply the % to your own latest quote.</p></div>
  <div class=tile><span class=num>4</span><b>Where it comes from</b><p>Official indices (UBOS, KNBS, Stats SA and others), oil,
  exchange rates, rainfall and tax changes, checked against past data. <a href=FORECASTING.md>Method</a>.</p></div>
 </div>

 <section class=join id=join><div><h2>Join the pilot</h2><p>Contractors, quantity surveyors, developers and lenders: report
 the prices you pay each week, test your forecasts against the model, and get the Monday note for your country. Play money
 only — points have no cash value. Ask CiO Lab for an invite code.</p></div>
 <div class=actions><a class='btn primary' href="#markets">See the forecasts</a><a class=btn href=PROJECT_OVERVIEW.md>About the project</a></div></section>

 <div class=section-h id=docs><h2>Documents</h2></div>
 <ul class=docs><li><a href=PROJECT_OVERVIEW.md>Project overview, hosting and server</a></li>
 <li><a href=FORECASTING.md>How the forecasting works</a></li><li><a href=docs/COUNTRIES.md>Country status and sources</a></li>
 <li><a href=docs/FORECAST_MODEL.md>Uganda model: methods and evidence</a></li><li><a href=docs/MARKET_DESIGN.md>Forecasting market design</a></li>
 <li><a href=docs/OPERATIONS.md>Running the pilot</a></li><li><a href=docs/DEPLOY.md>Deployment guide</a></li>
 <li><a href=README.md>Repository README</a></li></ul>
 <footer>CiO Lab · Gavamukulya (Gava) Charles · Forecasts are estimates with ranges, not advice. "Chance of a rise" comes from
 the forecast range (or the contract probabilities for South Africa). Sources: UBOS, KNBS, Stats SA, GSS, ZimStat, ANSD,
 Statistics Mauritius, EIA, IMF, currency-api, ERA5. Built {date.today().isoformat()}.</footer>
</main><script>{JS}</script></body></html>
"""
    out = ROOT / "index.html"
    out.write_text(page, encoding="utf-8")
    return out


if __name__ == "__main__":
    print("wrote", build())

#!/usr/bin/env python3
"""
build_index.py — write index.html at the repo root: the project's front page.

Self-contained (no server, no internet, no libraries): open it straight from disk
(file://) or serve it with the repo. It embeds each country's latest forecast
(countries/<c>/outputs/forecast_latest.json), status and links to its weekly note and
README. The Monday job (src/market/cycle.py weekly) rebuilds it after the notes.

    python src/site/build_index.py
"""
from __future__ import annotations

import html
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src" / "market"))

from country import load_country, list_countries   # noqa: E402

e = html.escape
KIND = {"structural": "Structural model", "quarterly": "Quarterly model", "nowcast": "Contract nowcast",
        "pressure": "Cost-pressure outlook"}


def headline(d: dict) -> tuple[str, str, str]:
    """(label, value, range) — the single most useful number for a country card."""
    rows = [r for r in d.get("rows", []) if r.get("median") is not None]
    if not rows:
        return ("No forecast yet", "–", "")
    if d.get("kind") in ("structural", "quarterly"):
        first = rows[0]["series"]
        r = [x for x in rows if x["series"] == first][-1]
    else:
        r = rows[-1] if d.get("kind") == "pressure" else rows[0]
    rng = f"{r['lo']:+.1f}% to {r['hi']:+.1f}%" if r.get("lo") is not None else ""
    return (f"{r['series']} · {r['period']}", f"{r['median']:+.1f}%", rng)


def card(key: str) -> str:
    cfg = load_country(key)
    f = ROOT / "countries" / key / "outputs" / "forecast_latest.json"
    d = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    label, value, rng = headline(d)
    notes = sorted((ROOT / "countries" / key / "notes").glob(f"weekly_{key}_*.html"))
    note = f"<a href='countries/{key}/notes/{notes[-1].name}'>Weekly note</a>" if notes else ""
    off = cfg.get("official_reading")
    status = {"pilot": "Contracts + forecast", "reporting": "Note + outlook"}.get(cfg["status"], cfg["status"])
    official = (f"<p class=off>Official: {e(off['series'].split(',')[0])}, {e(str(off['period']))}"
                + (f", {off['change_year_pct']:+.1f}% y/y" if off.get("change_year_pct") is not None else "") + "</p>") \
        if off else ""
    return f"""<article class="card {'pilot' if cfg['status'] == 'pilot' else ''}" data-status="{e(cfg['status'])}">
  <header><h3>{e(cfg['country'])}</h3><span class=badge>{e(status)}</span></header>
  <p class=kind>{e(KIND.get(d.get('kind', ''), 'Forecast'))} · {e(cfg['currency'])} · {len(cfg['markets'])} contracts</p>
  <p class=big>{e(value)}</p><p class=lbl>{e(label)}</p><p class=rng>{e(rng and '80% range ' + rng)}</p>
  {official}
  <p class=links>{note} <a href='countries/{key}/README.md'>Country page</a></p>
</article>"""


CSS = """
:root{--bg:#f7f5f0;--card:#fff;--fg:#1d1d1b;--mut:#66645e;--line:#e2ded4;--acc:#b5651d;--acc2:#1f5f6b;--pill:#f1e3d3}
@media (prefers-color-scheme:dark){:root{--bg:#121211;--card:#1c1b19;--fg:#ecebe6;--mut:#a3a29c;--line:#32302c;--acc:#e3a464;--acc2:#6fbcc6;--pill:#3a2c1e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}
a{color:var(--acc2)}main{max-width:1120px;margin:0 auto;padding:0 16px 48px}
.hero{padding:44px 0 20px;border-bottom:1px solid var(--line)}.eyebrow{color:var(--acc);font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:.78rem}
h1{font-size:clamp(1.7rem,4vw,2.6rem);line-height:1.15;margin:.3em 0 .4em;max-width:22ch}.lede{font-size:1.1rem;color:var(--mut);max-width:62ch}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:22px 0 4px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px}.stat b{display:block;font-size:1.7rem}.stat span{color:var(--mut);font-size:.88rem}
h2{font-size:1.3rem;margin:38px 0 6px}.sub{color:var(--mut);margin:0 0 14px}
.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.filters button{font:inherit;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:999px;padding:6px 14px;cursor:pointer}
.filters button[aria-pressed=true]{background:var(--acc);border-color:var(--acc);color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:flex;flex-direction:column}
.card.pilot{border-color:var(--acc)}.card header{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.card h3{margin:0;font-size:1.1rem}.badge{font-size:.72rem;background:var(--pill);border-radius:999px;padding:2px 9px;white-space:nowrap}
.kind,.lbl,.rng,.off{margin:2px 0;color:var(--mut);font-size:.86rem}.big{font-size:1.9rem;font-weight:700;margin:8px 0 0;color:var(--acc)}
.links{margin-top:auto;padding-top:10px;font-size:.9rem;display:flex;gap:14px}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.step{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px}
.step b{color:var(--acc)}.docs{columns:2 260px;padding-left:18px}.docs li{margin:4px 0}
footer{color:var(--mut);font-size:.85rem;border-top:1px solid var(--line);margin-top:40px;padding-top:14px}
@media (max-width:640px){.stats{grid-template-columns:1fr 1fr}}
"""

JS = """
const btns=[...document.querySelectorAll('.filters button')];
btns.forEach(b=>b.onclick=()=>{btns.forEach(x=>x.setAttribute('aria-pressed',x===b));
 document.querySelectorAll('.card').forEach(c=>c.hidden=!(b.dataset.f==='all'||c.dataset.status===b.dataset.f));});
"""


def build() -> Path:
    keys = list_countries()
    cfgs = {k: load_country(k) for k in keys}
    pilots = [k for k in keys if cfgs[k]["status"] == "pilot"]
    n_contracts = sum(len(cfgs[k]["markets"]) for k in keys)
    order = pilots + [k for k in keys if k not in pilots]
    cards = "\n".join(card(k) for k in order)
    updated = max((json.loads(p.read_text())["generated"] for p in ROOT.glob("countries/*/outputs/forecast_latest.json")),
                  default=date.today().isoformat())
    page = f"""<!doctype html>
<html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>CiO Construction Costs</title>
<meta name=description content="Weekly forward-looking construction input cost signals for 18 African countries.">
<style>{CSS}</style></head><body><main>
<section class=hero><p class=eyebrow>CiO Lab · Construction Cost Platform</p>
<h1>Know what construction inputs will cost before you bid</h1>
<p class=lede>Weekly, forward-looking construction input cost signals for 18 African countries, in local currency:
official statistics, live drivers (oil, exchange rates, rainfall, public spending, tax measures), prices reported by the
people who buy materials, and a play-money forecasting challenge.</p>
<div class=stats><div class=stat><b>{len(keys)}</b><span>countries with weekly notes</span></div>
<div class=stat><b>{len(pilots)}</b><span>with official-index forecasts and contracts</span></div>
<div class=stat><b>{n_contracts}</b><span>forecasting contracts</span></div>
<div class=stat><b>Mon</b><span>new notes every week</span></div></div></section>

<h2>Countries</h2><p class=sub>Latest forecast per country (updated {e(updated)}). Cards outlined in orange have
official-index forecasts and contracts; the others show an imported-cost pressure outlook.</p>
<div class=filters role=group aria-label="Filter countries"><button data-f=all aria-pressed=true>All</button>
<button data-f=pilot aria-pressed=false>Contracts + forecast</button><button data-f=reporting aria-pressed=false>Note + outlook</button></div>
<div class=grid>{cards}</div>

<h2>How it works</h2><p class=sub>Full detail in <a href="FORECASTING.md">FORECASTING.md</a>.</p>
<div class=steps>
<div class=step><b>1 · Inputs</b><p>Official indices (UBOS, KNBS, Stats SA and others), Brent, 18 exchange rates, rainfall,
public spending and sourced tax measures, refreshed weekly.</p></div>
<div class=step><b>2 · Models</b><p>Uganda: structural model on UBOS's own weights. Kenya: quarterly driver model.
South Africa: contract nowcast. Others: cost-pressure outlook.</p></div>
<div class=step><b>3 · Checks</b><p>Every model is backtested month by month and kept only if it beats simple
benchmarks; ranges are calibrated to cover 80% of past outcomes.</p></div>
<div class=step><b>4 · Outputs</b><p>Weekly notes, the participant app's forecast page, and the opening prices of
the forecasting contracts.</p></div></div>

<h2>Project documents</h2><ul class=docs>
<li><a href="PROJECT_OVERVIEW.md">Project overview, hosting and server</a></li>
<li><a href="FORECASTING.md">How the forecasting works</a></li>
<li><a href="docs/COUNTRIES.md">Country status and sources</a></li>
<li><a href="docs/FORECAST_MODEL.md">Uganda structural model: methods and evidence</a></li>
<li><a href="docs/MARKET_DESIGN.md">Forecasting market design</a></li>
<li><a href="docs/OPERATIONS.md">Running the pilot</a></li>
<li><a href="docs/DEPLOY.md">Deployment guide</a></li>
<li><a href="README.md">Repository README</a></li></ul>

<footer>CiO Lab · Gavamukulya (Gava) Charles · Forecasts are estimates with ranges, not advice. Points in the forecasting
challenge have no cash value. Sources: UBOS, KNBS, Stats SA, GSS, ZimStat, ANSD, Statistics Mauritius, EIA, IMF,
currency-api, ERA5. Page built {date.today().isoformat()} by <code>src/site/build_index.py</code>.</footer>
</main><script>{JS}</script></body></html>
"""
    out = ROOT / "index.html"
    out.write_text(page, encoding="utf-8")
    return out


if __name__ == "__main__":
    print("wrote", build())

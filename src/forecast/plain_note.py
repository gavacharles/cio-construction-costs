"""
plain_note.py — the weekly note in plain language, for contractors and anyone who buys materials.

One page per country, same shape everywhere:
  In one line · What it means for your money · Prices to watch · Why · What to do this week ·
  What people are paying · Official figures · How to read this
Changes are measured from TODAY (not from the last official month), so "budget X" is usable as is.
Also produces a short WhatsApp-ready text to paste into a free WhatsApp Channel or broadcast.

    md, txt = plain_note(data, cfg, crowd_rows, today, site_url="", channel="")
"""
from __future__ import annotations

import math
from datetime import date

MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
          "November", "December"]
WATCH_NAMES = {"Overall construction inputs": "All building inputs", "Overall construction input prices": "All building inputs",
               "Construction input prices (whole industry)": "All building inputs",
               "Imported-input cost pressure": "Imported materials (steel, cement inputs, paint, pipes, fuel)"}


def _month_name(ym: str) -> str:
    return MONTHS[int(ym[5:7]) - 1] + " " + ym[:4]


def _add_months(d: date, n: int) -> str:
    y, m = d.year + (d.month - 1 + n) // 12, (d.month - 1 + n) % 12 + 1
    return f"{y}-{m:02d}"


def _at(path: list[dict], ym: str) -> dict:
    """Path entry for month ym (last one at or before it; 0 change before the path starts)."""
    best = None
    for q in path:
        if q["month"] <= ym:
            best = q
    return best or {"month": ym, "median": 0.0, "lo": 0.0, "hi": 0.0}


def _from_today(path: list[dict], now: str, target: str) -> tuple[float, float, float]:
    """Change from the current month to the target month, in %, with the 8-in-10 range."""
    a, b = _at(path, now), _at(path, target)
    f = lambda x: ((1 + x / 100) / (1 + a["median"] / 100) - 1) * 100
    return f(b["median"]), f(b["lo"]), f(b["hi"])


def _stale(base: str, today: date) -> bool:
    """True when the latest official period is more than 3 months (monthly) or 2 quarters old."""
    try:
        if base.startswith("Q"):
            q, y = int(base[1]), int(base[-4:])
            return (today.year * 12 + today.month) - (y * 12 + 3 * q) > 5
        m = [x[:3] for x in MONTHS].index(base[:3]) + 1
        return (today.year * 12 + today.month) - (int(base[-4:]) * 12 + m) > 3
    except (ValueError, IndexError):
        return False


def _chance(med: float, lo: float, hi: float) -> float:
    sd = (hi - lo) / (2 * 1.2816)
    if sd <= 1e-9:
        return 0.99 if med > 0 else 0.01
    return min(0.99, max(0.01, 0.5 * (1 + math.erf(med / (sd * math.sqrt(2))))))


def _likely(p: float) -> str:
    return ("almost certain" if p >= 0.9 else "likely" if p >= 0.7 else "a little more likely than not"
            if p >= 0.55 else "about as likely as not" if p > 0.45 else "unlikely" if p > 0.2 else "very unlikely")


def _arrow(x: float) -> str:
    return "⬆" if x >= 0.5 else ("⬇" if x <= -0.5 else "➡")


def _move(x: float) -> str:
    if abs(x) < 0.5:
        return "about the same"
    return f"{'up' if x > 0 else 'down'} about {abs(x):.0f}%" if abs(x) >= 3 else f"{'up' if x > 0 else 'down'} about {abs(x):.1f}%"


def plain_note(d: dict, cfg: dict, crowd_rows: list[dict], today: date, site_url: str = "",
               channel: str = "") -> tuple[str, str]:
    country, ccy, kind = cfg["country"], cfg["currency"], d.get("kind")
    paths = d.get("paths") or {}
    head = next(iter(paths)) if paths else None
    now, target = _add_months(today, 0), _add_months(today, 3)
    when = _month_name(target)
    med, lo, hi = _from_today(paths[head], now, target) if head else (0.0, 0.0, 0.0)
    p = _chance(med, lo, hi)
    official = kind != "pressure"
    dr = d.get("drivers") or {}
    page = f"{site_url.rstrip('/')}/countries/{cfg['key']}/" if site_url else "../index.html"

    # In one line
    if official:
        line = (f"Building material prices in {country} are {_likely(p)} to rise — about {med:.1f}% by {when}." if med >= 0.5 else
                f"Building material prices in {country} are expected to stay about the same until {when}." if med > -0.5 else
                f"Building material prices in {country} may ease — about {abs(med):.1f}% lower by {when}.")
    else:
        line = (f"Import costs are pushing building prices in {country} up — about {med:.1f}% over the next 3 months ({_likely(p)})."
                if med >= 0.5 else f"Import costs for building in {country} look steady for the next 3 months."
                if med > -0.5 else f"Import costs for building in {country} are easing — about {abs(med):.1f}% over 3 months.")

    # Money
    k = 1_000_000
    r1000 = lambda x: f"{round(k * (1 + x / 100), -3):,.0f}"
    money = (f"For every **{k:,} {ccy}** you spend on materials today, budget about **{r1000(med)} {ccy}** "
             f"for the same materials in {when} (most likely between {r1000(lo)} and {r1000(hi)}).")

    # Prices to watch
    watch = []
    for name, pth in paths.items():
        m, _, _ = _from_today(pth, now, target)
        watch.append((abs(m), f"{_arrow(m)} **{WATCH_NAMES.get(name, name)}** — {_move(m)} by {when}"))
    watch = [w for _, w in sorted(watch, reverse=True)[:5]]
    if not official:
        watch.append("➡ **Local materials and labour** — not covered by this estimate; check local quotes.")

    # Why
    why = []
    b = dr.get("brent_13w_pct")
    if b is not None:
        why.append(f"World oil prices are {'up' if b > 0 else 'down'} {abs(b):.0f}% in the last 3 months — this feeds diesel, "
                   "transport, asphalt and plastics.")
    fx = dr.get("fx_13w_pct")
    if fx is not None and cfg.get("pressure_currency") != "USD":
        why.append(f"The {ccy} has been steady against the US dollar." if abs(fx) < 1 else
                   f"The {ccy} is {abs(fx):.0f}% {'weaker' if fx > 0 else 'stronger'} against the US dollar than 3 months ago — "
                   f"imported steel, cement inputs, paint and fittings {'cost more' if fx > 0 else 'cost a little less'}.")

    # What to do
    if med >= 2:
        todo = ["Lock in prices for big orders now if you can.", "Add a price-adjustment clause to new contracts, or a bigger "
                "contingency.", "Ask suppliers how long their quotes are valid."]
    elif med >= 0.5:
        todo = ["Prices are creeping up: compare at least two quotes before big orders.", "Keep a small contingency for "
                "price rises in new quotes."]
    elif med > -0.5:
        todo = ["No rush: today's quotes are a fair guide.", "Use the quiet time to compare suppliers."]
    else:
        todo = ["Prices may ease: if you can, wait before bulk buying.", "Ask suppliers for better terms."]

    # Crowd prices
    pub = [r for r in crowd_rows if r.get("published")]
    crowd = ([f"- {r['name']}: **{r['median']:,.0f} {ccy}** per {r['unit']} ({r['reporters']} people)" for r in pub]
             if pub else [f"Not enough reports yet this week. Tell us what you pay — it is anonymous: "
                          f"{(site_url.rstrip('/') + '/report.html') if site_url else 'Report a price on the CiO Costs site'}."])

    # Official figures
    base = d.get("base", "")
    r = cfg.get("official_reading")
    if official:
        stale = _stale(base, today)
        long_base = base if base.startswith("Q") else next((m for m in MONTHS if m.startswith(base[:3])), base[:3]) + base[3:]
        offl = (f"The latest official figures are for **{long_base}**, from the {cfg['settlement']['statistics_office']}."
                + (" They are late, so this note uses this week's oil and currency moves to fill the gap." if stale else ""))
    elif r:
        offl = (f"Latest official reading: {r['series'].split(',')[0]}, {r['period']}"
                + (f" — {r['change_year_pct']:+.1f}% on a year." if r.get("change_year_pct") is not None else "."))
    else:
        offl = f"{country} has no official construction price index yet. This is an estimate from oil and currency moves."

    title = f"{country} building costs — week of {today.day} {MONTHS[today.month - 1]} {today.year}"
    md = "\n".join([
        f"# {title}", "",
        "## In one line", "", line, "",
        "## What it means for your money", "", money, "",
        "## Prices to watch", "", *[f"- {w}" for w in watch], "",
        "## Why", "", *[f"- {w}" for w in why], "",
        "## What to do this week", "", *[f"- {t}" for t in todo], "",
        "## What people are paying", "", *crowd, "",
        "## Official figures", "", offl, "",
        "## How to read this", "",
        "\"Likely\" means about 7 times in 10; \"almost certain\" about 9 in 10. Changes are measured from today. "
        "CiO Costs is a forecasting tool: these are estimates with a range, not official statistics, a price list or advice.", "",
        f"[See all the figures for {country}]({page})", "",
        *([f"Get this note free every week: [follow CiO Costs on WhatsApp]({channel})", ""] if channel else []),
        "_CiO Costs · free weekly note · CiO Lab_", ""])

    txt = "\n".join([
        f"🏗️ *{country} building costs* — week of {today.day} {MONTHS[today.month - 1][:3]}",
        "", line, "",
        f"💰 {k:,} {ccy} of materials today ≈ {r1000(med)} {ccy} in {when}.",
        "", *[w.replace("**", "*") for w in watch[:3]], "",
        *[f"• {w}" for w in why], "",
        f"✅ {todo[0]}", "",
        f"More: {page if site_url else 'CiO Costs site'} · Report prices: {(site_url.rstrip('/') + '/report.html') if site_url else 'CiO Costs site'}",
        *([f"📲 Free every week: {channel}"] if channel else []),
        "_A forecast, not a guarantee or advice._"])
    return md, txt.replace("  ", " ")

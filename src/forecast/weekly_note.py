#!/usr/bin/env python3
"""
weekly_note.py — the weekly construction-cost note for contractors.

UBOS publishes monthly, 1-2 months late; KNBS quarterly. Contractors need a view
every week. Each note combines:
  1. this week's drivers (Brent, UGX/KES/RWF per USD) from build_weekly_drivers.py;
  2. the structural forecast refitted at the latest CIPI release but CONDITIONED on the
     Brent and UGX readings observed since then (model.known_primitives), so the weeks
     between releases are not wasted;
  3. crowd prices: weekly medians of participants' price reports (src/market/reports.py);
  4. market consensus: open contracts, crowd vs model (src/market/ledger.py).

One note per country: countries/<country>/notes/weekly_<country>_<date>.{md,html}
  - uganda: structural model (monthly, UBOS weights) conditioned on new Brent/UGX readings
  - kenya:  quarterly model for the KNBS overall/building/civil indices, conditioned on
            observed Brent and KES quarters; bands from walk-forward backtest errors
  - south_africa: latest Stats SA P0151.1 readings and next-month contract expectations
  - every other country: drivers, the latest official reading where one exists
            (countries/<country>/config.yaml (official_reading)), and an imported-input cost-pressure outlook
            (cost_pressure.py), plus crowd prices
The participant app shows the latest note for the participant's country.

    python src/forecast/weekly_note.py [--country uganda|kenya|rwanda|all] [--no-fetch] [--db ...]
"""
from __future__ import annotations

import argparse
import json
import os
import html
import sys
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd
import yaml

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src" / "forecast"))
sys.path.insert(0, str(ROOT / "src" / "market"))
sys.path.insert(0, str(ROOT / "src" / "ingest"))

from index_structure import read_release, latest_weighted_release            # noqa: E402
from model import ForecastModel, load_macro, load_policy_events, known_primitives  # noqa: E402

NOTES = ROOT / "countries"
DEFAULT_DB = Path(os.environ.get("CIO_DB", ROOT / "data" / "live" / "exchange.sqlite"))

# Structured copy of each note's forecast, saved as countries/<c>/outputs/forecast_latest.json
# for the participant app's Forecast page (same numbers as the note, by construction).
_DATA: dict = {}
_MAT_LEVELS: dict = {}
_OFFICIAL: dict = {}            # country -> official headline level series (monthly), to check the estimate method against          # material name -> full level series, for trend forecasts of materials without a model


def _rec(**row) -> None:
    _DATA.setdefault("rows", []).append(row)


def _spark(label: str, series) -> None:
    """Recent history for the front page's trend line (last 24 points)."""
    s = pd.Series(series).dropna().tail(24)
    _DATA["spark"] = {"label": label, "dates": [pd.Timestamp(d).strftime("%Y-%m") for d in s.index],
                      "values": [round(float(v), 3) for v in s.values]}


def _calib(h: int) -> float:
    """Backtest calibration factor for Uganda's 80% bands at horizon h (1.0 if not available)."""
    f = ROOT / "countries" / "uganda" / "outputs" / "forecast" / "interval_calibration.csv"
    if not f.exists():
        return 1.0
    c = pd.read_csv(f)
    return float(np.interp(h, c.h, c.scale))


def _entry(month, lo, med, hi) -> dict:
    return {"month": pd.Timestamp(month).strftime("%Y-%m"), "median": round(float(med), 3),
            "lo": round(float(lo), 3), "hi": round(float(hi), 3)}


def _boot_path(changes: pd.Series, start, H: int = 12, n: int = 4000, block: int = 3, seed: int = 0) -> list[dict]:
    """Cumulative % change paths from block-resampled recent monthly changes (last 60 months)."""
    x = changes.dropna().tail(60).values
    rng = np.random.default_rng(seed)
    nb = int(np.ceil(H / block))
    st = rng.integers(0, len(x) - block + 1, size=(n, nb))
    cum = np.cumsum(x[(st[..., None] + np.arange(block)).reshape(n, -1)[:, :H]], axis=1)
    months = pd.date_range(pd.Timestamp(start) + pd.DateOffset(months=1), periods=H, freq="MS")
    return [_entry(m, *np.percentile(cum[:, i], [10, 50, 90])) for i, m in enumerate(months)]


def _materials(items, step: str) -> None:
    """Latest official change per material: on the previous period and on a year earlier."""
    lag = 4 if step == "quarter" else 12
    out = []
    for name, lv in items:
        lv = pd.Series(lv).dropna()
        if len(lv) < 2:
            continue
        _MAT_LEVELS[name] = (lv, step)
        yr = (lv.iloc[-1] / lv.iloc[-1 - lag] - 1) * 100 if len(lv) > lag else None
        ch = (lv / lv.shift(1) - 1).dropna().tail(24) * 100
        out.append({"name": name, "period": pd.Timestamp(lv.index[-1]).strftime("%Y-%m"),
                    "change_period": round(float((lv.iloc[-1] / lv.iloc[-2] - 1) * 100), 2),
                    "change_year": None if yr is None else round(float(yr), 2),
                    "history": [[pd.Timestamp(d).strftime("%Y-%m"), round(float(v), 2)] for d, v in ch.items()]})
    _DATA["materials"] = {"step": step, "items": out}


ALIASES = {"Reinforcement steel": "Rebar"}      # materials already covered by a modelled series of another name


def _trend_model(lv: pd.Series, step: str, H: int) -> tuple[list[tuple[float, float, float]], dict]:
    """Trend forecast for one material from its own history, chosen by a walk-forward test (Oct 2026):
    centre = half the average change of the last 12 periods (a damped drift: AR(1) on single materials overreacted
    and missed more than "no change"); range = the material's own past changes around their mean, widened or narrowed
    so that, in the test, the real change landed inside about 8 times in 10. Returns cumulative (median, lo, hi) for
    1..H periods ahead and the honest test statistics (calibration learned only from earlier test periods)."""
    ch = ((lv / lv.shift(1) - 1).dropna() * 100).values
    w_len, test_len, min_hist = (40, 16, 10) if step == "quarter" else (60, 48, 20)

    def fit(past):
        win = past[-w_len:]
        return 0.5 * past[-12:].mean(), win - win.mean()

    rows, errs = [], []
    for i in range(max(min_hist, len(ch) - test_len), len(ch)):
        d, res = fit(ch[:i])
        lo, hi = np.percentile(res, [10, 90])
        sc = 1.0
        if len(errs) >= 8:                                     # calibration from earlier test periods only
            e = np.array(errs)
            sc = float(np.clip(np.percentile(np.abs(e[:, 0]), 80) / max(1e-6, e[:, 1].mean()), 0.6, 2.5))
        rows.append((ch[i], d, d + lo * sc, d + hi * sc))
        errs.append((ch[i] - d, (hi - lo) / 2))
    a = np.array(rows)
    stats = {"n": int(len(a)), "inside": float(np.mean((a[:, 0] >= a[:, 2]) & (a[:, 0] <= a[:, 3]))),
             "mae": float(np.mean(np.abs(a[:, 0] - a[:, 1]))), "mae_nochange": float(np.mean(np.abs(a[:, 0])))}
    e = np.array(errs)                                         # live forecast: calibration from the whole test
    sc = float(np.clip(np.percentile(np.abs(e[:, 0]), 80) / max(1e-6, e[:, 1].mean()), 0.6, 2.5))
    d, res = fit(ch)
    lo, hi = np.percentile(res, [10, 90])
    return [(d * h, d * h + lo * sc * np.sqrt(h), d * h + hi * sc * np.sqrt(h)) for h in range(1, H + 1)], stats


def check_estimate_method(country: str) -> None:
    """Where an official monthly index exists, test the import-cost estimate used for countries without one:
    over the last 5 years, how often did its 3-month change point the same way as the official index, and how
    closely did they move (correlation)? Saved to data/shared/estimate_validation.json for the estimate notes."""
    from cost_pressure import pressure_history
    off = _OFFICIAL.get(country)
    if off is None:
        return
    off = pd.Series(off).dropna()
    off.index = pd.to_datetime(off.index).to_period("M").to_timestamp()
    pr = pressure_history(ccy(country)[1])
    pr.index = pd.to_datetime(pr.index).to_period("M").to_timestamp()
    o3 = (100 * np.log(off).diff(3)).dropna()
    p3 = pr.rolling(3).sum().dropna()
    j = pd.concat([p3, o3], axis=1, keys=["est", "off"]).dropna().tail(60)
    j = j[(j.est.abs() > 0.1) & (j.off.abs() > 0.1)]                   # direction is only meaningful away from zero
    if len(j) < 18:
        return
    f = ROOT / "data" / "shared" / "estimate_validation.json"
    cur = json.loads(f.read_text()) if f.exists() else {}
    cur[country] = {"months": int(len(j)), "same_direction": round(float((np.sign(j.est) == np.sign(j.off)).mean()), 3),
                    "correlation": round(float(j.corr().iloc[0, 1]), 2), "to": j.index.max().strftime("%Y-%m")}
    f.write_text(json.dumps(cur, indent=1), encoding="utf-8")


def _add_trend_paths() -> None:
    """Materials in the official table without their own model get a tested trend forecast (see _trend_model).
    Quarterly series stay quarterly (each month of a quarter shows that quarter's value). Marked 'trend' on the site."""
    paths = _DATA.setdefault("paths", {})
    trend, stats = [], {}
    for name, (lv, step) in _MAT_LEVELS.items():
        if name in paths or ALIASES.get(name) in paths:
            continue
        if len(lv) < (16 if step == "quarter" else 36):
            continue
        start = pd.Timestamp(lv.index.max())
        if step == "quarter":
            q, st = _trend_model(lv, step, 4)
            paths[name] = [_entry(start + pd.DateOffset(months=3 * h + k), lo, md, hi)
                           for h, (md, lo, hi) in enumerate(q, 1) for k in range(3)]
        else:
            q, st = _trend_model(lv, step, 12)
            paths[name] = [_entry(start + pd.DateOffset(months=h), lo, md, hi) for h, (md, lo, hi) in enumerate(q, 1)]
        trend.append(name)
        stats[name] = st
    if trend:
        _DATA["trend"], _DATA["trend_stats"] = trend, stats


def _p_up(probs, cuts) -> float:
    """P(change > 0) from bucket probabilities: buckets whose lower edge is at or above zero,
    excluding an explicit "unchanged" bucket [0, 0.01)."""
    edges = [-np.inf] + list(cuts)
    floor = 0.01 if 0.01 in cuts else 0.0
    return float(sum(p for e, p in zip(edges, probs) if e >= floor))
KEY = {"ALL": "Overall construction inputs", "diesel": "Diesel", "cement": "Cement",
       "high tensile steel bars": "Rebar", "sand": "Sand", "labour": "Labour"}


def _chg(s: pd.Series, days: int) -> float | None:
    s = s.dropna()
    if s.empty:
        return None
    past = s[s.index <= s.index[-1] - pd.Timedelta(days=days)]
    return float(s.iloc[-1] / past.iloc[-1] - 1) * 100 if len(past) else None


def _fmt(x, nd=1, pct=False):
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return "–"
    return f"{x:+.{nd}f}%" if pct else f"{x:,.{nd}f}"


def ccy(country: str) -> tuple[str, str]:
    """(currency code, weekly-drivers column) from the country config."""
    from country import load_country
    cfg = load_country(country)
    return cfg["currency"], f"{cfg['fx_code']}_per_usd"


def drivers_section(weekly: pd.DataFrame, country: str) -> list[str]:
    ccy_code, col = ccy(country)
    if col not in weekly.columns or weekly[col].dropna().empty:
        return [f"_No exchange-rate readings for {ccy_code} yet; Brent in USD only._", "",
                f"Brent crude: {_fmt(weekly['brent_usd'].dropna().iloc[-1])} USD/bbl "
                f"({_fmt(_chg(weekly['brent_usd'], 91), pct=True)} over 13 weeks)."]
    ccy_ = ccy_code
    w = weekly.assign(oil_local=weekly["brent_usd"] * weekly[col])
    rows = [("Brent crude (USD/bbl)", "brent_usd"), (f"{ccy_} per USD", col), (f"Brent in {ccy_}", "oil_local")]
    out = ["| Driver | Latest | 1 week | 4 weeks | 13 weeks | 52 weeks |", "|---|---|---|---|---|---|"]
    for name, c in rows:
        s = w[c]
        out.append(f"| {name} | {_fmt(s.dropna().iloc[-1])} | {_fmt(_chg(s, 7), pct=True)} | "
                   f"{_fmt(_chg(s, 28), pct=True)} | {_fmt(_chg(s, 91), pct=True)} | {_fmt(_chg(s, 364), pct=True)} |")
    return out


def forecast_section(cfg, structure, macro, ext, events, months_ahead: int = 4, path_months: int = 12):
    m = ForecastModel(cfg).fit(structure, macro)
    m.events = events
    today = pd.Timestamp(date.today()).to_period("M").to_timestamp()
    H = max(1, (today.to_period("M") - m.origin.to_period("M")).n + max(months_ahead, path_months))
    known = known_primitives(macro, ext, cfg, m.origin, H, m.prim_cols)
    P_known = m.simulate(H, n_paths=1000, known=known)
    P_blind = m.simulate(H, n_paths=1000)
    months = pd.date_range(m.origin + pd.DateOffset(months=1), periods=H, freq="MS")
    cols = list(structure.levels.columns)
    rows, focus = [], [today, today + pd.DateOffset(months=3)]
    for key, name in KEY.items():
        if key == "ALL":
            pk, pb, base = m.aggregate_paths(P_known, "ALL"), m.aggregate_paths(P_blind, "ALL"), \
                structure.published["ALL"].iloc[-1]
        else:
            j = cols.index(key)
            pk, pb, base = P_known[:, :, j], P_blind[:, :, j], structure.levels[key].iloc[-1]
        for d in focus:
            i = months.get_loc(d)
            q = np.percentile(pk[:, i] / base * 100 - 100, [10, 50, 90])
            blind = float(np.median(pb[:, i]) / base * 100 - 100)
            rows.append({"series": name, "month": d.strftime("%b %Y"), "median": q[1], "lo": q[0], "hi": q[2],
                         "without_new_data": blind})
    n_known = int((~np.isnan(known)).any(axis=1).sum())
    paths = {}
    for key, name in KEY.items():
        if key == "ALL":
            pk, base = m.aggregate_paths(P_known, "ALL"), structure.published["ALL"].iloc[-1]
        else:
            pk, base = P_known[:, :, cols.index(key)], structure.levels[key].iloc[-1]
        ent = []
        for i, d in enumerate(months):
            lo, med, hi = np.percentile(pk[:, i] / base * 100 - 100, [10, 50, 90])
            k = _calib(i + 1)
            ent.append(_entry(d, med - k * (med - lo), med, med + k * (hi - med)))
        paths[name] = ent
    return pd.DataFrame(rows), m.origin, n_known, paths


def crowd_section(db_path: Path, country: str) -> list[str]:
    if not db_path.exists():
        return ["_No price reports yet. Participants report the prices they pay in the app each week._"]
    from reports import Participants
    from country import load_country
    db, out = Participants(db_path), []
    for c in (country,):
        cfg = load_country(c)
        s = db.crowd_summary(c, cfg.get("price_items", []))
        s = s[s.reports > 0]
        if s.empty:
            continue
        out += [f"Prices in {cfg['currency']}.", "",
                "| Item | Median price | Reporters | Change vs 4 weeks |", "|---|---|---|---|"]
        out += [f"| {r['name']} | {(_fmt(r['median'], 0) + ' per ' + r['unit']) if r['published'] else 'waiting for 3 reporters'} | {r['reporters']} | "
                f"{_fmt(r['change_pct'], pct=True)} |" for _, r in s.iterrows()]
        out.append("")
    return out or ["_No price reports in the last 12 weeks._"]


def market_section(db_path: Path, country: str) -> list[str]:
    if not db_path.exists():
        return ["_No open contracts._"]
    from ledger import Exchange
    from nowcast import expected_change
    ms = Exchange(db_path).markets(status="open", country=country)
    if not ms:
        return ["_No open contracts._"]
    out = ["| Contract | Period | Crowd expects | Model expected | Closes |", "|---|---|---|---|---|"]
    for mk in ms:
        out.append(f"| {mk['title']} | {mk['ref_month']} | "
                   f"{expected_change(np.array(mk['prices']), mk['cuts']):+.2f}% | "
                   f"{expected_change(np.array(mk['prior']), mk['cuts']):+.2f}% | {mk['closes'][:10]} |")
    return out


HEADER = "_CiO Lab construction cost note · play-money pilot · not investment advice._"


def _write(country: str, md: str, today: date) -> Path:
    folder = NOTES / country / "notes"
    folder.mkdir(parents=True, exist_ok=True)
    stem = folder / f"weekly_{country}_{today.isoformat()}"
    stem.with_suffix(".md").write_text(md, encoding="utf-8")
    stem.with_suffix(".html").write_text(to_html(md, f"{country.title()} construction cost note {today:%d %b %Y}"),
                                         encoding="utf-8")
    return stem.with_suffix(".md")


def uganda_body(weekly) -> list[str]:
    cfg = yaml.safe_load(open(ROOT / "countries" / "uganda" / "forecast_model.yaml", encoding="utf-8"))
    structure = read_release(latest_weighted_release([ROOT / "countries" / "uganda" / "raw", ROOT / "countries" / "uganda" / "raw" / "downloads"]))
    macro = load_macro(cfg, ROOT)
    ext_f = ROOT / "data" / "shared" / "macro_extension_monthly.csv"
    ext = pd.read_csv(ext_f, parse_dates=["date"]).set_index("date") if ext_f.exists() else None
    fc, origin, n_known, paths = forecast_section(cfg, structure, macro, ext, load_policy_events(cfg, ROOT))
    _DATA.update(paths=paths, base=f"{origin:%b %Y}")
    lv = structure.levels
    _materials([(n, lv[c]) for n, c in [
        ("Cement", "cement"), ("Reinforcement steel", "high tensile steel bars"),
        ("Roofing sheets", "sheet steel, roofing sheets and similar"), ("Diesel", "diesel"), ("Sand", "sand"),
        ("Aggregate", "aggregate, hardcore, crushed or broken stone"), ("Concrete blocks", "concrete bricks, blocks and slabs"),
        ("Timber", "timber, coniferous, greater than 6mm thick"), ("Paint", "paints and varnishes"),
        ("Plastic pipes", "plastic pipes and fittings"), ("Tiles", "ceramic wall and floor tiles"), ("Labour", "labour")]
        if c in lv], "month")
    lines = ["## Expected change in input prices", "",
             f"Change from the last UBOS release (**{origin:%B %Y}**), with the {n_known} months of Brent and "
             "shilling readings since then built in. Apply these to your own last known quote for the "
             "same item. Range = 80% band.", "",
             "| Series | Month | Expected | Range | Without new data |", "|---|---|---|---|---|"]
    lines += [f"| {r.series} | {r.month} | {r['median']:+.1f}% | {r.lo:+.1f}% to {r.hi:+.1f}% | "
              f"{r.without_new_data:+.1f}% |" for _, r in fc.iterrows()]
    _spark("Overall construction input index (UBOS)", structure.published["ALL"])
    _OFFICIAL["uganda"] = structure.published["ALL"]
    _DATA.update(kind="structural", basis=f"Change from the last UBOS release ({origin:%B %Y}), "
                 f"with {n_known} months of oil and shilling readings since then built in")
    for _, r in fc.iterrows():
        _rec(series=r.series, period=r.month, median=r["median"], lo=r.lo, hi=r.hi, without=r.without_new_data)
    lines += ["", "July 2026 excise changes (fuel +Shs200/l, cement, paint) are included at 50% pass-through."]
    return lines


def kenya_body(weekly) -> list[str]:
    from quarterly_model import QuarterlyModel, quarterly_drivers, backtest
    from country import load_country
    from settlement import load_releases, history
    cfg = load_country("kenya")
    rel = load_releases(cfg)
    D = quarterly_drivers("kes_per_usd")
    latest = rel.release_month.max()
    lines = ["## Latest KNBS readings", "",
             f"KNBS Construction Input Price Index, latest release **Q{latest.quarter} {latest.year}** "
             "(quarterly; base Dec 2019 = 100).", "",
             "| Series | Index | vs previous quarter | vs a year earlier |", "|---|---|---|---|"]
    for m in cfg["markets"]:
        lv = history(rel, m["label"], cfg).dropna()
        q1 = lv.iloc[-1] / lv.iloc[-2] - 1 if len(lv) > 1 else np.nan
        y1 = lv.iloc[-1] / lv.get(lv.index[-1] - pd.DateOffset(years=1), np.nan) - 1
        lines.append(f"| {m['title']} | {lv.iloc[-1]:.2f} | {_fmt(q1 * 100, pct=True)} | {_fmt(y1 * 100, pct=True)} |")
    lines += ["", "## Expected change in the next KNBS prints", "",
              "Quarterly model driven by the shilling and Brent in shillings, conditioned on the months already "
              "observed. Range = 80% band from the model's own past errors (walk-forward backtest). "
              "Only the three cost indices are forecast; for single materials the model did not beat a simple "
              "trend, so read their latest readings above with this week's drivers.", "",
              "| Index | Quarter | Expected vs latest print | Range | Driver months observed |", "|---|---|---|---|---|"]
    for code in ("KE_CIPI", "KE_BUILD", "KE_CIVIL"):
        m = next(x for x in cfg["markets"] if x["code"] == code)
        lv = history(rel, m["label"], cfg)
        mod = QuarterlyModel().fit(lv, D)
        paths, futq = mod.simulate(4, known=D[D.index > mod.origin])
        bt = backtest(lv, D)
        halves = {h: float(np.quantile(np.abs(bt[bt.h == h].actual - bt[bt.h == h].model), 0.8))
                  for h in (1, 2) if len(bt[bt.h == h])}
        ent = []
        for h in range(1, 5):
            sim = 100 * np.log(paths[:, h - 1] / mod.last_level)
            md = float(np.median(sim))
            hf = halves.get(h, halves.get(2, 1.0) * np.sqrt(h / 2))
            for k in range(3):                        # each month of the quarter shows that quarter's print
                ent.append(_entry(futq[h - 1] + pd.DateOffset(months=k), md - hf, md, md + hf))
        _DATA.setdefault("paths", {})[m["title"]] = ent
        for h in (1, 2):
            sim = 100 * np.log(paths[:, h - 1] / mod.last_level)
            med = float(np.median(sim))
            g = bt[bt.h == h]
            half = float(np.quantile(np.abs(g.actual - g.model), 0.8)) if len(g) else np.nan
            months = int(D["months"].get(futq[h - 1], 0)) if futq[h - 1] in D.index else 0
            lines.append(f"| {m['title']} | Q{futq[h - 1].quarter} {futq[h - 1].year} | {med:+.1f}% | "
                         f"{med - half:+.1f}% to {med + half:+.1f}% | {months} of 3 |")
            _rec(series=m["title"], period=f"Q{futq[h - 1].quarter} {futq[h - 1].year}", median=med,
                 lo=med - half, hi=med + half)
    _spark("Overall construction input index (KNBS, quarterly)",
           history(rel, next(x for x in cfg["markets"] if x["code"] == "KE_CIPI")["label"], cfg))
    _DATA["base"] = f"Q{latest.quarter} {latest.year}"
    _materials([(n, history(rel, f"all|{l}", cfg)) for n, l in [
        ("Cement", "cement"), ("Steel and reinforcement", "steel and reinforced bars"), ("Roofing sheets", "roofing sheets"),
        ("Fuel and lubricants", "fuel and lubricants"), ("Sand", "sand"), ("Ballast and crushed stone", "ballast/gravel and graded crushed stones"),
        ("Hardcore", "hardcore"), ("Timber", "timber and wood"), ("Paint", "paints"), ("Tiles", "tiles"), ("Labour", "labour")]
        if (rel.series_label == f"all|{l}").any()], "quarter")
    _DATA.update(kind="quarterly", basis=f"Change from the latest KNBS print (Q{latest.quarter} {latest.year}), "
                 "conditioned on the oil and shilling months already observed")
    return lines


def south_africa_body(weekly) -> list[str]:
    from country import load_country
    from settlement import load_releases, history, first_print
    from nowcast import mom_changes, predictive_probs, expected_change
    cfg = load_country("south_africa")
    rel = load_releases(cfg)
    latest = rel.release_month.max()
    nxt = latest + pd.DateOffset(months=1)
    lines = ["## Latest Stats SA readings", "",
             f"Stats SA P0151.1 construction materials price indices, latest release **{latest:%B %Y}** "
             "(monthly). Changes are computed inside each release, so rebasing does not distort them.", "",
             "| Series | Change on previous month | Change on a year earlier | Expected next month |",
             "|---|---|---|---|"]
    for m in cfg["markets"]:
        fp = first_print(rel, m["label"], latest)
        yr = rel[(rel.series_label == m["label"]) & (rel.release_month == latest)].set_index("date")["index_value"]
        y1 = (yr.iloc[-1] / yr.iloc[0] - 1) * 100 if len(yr) >= 3 else np.nan
        h = history(rel, m["label"], cfg)
        r = mom_changes(h)
        probs = predictive_probs(r, nxt, m["cuts"], 1, 0.02) if len(r) > 24 else None
        exp = expected_change(probs, m["cuts"]) if probs is not None else np.nan
        lines.append(f"| {m['title']} | {_fmt(fp['value'] if fp else None, 2, pct=True)} | "
                     f"{_fmt(y1, pct=True)} | {_fmt(exp, 2, pct=True)} |")
        pth = _boot_path(r, latest)
        if not pd.isna(exp):                          # anchor the path on the contract's own next-month estimate
            shift = exp - pth[0]["median"]
            pth = [dict(q, median=q["median"] + shift, lo=q["lo"] + shift, hi=q["hi"] + shift) for q in pth]
        _DATA.setdefault("paths", {})[m["title"]] = pth
        _rec(series=m["title"], period=f"{nxt:%b %Y}", median=None if pd.isna(exp) else exp,
             lo=pth[0]["lo"], hi=pth[0]["hi"],
             last_change=fp["value"] if fp else None, year_change=None if pd.isna(y1) else y1,
             p_up=_p_up(probs, m["cuts"]) if probs is not None else None)
        if m["code"] == "ZA_CIPI":
            _spark("Construction input index (Stats SA, chained)", h)
            _OFFICIAL["south_africa"] = h
    _DATA["base"] = f"{latest:%b %Y}"
    _materials([(n, history(rel, f"cipi|{l}", cfg)) for n, l in [
        ("Cement", "cement"), ("Ready-mix concrete", "ready-mix concrete"), ("Reinforcing steel", "reinforcing metal work"),
        ("Aggregate stone", "aggregate stone"), ("Sand", "sand"), ("Bricks", "bricks"), ("Tiles", "tiles"), ("Paint", "paints"),
        ("Asphalt", "pre-mix asphalt")] if (rel.series_label == f"cipi|{l}").any()], "month")
    _DATA.update(kind="nowcast", basis=f"Stats SA {latest:%B %Y} release; expected change next month "
                 "from recent patterns (contract opening price)")
    lines += ["", f"Expected = the opening price of the {nxt:%B %Y} contract (recent change patterns; backtest over "
              "43 months beat plain frequencies for 7 of 12 contract-horizons, none significantly). A driver-based "
              "South Africa model is next."]
    return lines


def official_reading(country: str) -> list[str]:
    from country import load_country
    r = load_country(country).get("official_reading")
    if not r:
        return []
    parts = [f"level {r['level']}" if r.get("level") is not None else None,
             f"{r['change_period_pct']:+.1f}% on the previous period" if r.get("change_period_pct") is not None else None,
             f"{r['change_year_pct']:+.1f}% on a year earlier" if r.get("change_year_pct") is not None else None]
    q = "" if r.get("quality") == "official" else " (official figure as reported in the press; verify)"
    _DATA["official"] = r
    return [f"**Latest official reading:** {r['series']}, {r['period']}: "
            + ", ".join(x for x in parts if x) + f"{q}. Source: {r['source']}", ""]


def pressure_section(country: str) -> list[str]:
    from cost_pressure import pressure_history, forecast
    from country import load_country
    ccy_code, col = ccy(country)
    if load_country(country).get("pressure_currency") == "USD":     # dollarised construction pricing
        ccy_code, col = "USD", None
    try:
        hist, fc_all = pressure_history(col), forecast(col, horizons=tuple(range(1, 13)))
        fc = {h: fc_all[h] for h in (3, 6) if h in fc_all}
    except Exception:
        return ["_Cost-pressure indicator unavailable (no exchange-rate history)._"]
    if hist.empty or not fc:
        return ["_Cost-pressure indicator unavailable (no exchange-rate history)._"]
    last3 = float(hist.tail(3).sum())
    lines = ["**Imported-input cost pressure** (oil in " + ccy_code + " and the exchange rate, weighted like the "
             "official baskets in the pilot countries; an indicator, not a price index):", "",
             "| Window | Pressure on input costs | 80% range |", "|---|---|---|",
             f"| Last 3 months (observed) | {last3:+.1f}% | – |"]
    _spark(f"Imported-input cost pressure (index, 100 = 24 months ago)",
           100 * np.exp(hist.tail(24).cumsum() / 100))
    start = pd.Timestamp(hist.index[-1])
    _DATA["paths"] = {"Imported-input cost pressure": [
        _entry(start + pd.DateOffset(months=h), lo, med, hi) for h, (med, lo, hi) in sorted(fc_all.items())]}
    _DATA["base"] = f"{start:%b %Y}"
    _DATA.update(kind="pressure", basis=f"Imported-input cost pressure from oil in {ccy_code} and the exchange "
                 "rate; an indicator, not a price index", observed_3m=last3)
    for h, (med, lo, hi) in fc.items():
        lines.append(f"| Next {h} months | {med:+.1f}% | {lo:+.1f}% to {hi:+.1f}% |")
        _rec(series="Imported-input cost pressure", period=f"Next {h} months", median=med, lo=lo, hi=hi)
    lines += ["", "In Uganda and South Africa this indicator's 3-month changes correlate 0.26–0.37 with the official "
              "construction indices (0.45–0.58 with Uganda's diesel index): it captures the imported part of "
              "cost moves, not local materials or labour. Price reports from participants fill that gap."]
    return lines


def generic_body(weekly, country: str) -> list[str]:
    from country import load_country
    cfg = load_country(country)
    return (["## Official index", "", f"Status: {cfg['settlement']['publication']}.", ""]
            + official_reading(country) + ["## Cost pressure outlook", ""] + pressure_section(country))


def _fred(country: str, sid: str) -> pd.Series:
    f = ROOT / "countries" / country / "raw" / f"{sid}.csv"
    d = pd.read_csv(f, parse_dates=["date"])
    return d.set_index("date")["value"].astype(float)


def _ar1_path(changes: pd.Series, start, H: int = 12, n: int = 4000, window: int = 120, seed: int = 0) -> list[dict]:
    """Monthly change follows last month's change (AR(1) fitted on the last `window` months); the spread comes
    from resampling its own past errors. Chosen for the benchmark because its 80% ranges held about 80% of
    outcomes in a 48-month walk-forward test (the 60-month block bootstrap held 90-96%: too wide)."""
    x = changes.dropna().tail(window).values
    b = np.polyfit(x[:-1], x[1:], 1)
    res = x[1:] - np.polyval(b, x[:-1])
    rng = np.random.default_rng(seed)
    last, sims = np.full(n, x[-1]), np.zeros((n, H))
    for t in range(H):
        last = np.polyval(b, last) + rng.choice(res, n)
        sims[:, t] = last
    cum = np.cumsum(sims, axis=1)
    months = pd.date_range(pd.Timestamp(start) + pd.DateOffset(months=1), periods=H, freq="MS")
    return [_entry(m, *np.percentile(cum[:, i], [10, 50, 90])) for i, m in enumerate(months)]


def _scale(errs: list, recent: int = 24) -> float:
    """Width factor so that about 8 in 10 of the last `recent` errors fall inside the half-width. Recent errors only,
    so a calm spell is not remembered for ever; never narrower than 0.85x (a range should not be squeezed on luck)."""
    e = np.array(errs[-recent:])
    return float(np.clip(np.percentile(np.abs(e[:, 0]), 80) / max(1e-6, e[:, 1].mean()), 0.85, 2.5))


def walk_forward(levels: pd.Series, months: int = 48, horizons=(1, 3)) -> pd.DataFrame:
    """Test the method as if run in the past: at each month, forecast from the data up to then only,
    then compare with what happened. Ranges are calibrated only from errors of earlier test months
    (honest), so the test shows what the published, calibrated range would have done. Same columns as Uganda's file."""
    lv = levels.dropna()
    ch = (lv / lv.shift(1) - 1).dropna() * 100
    rows, errs = [], {h: [] for h in horizons}
    for i in range(len(lv) - months - max(horizons), len(lv) - max(horizons)):
        origin = lv.index[i]
        path = _ar1_path(ch[ch.index <= origin], origin, H=max(horizons), n=1500)
        for h in horizons:
            q = path[h - 1]
            sc = _scale(errs[h]) if len(errs[h]) >= 12 else 1.0
            act = (lv.iloc[i + h] / lv.iloc[i] - 1) * 100
            rows.append({"origin": origin.strftime("%Y-%m-%d"), "target": "ALL", "h": h, "actual": act, "structural": q["median"],
                         "lo": q["median"] - (q["median"] - q["lo"]) * sc, "hi": q["median"] + (q["hi"] - q["median"]) * sc, "no_change": 0.0})
            errs[h].append((act - q["median"], (q["hi"] - q["lo"]) / 2))
    out = pd.DataFrame(rows)
    out.attrs["scale"] = {h: (_scale(errs[h]) if len(errs[h]) >= 12 else 1.0) for h in horizons}
    return out


def _calibrate(path: list[dict], scale: dict) -> list[dict]:
    """Apply the tested width factors to a live path (1 month: scale[1]; 3+ months: scale[3]; in between: linear)."""
    s1, s3 = scale.get(1, 1.0), scale.get(3, scale.get(1, 1.0))
    out = []
    for h, q in enumerate(path, 1):
        sc = s1 if h <= 1 else s3 if h >= 3 else s1 + (s3 - s1) * (h - 1) / 2
        out.append(dict(q, lo=round(q["median"] - (q["median"] - q["lo"]) * sc, 3), hi=round(q["median"] + (q["hi"] - q["median"]) * sc, 3)))
    return out


def benchmark_body(weekly, country: str) -> list[str]:
    """Benchmark countries: the tool on a timely official index, with a 48-month walk-forward test."""
    from country import load_country
    cfg = load_country(country)
    series = cfg["benchmark_series"]
    head = _fred(country, series[0]["id"])
    latest = head.index.max()
    ch = (head / head.shift(1) - 1).dropna() * 100
    _spark(f"{series[0]['name']} ({cfg['settlement']['statistics_office']})", head)
    paths = {series[0]["name"]: _ar1_path(ch, latest)}
    mats = []
    for sr in series[1:]:
        try:
            lv = _fred(country, sr["id"])
        except FileNotFoundError:
            continue
        mats.append((sr["name"], lv.tail(30)))
        if len(paths) < 6:
            c2 = (lv / lv.shift(1) - 1).dropna() * 100
            paths[sr["name"]] = _ar1_path(c2, lv.index.max())
    _DATA["paths"] = paths
    _DATA["base"] = f"{latest:%b %Y}"
    if mats:
        _materials(mats, "month")
    bt = walk_forward(head)
    paths[series[0]["name"]] = _calibrate(paths[series[0]["name"]], bt.attrs["scale"])
    out = ROOT / "countries" / country / "outputs" / "forecast"
    out.mkdir(parents=True, exist_ok=True)
    bt.to_csv(out / "backtest_errors.csv", index=False)
    stats = {}
    for h in (1, 3):
        b = bt[bt.h == h]
        stats[h] = {"inside": float(((b.actual >= b.lo) & (b.actual <= b.hi)).mean()),
                    "mae": float((b.actual - b.structural).abs().mean()), "mae_nochange": float(b.actual.abs().mean()), "n": int(len(b))}
    _DATA.update(kind="benchmark", benchmark=stats, region=cfg.get("aliases", [""])[0],
                 basis=f"{cfg['settlement']['statistics_office']} {latest:%B %Y}; forecast tested month by month on the last 48 months")
    for q in paths[series[0]["name"]][:3]:
        _rec(series=series[0]["name"], period=q["month"], median=q["median"], lo=q["lo"], hi=q["hi"])
    return [f"## Benchmark: {cfg['country']}", "", f"{cfg['settlement']['publication']}, latest **{latest:%B %Y}**.", "",
            f"Inside the likely range over the last {stats[1]['n']} months: {stats[1]['inside']:.0%} (1 month ahead), "
            f"{stats[3]['inside']:.0%} (3 months ahead)."]


BODIES = {"uganda": uganda_body, "kenya": kenya_body, "south_africa": south_africa_body}


def _log_forecast(country: str, d: dict) -> None:
    """Append today's head-series path to data/live/forecast_log/<country>.csv (one set of rows per day), so the
    site can later show each forecast next to the official figure."""
    import csv
    paths = d.get("paths") or {}
    if not paths or not d.get("base"):
        return
    f = ROOT / "data" / "live" / "forecast_log" / f"{country}.csv"
    f.parent.mkdir(parents=True, exist_ok=True)
    today = date.today().isoformat()
    rows = list(csv.DictReader(open(f))) if f.exists() else []
    rows = [r for r in rows if r["made"] != today]
    rows += [{"made": today, "base": d["base"], "target": q["month"], "median": f"{q['median']:.3f}", "lo": f"{q['lo']:.3f}",
              "hi": f"{q['hi']:.3f}"} for q in next(iter(paths.values()))[:6]]
    with open(f, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["made", "base", "target", "median", "lo", "hi"])
        w.writeheader()
        w.writerows(rows)


def build(country: str = "uganda", fetch: bool = True, db_path: Path = DEFAULT_DB, write_note: bool = True) -> Path:
    if fetch:
        import build_weekly_drivers
        build_weekly_drivers.build()
    from country import load_country
    cfg = load_country(country)
    weekly = pd.read_csv(ROOT / "data" / "shared" / "weekly_drivers.csv", parse_dates=["date"]).set_index("date")
    today = date.today()
    _DATA.clear()
    _MAT_LEVELS.clear()
    _OFFICIAL.clear()
    _DATA.update(country=cfg["country"], key=country, currency=cfg["currency"], generated=today.isoformat())
    ccy_code, col = ccy(country)
    _DATA["drivers"] = {"brent_usd": float(weekly["brent_usd"].dropna().iloc[-1]),
                        "brent_13w_pct": _chg(weekly["brent_usd"], 91),
                        "fx": float(weekly[col].dropna().iloc[-1]) if col in weekly and weekly[col].notna().any() else None,
                        "fx_13w_pct": _chg(weekly[col], 91) if col in weekly else None}
    lines = [f"# {cfg['country']} construction cost note — week of {today:%d %B %Y}", "", HEADER, "",
             "## This week's drivers", ""] + drivers_section(weekly, country) + [""]
    from country import load_country as _lc
    lines += (benchmark_body(weekly, country) if _lc(country).get("benchmark")
              else BODIES[country](weekly) if country in BODIES else generic_body(weekly, country))
    lines += ["", "## Prices reported by participants", ""] + crowd_section(db_path, country)
    lines += ["", "## Open forecasting contracts", ""] + market_section(db_path, country)
    lines += ["", "## Sources", "",
              "UBOS (Uganda CIPI), KNBS (Kenya CIPI), EIA (Brent), IMF and currency-api (exchange rates), "
              "ERA5 (rainfall). How the forecasts work: see How it works on the CiO site."]
    _add_trend_paths()
    check_estimate_method(country)
    out = ROOT / "countries" / country / "outputs"
    out.mkdir(parents=True, exist_ok=True)
    clean = json.loads(json.dumps(_DATA, default=lambda x: None if x is None else float(x)).replace("NaN", "null"))
    (out / "forecast_latest.json").write_text(json.dumps(clean, indent=1), encoding="utf-8")
    _log_forecast(country, clean)
    if not write_note:
        return out / "forecast_latest.json"
    # The published note is the plain-language one; the detailed tables live on the country web page.
    from plain_note import plain_note
    crowd_rows = []
    if Path(db_path).exists():
        from reports import Participants
        with Participants(db_path) as pp:
            crowd_rows = pp.crowd_summary(country, cfg.get("price_items", [])).to_dict("records")
    sp = ROOT / "config" / "site.yaml"
    site_cfg = (yaml.safe_load(sp.read_text()) or {}) if sp.exists() else {}
    md, txt = plain_note(clean, cfg, crowd_rows, today, os.environ.get("CIO_SITE_URL", ""),
                         str(site_cfg.get("whatsapp_channel_url") or ""))
    path = _write(country, md, today)
    path.with_suffix(".txt").write_text(txt + "\n", encoding="utf-8")     # paste into the WhatsApp Channel
    return path


def to_html(md: str, title: str) -> str:
    """Small markdown subset (headings, bullets, links, bold, italics, tables, paragraphs) -> standalone page."""
    import re
    out, table, bullets = [], [], []

    def inline(t):
        t = html.escape(t)
        t = re.sub(r"\[(.+?)\]\((.+?)\)", r"<a href='\2'>\1</a>", t)
        t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
        return re.sub(r"(?<![\w/])_(.+?)_(?![\w/])", r"<em>\1</em>", t)

    def flush():
        if table:
            head, body = table[0], table[2:]
            out.append("<div class=t><table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in head)
                       + "</tr></thead><tbody>" + "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r)
                                                          + "</tr>" for r in body) + "</tbody></table></div>")
            table.clear()
        if bullets:
            out.append("<ul>" + "".join(f"<li>{inline(b)}</li>" for b in bullets) + "</ul>")
            bullets.clear()
    for line in md.splitlines():
        if line.startswith("|"):
            table.append([c.strip() for c in line.strip("|").split("|")])
            continue
        if line.startswith("- "):
            bullets.append(line[2:])
            continue
        flush()
        if line.startswith("# "):
            out.append(f"<h1>{inline(line[2:])}</h1>")
        elif line.startswith("## "):
            out.append(f"<h2>{inline(line[3:])}</h2>")
        elif line.strip():
            out.append(f"<p>{inline(line)}</p>")
    flush()
    css = (":root{--bg:#f4f7fa;--card:#fff;--fg:#0e0f11;--mut:#5f646b;--line:#e1e6ec;--acc:#ffc21a;--acc-ink:#8a6600}"
           "@media (prefers-color-scheme:dark){:root{--bg:#0a0a0b;--card:#141416;--fg:#f5f5f2;--mut:#9e9e99;--line:#27272b;--acc-ink:#ffc21a}}"
           "body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif}"
           "main{max-width:720px;margin:0 auto;padding:24px 16px 48px}h1{font-size:1.65rem;line-height:1.2;margin:.2em 0 .6em}"
           "h2{font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;color:var(--acc-ink);margin:1.8em 0 .4em}"
           "h2+p{font-size:1.12rem}ul{padding-left:1.1em}li{margin:.35em 0}a{color:inherit}strong{font-weight:700}"
           "em{color:var(--mut)}p:first-of-type{background:var(--card)}"
           ".t{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.92rem}"
           "th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line)}th{color:var(--mut)}")
    return (f"<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport "
            f"content='width=device-width,initial-scale=1'><title>{html.escape(title)}</title>"
            f"<style>{css}</style></head><body><main>{''.join(out)}</main></body></html>")


def latest_note(country: str, kind: str = "html") -> Path | None:
    notes = sorted((NOTES / country / "notes").glob(f"weekly_{country}_*.{kind}"))
    return notes[-1] if notes else None


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    from country import list_countries
    ap.add_argument("--country", default="all", choices=["all", *list_countries()])
    ap.add_argument("--no-fetch", action="store_true", help="use the drivers already on disk")
    ap.add_argument("--db", default=str(DEFAULT_DB))
    ap.add_argument("--data-only", action="store_true", help="refresh forecast_latest.json only; no new note files")
    a = ap.parse_args()
    fetch = not a.no_fetch
    for c in (list_countries() if a.country == "all" else [a.country]):
        print("wrote", build(c, fetch=fetch, db_path=Path(a.db), write_note=not a.data_only))
        fetch = False                      # drivers fetched once per run

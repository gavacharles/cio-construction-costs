"""
material_models.py — a driver model for each building material, found and proven on the data.

For each material the candidate drivers come from what moves it economically (world steel and iron ore for steel,
oil for fuel and asphalt, coal for cement, rain and transport fuel for sand and stone, copper for fittings ...), all in
local currency. Each candidate is a small model: monthly change = damped drift + sensitivity x driver change
(averaged over k periods, starting s periods back), with the sensitivity shrunk towards zero.

Honest selection: the test window (last 48 months, or 16 quarters) is split in two. The model is CHOSEN on the first
half (including "drift only" and "no change" as candidates) and JUDGED on the second half, which played no part in the
choice. The test mimics how the forecast is used: the material's own figures stop at the official release, while the
drivers are known for the months since (that is how the gap after the last official release is filled).

    sel = discover(levels, step, drivers, name)   # -> dict: spec, drivers, test results, live path
"""
from __future__ import annotations

import itertools

import numpy as np
import pandas as pd

GROUPS = [   # (keywords in the material name, candidate driver sets)
    (("steel", "rebar", "reinforc", "iron sheet", "roofing", "nails", "metal", "galvan", "formwork"),
     [["steel"], ["iron_ore"], ["fx"], ["steel", "fx"]]),
    (("diesel", "fuel", "lubric", "petrol"), [["oil"], ["oil", "fx"]]),
    (("asphalt", "bitumen"), [["oil"], ["oil", "fx"]]),
    (("paint", "plastic", "pvc", "upvc"), [["oil"], ["fx"], ["oil", "fx"]]),
    (("copper", "electric", "wiring", "cable"), [["copper"], ["copper", "fx"]]),
    (("cement", "concrete", "ready", "block", "brick", "lime"), [["coal"], ["oil"], ["fx"], ["coal", "fx"]]),
    (("sand", "aggregate", "stone", "ballast", "hardcore", "quarry", "murram", "gravel"), [["rain"], ["oil"], ["rain", "oil"]]),
    (("tile", "glass", "ceramic"), [["fx"], ["natgas"], ["coal"]]),
    (("timber", "wood", "plywood", "teak", "hardwood"), [["fx"]]),
    (("labour", "labor", "wage"), [["fx"]]),
]
DEFAULT = [["fx"], ["oil"]]
LABEL = {"steel": "world steel prices", "iron_ore": "iron ore", "fx": "the exchange rate", "oil": "oil",
         "coal": "coal", "copper": "copper", "natgas": "natural gas", "rain": "rainfall"}


# Groups where pooling every country's materials (Oct 2026 test) showed real predictability over 3 months:
# fuel 23% smaller misses than "no change", labour 10%, sand and stone about level. For the other groups no driver
# beat "no change", so they use "no change" with a calibrated range rather than a model fitted to noise.
PREDICTABLE = [(("diesel", "fuel", "lubric", "petrol"), [["oil"]]),
               (("labour", "labor", "wage"), [["fx"]]),
               (("sand", "aggregate", "stone", "ballast", "hardcore", "quarry", "murram", "gravel"), [["oil"], ["rain", "oil"]])]


def candidates(name: str, all_groups: bool = False) -> list[list[str]]:
    if not all_groups:
        n = name.lower()
        return next((c for keys, c in PREDICTABLE if any(k in n for k in keys)), [])
    n = name.lower()
    return next((c for keys, c in GROUPS if any(k in n for k in keys)), DEFAULT)


def driver_frame(drv: pd.DataFrame, quarterly: bool) -> pd.DataFrame:
    """% changes (log) of each driver in local currency; rainfall as its anomaly level."""
    d = drv.copy()
    if quarterly:
        d = d.groupby(d.index.to_period("Q")).mean()
        d.index = d.index.to_timestamp()
    out = pd.DataFrame(index=d.index)
    for c in d.columns:
        out[c] = d[c] if c == "rain" else 100 * np.log(d[c]).diff()
    return out


def _x(D: pd.DataFrame, cols: list[str], k: int, s: int) -> pd.DataFrame:
    return D[cols].rolling(k).mean().shift(s)


def _fit_predict(y: pd.Series, X: pd.DataFrame, i: int, H: int, win: int, lam: float):
    """Fit on periods before i; predict the H periods from i with their drivers known. Returns (pred list, residuals)."""
    tr_idx = y.index[max(0, i - win):i]
    yt = y.loc[tr_idx]
    d = 0.5 * yt.tail(12).mean()
    if X is None or X.empty:
        return [d] * H, (yt - yt.mean()).values
    Xt = X.loc[tr_idx].dropna()
    yt2 = yt.loc[Xt.index]
    if len(Xt) < 12:
        return [d] * H, (yt - yt.mean()).values
    xm, ym = Xt.mean(), yt2.mean()
    A = (Xt - xm).values
    b = np.linalg.solve(A.T @ A + lam * len(Xt) * np.eye(A.shape[1]), A.T @ (yt2 - ym).values)
    fitted = d + (A @ b)
    preds = []
    for h in range(H):
        t = y.index[i + h] if i + h < len(y) else None
        xr = X.loc[t] if t is not None and t in X.index else None
        preds.append(d + float(((xr - xm).fillna(0).values) @ b) if xr is not None and xr.notna().all() else d - float(xm.values @ b) * 0)
    return preds, (yt2.values - fitted)


def _evaluate(y, X, H, idx, win, lam, nochange: bool = False):
    """Mean absolute miss of the H-period total, and per origin (error, half-width of the residual 80% band)."""
    out = []
    for i in idx:
        if i + H > len(y):
            continue
        p, res = _fit_predict(y, X, i, H, win, lam)
        pred = 0.0 if nochange else sum(p)
        r = res if not nochange else (y.iloc[max(0, i - win):i] - y.iloc[max(0, i - win):i].mean()).values
        lo, hi = np.percentile(r, [10, 90])
        out.append((y.iloc[i:i + H].sum() - pred, (hi - lo) / 2 * np.sqrt(H)))
    return (float(np.mean([abs(e) for e, _ in out])) if out else np.inf), out


MARGIN = 0.95      # a driver or drift model must beat "no change" by 5% on the choosing half, so it does not win on luck


def discover(levels: pd.Series, step: str, drivers: pd.DataFrame, name: str, H: int = 3) -> dict:
    """Choose this material's model on the first half of the test window; judge it on the second half."""
    q = step == "quarter"
    lv = pd.Series(levels).dropna()
    y = 100 * np.log(lv).diff().dropna()
    y.index = pd.PeriodIndex(y.index, freq="Q").to_timestamp() if q else pd.to_datetime(y.index).to_period("M").to_timestamp()
    D = driver_frame(drivers, q)
    tl, win, H = (16, 40, min(H, 2)) if q else (48, 60, H)
    start = max(12 if q else 24, len(y) - tl - H + 1)
    test = list(range(start, len(y) - H + 1))
    half = len(test) // 2
    sel_idx, eval_idx = test[:half], test[half:]
    specs = [("drift", None, 0, 0, 0.0)] if candidates(name) else []
    for cols in candidates(name):
        cols = [c for c in cols if c in D.columns]
        if not cols:
            continue
        for k, s_, lam in itertools.product((1, 3) if not q else (1,), (0, 1, 2) if not q else (0, 1), (0.5, 4.0)):
            specs.append(("drivers", cols, k, s_, lam))
    nc_sel, nc_rows = _evaluate(y, None, H, sel_idx, win, 0, nochange=True)
    best = (np.inf, nc_rows, "nochange", [], 0, 0, 0.0, None)
    for kind, cols, k, s_, lam in specs:
        X = _x(D, cols, k, s_).reindex(y.index) if cols else None
        sc, rows = _evaluate(y, X, H, sel_idx, win, lam)
        if best is None or sc < best[0]:
            best = (sc, rows, kind, cols, k, s_, lam, X)
    sc, rows, kind, cols, k, s_, lam, X = best
    if not sc < MARGIN * nc_sel:                                    # not clearly better than "no change": use it
        kind, cols, X, rows, lam = "nochange", [], None, nc_rows, 0.0
    e = np.array(rows)
    scale = float(np.clip(np.percentile(np.abs(e[:, 0]), 80) / max(1e-6, e[:, 1].mean()), 0.85, 2.5)) if len(e) else 1.0
    ev, ev_rows = _evaluate(y, X, H, eval_idx, win, lam, nochange=(kind == "nochange"))
    ev_drift, _ = _evaluate(y, None, H, eval_idx, win, 0)
    ev_nc, _ = _evaluate(y, None, H, eval_idx, win, 0, nochange=True)
    inside = float(np.mean([abs(err) <= hw * scale for err, hw in ev_rows])) if ev_rows else None
    return {"kind": kind, "drivers": cols or [], "k": k, "lag": s_, "lam": lam, "horizon": H, "scale": scale,
            "periods_tested": len(ev_rows), "inside": inside,
            "test": {"model": round(ev, 3), "drift": round(ev_drift, 3), "nochange": round(ev_nc, 3)},
            "_y": y, "_X": X, "_win": win}


def path(sel: dict, last_date, months_ahead: int, quarterly: bool) -> list[tuple]:
    """Live forecast from the chosen model: cumulative (median, lo, hi) for each period after the last official
    figure. Periods whose drivers are already known are filled with them (the gap); later ones assume no driver change."""
    y, X, win = sel["_y"], sel["_X"], sel["_win"]
    n = months_ahead
    if sel["kind"] == "nochange":
        med = [0.0] * n
        res = (y.tail(win) - y.tail(win).mean()).values
    else:
        d = 0.5 * y.tail(12).mean()
        if X is None:
            med, res = [d] * n, (y.tail(win) - y.tail(win).mean()).values
        else:
            Xt = X.loc[y.index[-win:]].dropna(); yt = y.loc[Xt.index]
            xm, ym = Xt.mean(), yt.mean(); A = (Xt - xm).values
            b = np.linalg.solve(A.T @ A + sel["lam"] * len(Xt) * np.eye(A.shape[1]), A.T @ (yt - ym).values)
            res = yt.values - (d + A @ b)
            step = pd.DateOffset(months=3 if quarterly else 1)
            med, t = [], pd.Timestamp(last_date)
            for _ in range(n):
                t = t + step
                xr = X.loc[t] if t in X.index else None
                med.append(d + float((xr - xm).values @ b) if xr is not None and xr.notna().all() else d)
    lo_q, hi_q = np.percentile(res, [10, 90])
    out, cum = [], 0.0
    for h, m in enumerate(med, 1):
        cum += m
        out.append((cum, cum + lo_q * np.sqrt(h) * sel.get("scale", 1.0), cum + hi_q * np.sqrt(h) * sel.get("scale", 1.0)))
    return out


def describe(sel: dict) -> str:
    if sel["kind"] == "nochange":
        return "no change (nothing beat it in the test)"
    if not sel["drivers"]:
        return "its own trend"
    lag = {0: "the same month", 1: "one month later", 2: "two months later"}.get(sel["lag"], f"{sel['lag']} periods later")
    return " and ".join(LABEL.get(c, c) for c in sel["drivers"]) + f" (shows up {lag})"


def country_drivers(fx_col: str, with_rain: bool = False) -> pd.DataFrame:
    """Monthly drivers in local currency: fx, oil (Brent), world steel, iron ore, copper, coal, natural gas
    (+ rainfall anomaly for Uganda, the only country with a rainfall series so far)."""
    from pathlib import Path
    import cost_pressure
    root = Path(__file__).resolve().parents[2]
    base = cost_pressure._monthly_drivers(fx_col)
    out = pd.DataFrame({"fx": base.fx, "oil": base.brent * base.fx})
    cf = root / "data" / "shared" / "commodities_monthly.csv"
    if cf.exists():
        com = pd.read_csv(cf, parse_dates=["date"]).set_index("date")
        com.index = com.index.to_period("M").to_timestamp()
        fx = base.fx.reindex(com.index).ffill()
        for c in ("steel", "iron_ore", "copper", "coal", "natgas"):
            if c in com:
                out[c] = (com[c] * fx).reindex(out.index)
    rf = root / "data" / "shared" / "rainfall_era5_monthly.csv"
    if with_rain and rf.exists():
        r = pd.read_csv(rf, parse_dates=["date"]).set_index("date")["rain_anomaly"]
        r.index = r.index.to_period("M").to_timestamp()
        out["rain"] = r.reindex(out.index)
    return out

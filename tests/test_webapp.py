"""
test_webapp.py
==============
Participant app, price reports, Kenya settlement and the weekly-note pieces. Run: pytest -q
"""
import sys
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
for sub in ("market", "webapp", "ingest", "forecast"):
    sys.path.insert(0, str(ROOT / "src" / sub))

from reports import Participants, ReportError           # noqa: E402

ITEMS = [{"code": "cement_50kg", "name": "Cement", "unit": "bag"}]


def test_crowd_summary_uses_one_median_per_reporter():
    db = Participants(":memory:")
    old, now = date.today() - timedelta(weeks=10), date.today()             # 10 weeks ago: outside the 8-week window
    db.add_report("a", "uganda", "cement_50kg", 30000, "Kampala", on=old)
    for p in (33000, 33000, 99000, 99000, 99000):          # one person spamming high prices
        db.add_report("a", "uganda", "cement_50kg", p, "Kampala", on=now)
    db.add_report("b", "uganda", "cement_50kg", 33000, "Jinja", on=now - timedelta(weeks=5))   # earlier, still in the window
    s = db.crowd_summary("uganda", ITEMS).iloc[0]
    assert not s.published and s["median"] is None and s.pending == 2    # 2 people < the minimum of 3
    s = db.crowd_summary("uganda", ITEMS, min_reporters=2).iloc[0]
    assert s.reporters == 2 and s["median"] == pytest.approx((99000 + 33000) / 2)   # median of per-person medians
    with pytest.raises(ReportError):
        db.add_report("a", "uganda", "cement_50kg", -5, "Kampala")
    with pytest.raises(ReportError):
        db.add_report("a", "uganda", "steel", 5, "Kampala", items=["cement_50kg"])


def test_open_site_and_organiser_pages(tmp_path, monkeypatch):
    monkeypatch.setenv("CIO_DB", str(tmp_path / "x.sqlite"))
    monkeypatch.setenv("CIO_ADMIN_KEY", "k")
    monkeypatch.setenv("CIO_SECURE_COOKIES", "0")       # the test client speaks plain http
    import importlib
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    c = TestClient(webapp.app)
    r = c.get("/app", follow_redirects=False)                       # members area retired: anyone uses the public site
    assert r.status_code == 301 and r.headers["location"] == "/"
    assert c.post("/admin/invite", data={"name": "x", "country": "uganda"}).status_code in (404, 405)
    assert c.get("/home").status_code == 404 and c.get("/leaderboard").status_code == 404
    assert "Wrong password" in c.post("/admin/login", data={"key": "wrong"}).text
    c.post("/admin/login", data={"key": "k"})
    page = c.get("/admin").text
    assert "Uganda" in page and "Nigeria" in page and "Ghana" not in page and "pilot-report" in page
    assert c.get("/").headers["x-frame-options"] == "DENY"


def test_admin_login_rate_limit(tmp_path, monkeypatch):
    monkeypatch.setenv("CIO_DB", str(tmp_path / "y.sqlite"))
    monkeypatch.setenv("CIO_ADMIN_KEY", "k")
    monkeypatch.setenv("CIO_SECURE_COOKIES", "0")
    import importlib
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    c = TestClient(webapp.app)
    for _ in range(10):
        assert "Wrong" in c.post("/admin/login", data={"key": "BAD"}, follow_redirects=False).headers["location"]
    assert "Too+many" in c.post("/admin/login", data={"key": "BAD"}, follow_redirects=False).headers["location"]


KNBS = ROOT / "countries" / "kenya" / "raw" / "Construction-Input-Price-Indices-for-Fourth-Quarter-2024.pdf"


@pytest.mark.skipif(not KNBS.exists(), reason="KNBS release not on disk")
def test_knbs_parse_and_quarterly_settlement():
    from parse_knbs_cipi import parse_release
    from settlement import first_print
    d = parse_release(KNBS)
    tot = d[(d.sheet == "ALL") & (d.series_label == "total")].set_index("date")["index_value"]
    assert tot[pd.Timestamp("2024-10-01")] == 119.41 and tot[pd.Timestamp("2024-07-01")] == 120.38
    w = d[(d.sheet == "ALL") & ~d.is_aggregate].drop_duplicates("series_label").weight.sum()
    assert w == pytest.approx(100, abs=0.2)                       # the full basket is published
    rel = d.assign(series_label=d.sheet.str.lower() + "|" + d.series_label,
                   release_month=d.release_period)
    fp = first_print(rel, "all|total", "2024-10-01", step_months=3)
    assert fp["value"] == round((119.41 / 120.38 - 1) * 100, 2)


def test_known_macro_overrides_simulation():
    import yaml
    from index_structure import read_release
    from model import ForecastModel, load_macro, known_primitives
    rel = ROOT / "countries" / "uganda" / "raw" / "06_2026CIPI_APRIL_2026_PIN_UPS.xlsx"
    if not rel.exists():
        pytest.skip("April 2026 release not on disk")
    cfg = yaml.safe_load(open(ROOT / "countries" / "uganda" / "forecast_model.yaml"))
    macro = load_macro(cfg, ROOT)
    m = ForecastModel(cfg).fit(read_release(rel), macro, "2025-12-01")
    ext = macro.loc["2026-01-01":"2026-02-01", ["exchange_rate"]] * 1.10   # pretend a 10% depreciation
    known = known_primitives(macro, ext, cfg, m.origin, 3, m.prim_cols)
    j = m.prim_cols.index("exchange_rate")
    assert not np.isnan(known[0, j]) and not np.isnan(known[1, j]) and np.isnan(known[2, j])
    lo = m.aggregate_paths(m.simulate(3, n_paths=300, seed=1), "ALL")[:, 1]
    hi = m.aggregate_paths(m.simulate(3, n_paths=300, seed=1, known=known), "ALL")[:, 1]
    assert np.median(hi) > np.median(lo)


def test_quarterly_model_uses_known_drivers():
    from quarterly_model import QuarterlyModel
    idx = pd.date_range("2019-10-01", periods=24, freq="QS-JAN")
    rng = np.random.default_rng(0)
    D = pd.DataFrame({"fx": rng.normal(0, 2, 24), "oil": rng.normal(0, 8, 24)}, index=idx)
    r = 0.5 + 0.08 * D["oil"] + rng.normal(0, 0.3, 24)          # index driven by oil
    lv = 100 * np.exp(np.cumsum(r) / 100)
    m = QuarterlyModel(alpha=1.0).fit(lv, D)
    assert m.coef[m.names.index("oil_0")] > 0.03
    up = pd.DataFrame({"fx": [0.0], "oil": [30.0]}, index=[idx[-1] + pd.DateOffset(months=3)])
    down = up.assign(oil=-30.0)
    hi, _ = m.simulate(1, n_paths=500, known=up)
    lo, _ = m.simulate(1, n_paths=500, known=down)
    assert np.median(hi) > np.median(lo)


@pytest.mark.skipif(not (ROOT / "data" / "shared" / "weekly_drivers.csv").exists(), reason="no weekly drivers")
def test_rwanda_note_builds_offline(tmp_path, monkeypatch):
    import weekly_note
    monkeypatch.setattr(weekly_note, "NOTES", tmp_path)
    md = weekly_note.build("rwanda", fetch=False, db_path=tmp_path / "none.sqlite").read_text()
    assert "# Rwanda construction costs" in md and "What it means for your money" in md and "RWF" in md
    assert (tmp_path / md.splitlines()[0] if False else tmp_path).exists()
    assert any(p.suffix == ".html" for p in tmp_path.rglob("*"))


def test_chained_history_survives_rebasing():
    from settlement import chained_first_prints, first_print
    rows = []
    # release A (base 1): Jan 100, Feb 102; release B rebased x0.5: Feb 51, Mar 52.02
    for src, rm, vals in [("A", "2024-02-01", {"2024-01-01": 100, "2024-02-01": 102}),
                          ("B", "2024-03-01", {"2024-02-01": 51, "2024-03-01": 52.02})]:
        for d, v in vals.items():
            rows.append({"source_file": src, "series_label": "x", "date": pd.Timestamp(d), "index_value": v,
                         "release_month": pd.Timestamp(rm)})
    rel = pd.DataFrame(rows)
    h = chained_first_prints(rel, "x")
    assert h.iloc[0] == pytest.approx(102) and h.iloc[1] == pytest.approx(102 * 1.02)
    assert first_print(rel, "x", "2024-03-01")["value"] == 2.0


def test_all_country_configs_and_generic_note(tmp_path, monkeypatch):
    from country import load_country, list_countries
    cs = list_countries()
    assert {"south_africa", "nigeria", "ghana", "zimbabwe"} <= set(cs)
    assert all(load_country(c)["fx_code"] and (load_country(c).get("price_items") or load_country(c).get("benchmark")) for c in cs)
    if not (ROOT / "data" / "shared" / "weekly_drivers.csv").exists():
        pytest.skip("no weekly drivers")
    import weekly_note
    monkeypatch.setattr(weekly_note, "NOTES", tmp_path)
    md = weekly_note.build("nigeria", fetch=False, db_path=tmp_path / "none.sqlite").read_text()
    assert "# Nigeria construction costs" in md and "no official construction price index" in md and "Prices to watch" in md


def test_cost_pressure_indicator():
    if not (ROOT / "data" / "shared" / "fx_imf_monthly.csv").exists():
        pytest.skip("no FX history")
    from cost_pressure import pressure_history, forecast, W_FUEL, W_IMPORT
    h = pressure_history("ugx_per_usd")
    assert len(h) > 60 and h.abs().max() < 20
    f = forecast("ugx_per_usd", horizons=(3, 6))
    assert f[3][1] <= f[3][0] <= f[3][2] and f[6][2] >= f[3][2]          # wider range further out
    assert 0 < W_FUEL < W_IMPORT < 1


def test_benchmark_walk_forward_has_no_lookahead():
    import numpy as np
    import pandas as pd
    import weekly_note
    idx = pd.date_range("2010-01-01", periods=200, freq="MS")
    lv = pd.Series(100 * np.exp(np.cumsum(np.random.default_rng(1).normal(0.2, 0.6, 200) / 100)), index=idx)
    a = weekly_note.walk_forward(lv, months=24)
    lv2 = lv.copy()
    lv2.iloc[-3:] *= 1.5                                    # change only the last 3 months
    b = weekly_note.walk_forward(lv2, months=24)
    first = a.origin < str(idx[-4].date())                  # forecasts made before those months ...
    assert np.allclose(a[first].structural, b[first].structural)       # ... cannot see them
    assert np.allclose(a[first].lo, b[first].lo) and np.allclose(a[first].hi, b[first].hi)   # nor can their calibrated ranges
    inside = ((a.actual >= a.lo) & (a.actual <= a.hi)).mean()
    assert 0.5 < inside <= 1.0 and set(a.h) == {1, 3}


def test_cycle_follows_app_database(monkeypatch):
    import importlib, sys as _s
    monkeypatch.setenv("CIO_DB", "/tmp/demo.sqlite")
    import run_market
    importlib.reload(run_market)
    assert str(run_market.DEFAULT_DB) == "/tmp/demo.sqlite"


def test_front_page_builds():
    sys.path.insert(0, str(ROOT / "src" / "site"))
    import build_index
    build_index.build()
    idx = (ROOT / "public" / "index.html").read_text()
    live = build_index.LIVE
    assert idx.count("<article class=card") == len(live) and "[hidden]" in (ROOT / "public" / "assets" / "cio.css").read_text()
    assert not (ROOT / "public" / "countries" / "ghana").exists()          # not live yet: no public page
    assert "Join the pilot" not in idx and "united_states" in idx
    assert ".md" not in idx and "docs/" not in idx                        # no internal documents linked
    for page in ("play.html", "method.html", "countries/uganda/index.html", "countries/united_states/index.html"):
        t = (ROOT / "public" / page).read_text()
        assert "cio-data" in t and ".md'" not in t and '.md"' not in t

def test_public_price_and_alert_api(tmp_path, monkeypatch):
    monkeypatch.setenv("CIO_DB", str(tmp_path / "pub.sqlite"))
    monkeypatch.setenv("CIO_SECURE_COOKIES", "0")
    import importlib
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    c = TestClient(webapp.app)
    ok = c.post("/api/public/price", json={"country": "kenya", "item": "cement_50kg", "price": 780, "location": "Nairobi"})
    assert ok.json()["ok"]
    assert c.post("/api/public/price", json={"country": "kenya", "item": "gold", "price": 1, "location": "x"}).status_code == 400
    assert c.post("/api/public/price", json={"country": "mars", "item": "cement_50kg", "price": 1, "location": "x"}).status_code == 400
    assert c.post("/api/public/alert", json={"country": "uganda", "series": "Diesel", "threshold": 10,
                                             "channel": "email", "contact": "a@b.co"}).status_code == 400   # no consent
    assert c.post("/api/public/alert", json={"country": "uganda", "series": "Diesel", "threshold": 10, "consent": True,
                                             "channel": "email", "contact": "a@b.co"}).json()["ok"]
    assert c.post("/api/public/alert", json={"country": "uganda", "series": "Diesel", "threshold": 10, "consent": True,
                                             "channel": "email", "contact": "nope"}).status_code == 400
    from reports import Participants
    with Participants(tmp_path / "pub.sqlite") as p:
        r = p.reports("kenya")
        assert len(r) == 1 and r.handle.iloc[0].startswith("anon-") and len(p.active_alerts()) == 1
    if (webapp.ROOT / "public" / "index.html").exists():
        assert "CiO Costs" in c.get("/").text and c.get("/data/live/exchange.sqlite").status_code == 404


def test_widget_can_be_framed_but_site_cannot(tmp_path, monkeypatch):
    if not (ROOT / "public" / "embed.html").exists():
        pytest.skip("site not built")
    monkeypatch.setenv("CIO_DB", str(tmp_path / "w.sqlite"))
    import importlib
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    c = TestClient(webapp.app)
    for path in ("/embed.html", "/widget.js"):
        r = c.get(path)
        assert r.status_code == 200 and "frame-ancestors *" in r.headers.get("content-security-policy", "")
        assert "x-frame-options" not in r.headers
    assert c.get("/").headers["x-frame-options"] == "DENY"


def test_price_typo_check_and_area_prices(tmp_path, monkeypatch):
    monkeypatch.setenv("CIO_DB", str(tmp_path / "p.sqlite"))
    import importlib
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    from reports import Participants
    c = TestClient(webapp.app)
    with Participants(tmp_path / "p.sqlite") as p:
        for h, a, v in (("a", "capital", 35000), ("b", "capital", 36000), ("c", "capital", 34000), ("d", "other", 38000)):
            p.add_report(h, "uganda", "cement_50kg", v, "Kampala", area=a)
        assert p.check_price("uganda", "cement_50kg", 350000) == 35500 and p.check_price("uganda", "cement_50kg", 37000) is None
        row = p.crowd_summary("uganda", [{"code": "cement_50kg", "name": "Cement", "unit": "bag"}]).iloc[0]
        assert row["capital"] == 35000 and row["other"] is None and row["other_n"] == 1
    body = {"country": "uganda", "item": "cement_50kg", "price": 350000, "location": "Gulu", "area": "other"}
    r = c.post("/api/public/price", json=body).json()
    assert r["check"] and r["usual"] == 35500 and not r["ok"]                    # queried, not saved
    assert c.post("/api/public/price", json=dict(body, confirm=True)).json()["ok"]    # saved once confirmed
    assert c.post("/api/public/price", json=dict(body, area="moon", confirm=True)).status_code == 400


def test_visit_counting_and_pilot_report(tmp_path, monkeypatch):
    monkeypatch.setenv("CIO_DB", str(tmp_path / "u.sqlite"))
    monkeypatch.setenv("CIO_ADMIN_KEY", "k")
    monkeypatch.setenv("CIO_SECURE_COOKIES", "0")
    import importlib
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    from usage import Usage
    c = TestClient(webapp.app)
    for _ in range(3):
        assert c.post("/api/public/hit", content='{"path": "/", "kind": "view", "lang": "sw", "ref": "https://www.google.com/x"}').json()["ok"]
    assert c.post("/api/public/hit", content='{"path": "/report.html", "kind": "quick_report", "country": "uganda"}').json()["ok"]
    assert c.post("/api/public/hit", content='{"path": "/", "kind": "hack"}').status_code == 400
    with Usage(tmp_path / "u.sqlite") as u:
        today = __import__("datetime").date.today().isoformat()
        s = u.summary(today, today)
        assert s["views"] == 3 and s["visitor_days"] == 1 and s["refs"][0]["ref"] == "www.google.com"
        assert s["actions"] == [{"kind": "quick_report", "n": 1}]
        assert not [r for r in u.db.execute("SELECT * FROM hits") if "testclient" in str(tuple(r))]   # no IP stored
    assert c.get("/admin/pilot-report", follow_redirects=False).status_code == 303                    # organisers only
    c.post("/admin/login", data={"key": "k"})
    page = c.get("/admin/pilot-report").text
    assert "pilot report" in page and "Uganda" in page and "Nigeria" in page and "Scorecard" in page



def test_prices_can_be_reported_months_later(tmp_path, monkeypatch):
    monkeypatch.setenv("CIO_DB", str(tmp_path / "b.sqlite"))
    import importlib
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    from reports import Participants, week_of
    c = TestClient(webapp.app)
    body = {"country": "kenya", "item": "cement_50kg", "price": 780, "location": "Nairobi", "area": "capital"}
    assert c.post("/api/public/price", json=dict(body, months_ago=3)).json()["ok"]
    assert c.post("/api/public/price", json=dict(body, months_ago=7)).status_code == 400        # 6 months at most
    assert c.post("/api/public/price", json=dict(body, country="ghana")).status_code == 400    # not live yet
    with Participants(tmp_path / "b.sqlite") as p:
        wk = p.reports("kenya", since_weeks=30)["week"].iloc[0]
        assert wk == week_of(date.today() - timedelta(days=90))



def test_data_checks_have_no_failures():
    """The site's data must be complete and consistent: no broken ranges, missing series or impossible values."""
    sys.path.insert(0, str(ROOT / "src" / "forecast"))
    import data_checks
    res = data_checks.run()
    fails = [f"{r['country']} {r['check']}: {r['detail']}" for r in res if r["status"] == "fail"]
    assert not fails, fails
    assert any(r["check"] == "forecast ranges" for r in res)



def test_contract_index_uses_completed_periods_only():
    sys.path.insert(0, str(ROOT / "src" / "site"))
    import build_index
    from datetime import date as _d
    now = _d.today()
    ym = lambda k: f"{now.year + (now.month - 1 + k) // 12}-{(now.month - 1 + k) % 12 + 1:02d}"
    hist = [ym(k) for k in range(-12, -5)]                                   # official to six months ago
    path = [{"month": ym(k), "median": 0.5 * (k + 6), "lo": 0, "hi": 1} for k in range(-5, 7)]
    c = {"spark": {"dates": hist, "values": [100 + i for i in range(len(hist))]}, "official": True, "step": "month",
         "kind": "structural", "paths": {"ALL": path}, "head": "ALL"}
    rows = build_index.contract_series(c)
    prov = [r for r in rows if r["s"] == "provisional"]
    assert prov and max(r["m"] for r in prov) < ym(0)                         # never the month under way
    assert [r["s"] for r in rows] == ["official"] * len(hist) + ["provisional"] * len(prov)
    assert [r["m"] for r in rows] == sorted(r["m"] for r in rows)


def test_bids_and_contracts_page_has_both_tools():
    t = (ROOT / "public" / "calculator.html").read_text()
    assert "id=boqform" in t and "id=ci-country" in t and "data-bc-pane=bid" in t and "data-bc-pane=adjust" in t
    assert "id=calcform" in t                                                  # quick estimate kept, inside the bid tab
    assert "url=calculator.html#adjust" in (ROOT / "public" / "contract-index.html").read_text()



def test_reported_price_index():
    """A monthly index of what people pay: each person once, 3+ people, two-month pooling, 100 = first month."""
    from reports import Participants
    db = Participants(":memory:")
    today = date.today().replace(day=15)
    for k, price in enumerate([30000, 30000, 31500, 33000]):           # four months ago .. this month
        m = today - timedelta(days=30 * (3 - k))
        for h in ("a", "b", "c"):
            db.add_report(h, "rwanda", "cement_50kg", price + (100 if h == "b" else 0), "Kigali", on=m, area="capital")
    db.add_report("a", "rwanda", "cement_50kg", 99999, "Kigali", on=today)        # same person again: counts once
    rows = db.crowd_index("rwanda", "cement_50kg")
    assert rows[0]["v"] == 100.0 and rows[-1]["v"] > rows[0]["v"] and all(r["people"] >= 3 for r in rows)
    assert [r["m"] for r in rows] == sorted(r["m"] for r in rows)
    assert db.crowd_index("rwanda", "cement_50kg", min_reporters=4) == []          # never from fewer people



def test_pro_waitlist(tmp_path, monkeypatch):
    monkeypatch.setenv("CIO_DB", str(tmp_path / "w.sqlite"))
    monkeypatch.setenv("CIO_ADMIN_KEY", "k")
    monkeypatch.setenv("CIO_SECURE_COOKIES", "0")
    import importlib
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    c = TestClient(webapp.app)
    body = {"email": "QS@Example.com", "org": "Okello QS", "role": "Consultant / quantity surveyor", "country": "uganda", "consent": True}
    assert c.post("/api/public/waitlist", json=dict(body, consent=False)).status_code == 400       # consent required
    assert c.post("/api/public/waitlist", json=dict(body, email="nope")).status_code == 400
    assert c.post("/api/public/waitlist", json=body).json()["ok"] and c.post("/api/public/waitlist", json=body).json()["id"] == 0   # no duplicates
    c.post("/admin/login", data={"key": "k"})
    page = c.get("/admin").text
    assert "qs@example.com" in page and "1 sign-ups" in page
    assert "qs@example.com" not in (ROOT / "public" / "calculator.html").read_text()



def test_every_page_has_valid_data():
    """Every public page's data block must be strict JSON (no NaN or Infinity), or the page script stops."""
    import json
    import re
    pages = [f for f in (ROOT / "public").rglob("*.html") if not f.name.startswith("_")]
    assert pages
    for f in pages:
        m = re.search(r'id=cio-data type=["\']application/json["\']>(.*?)</script>', f.read_text(), re.S)
        if m:
            json.loads(m.group(1).replace("<\\/", "</"), parse_constant=lambda c: (_ for _ in ()).throw(ValueError(f"{f.name}: {c}")))


def test_reported_prices_feed_a_forecast(tmp_path):
    """An item with 12+ months of reported-price index gets its own tested forecast and series."""
    if not (ROOT / "data" / "shared" / "fx_imf_monthly.csv").exists():
        pytest.skip("no driver history")
    import weekly_note
    from reports import Participants
    db = tmp_path / "r.sqlite"
    today = date.today().replace(day=15)
    with Participants(db) as p:
        for k in range(14):
            for h in ("a", "b", "c"):
                p.add_report(h, "rwanda", "cement_50kg", 10000 * (1 + 0.01 * k) + (20 if h == "b" else 0), "Kigali",
                             on=today - timedelta(days=30 * (13 - k)), area="capital")
    weekly_note._DATA.clear()
    weekly_note._reported_item_paths("rwanda", db)
    label = "Cement, 50 kg bag (reported prices)"
    assert label in weekly_note._DATA["paths"] and len(weekly_note._DATA["paths"][label]) == 12
    assert weekly_note._DATA["items"][label]["kind"] == "reported" and weekly_note._DATA["trend_stats"][label]["kind"]
    q = weekly_note._DATA["paths"][label][0]
    assert q["lo"] <= q["median"] <= q["hi"]

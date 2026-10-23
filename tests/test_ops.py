"""
test_ops.py
===========
Self-checks and usage: publishing held on failed data checks, organiser alerts, the robot visitor's static checks,
the usage funnel, and forecasts measured from today. Run: pytest -q
"""
import importlib
import json
import sys
from datetime import date
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
for sub in ("market", "webapp", "ingest", "forecast", "ops"):
    sys.path.insert(0, str(ROOT / "src" / sub))

import cycle                                             # noqa: E402
import site_check                                        # noqa: E402
from usage import Usage                                  # noqa: E402


@pytest.fixture
def live(tmp_path, monkeypatch):
    monkeypatch.setattr(cycle, "CHECKS", tmp_path / "data_checks.json")
    monkeypatch.setattr(cycle, "ALERTS", tmp_path / "organiser_alerts.json")
    monkeypatch.setattr(cycle, "LOG", tmp_path / "cycle_log.csv")
    monkeypatch.setattr(cycle, "PROBLEMS", [])
    ran = []
    monkeypatch.setattr(cycle, "run", lambda step, *a, **k: ran.append(step) or "")
    return tmp_path, ran


def test_site_is_held_when_a_data_check_fails(live):
    tmp, ran = live
    (tmp / "data_checks.json").write_text(json.dumps({"checks": [{"country": "uganda", "check": "official data", "status": "warn", "detail": ""}]}))
    cycle.publish("site")
    assert ran == ["site"] and cycle.PROBLEMS == []                              # warnings do not hold the site
    (tmp / "data_checks.json").write_text(json.dumps({"checks": [{"country": "kenya", "check": "contract index", "status": "fail", "detail": "gap"}]}))
    cycle.publish("site")
    assert ran == ["site"] and cycle.PROBLEMS[0].startswith("site held: 1 data check(s) failed")   # last good site kept


def test_organiser_is_told_once_a_day(live, monkeypatch):
    tmp, _ = live
    sent = []

    class FakeSMTP:
        def __init__(self, *a, **k): pass
        def __enter__(self): return self
        def __exit__(self, *a): pass
        def starttls(self): pass
        def login(self, *a): pass
        def send_message(self, m): sent.append(m["Subject"])
    import smtplib
    monkeypatch.setattr(smtplib, "SMTP", FakeSMTP)
    monkeypatch.setenv("CIO_ORGANISER_EMAIL", "me@example.com")
    monkeypatch.setenv("CIO_SMTP_HOST", "smtp.example.com")
    cycle.notify("refresh")
    assert not (tmp / "organiser_alerts.json").exists()                          # nothing wrong: nothing written
    cycle.PROBLEMS.append("drivers")
    cycle.notify("refresh")
    cycle.notify("refresh")                                                      # same problem 3 hours later
    state = json.loads((tmp / "organiser_alerts.json").read_text())
    assert len(state["alerts"]) == 2 and sent == ["CiO Costs: 1 problem(s) in the refresh run"]   # listed twice, emailed once


def test_robot_static_checks(tmp_path, monkeypatch):
    pub = tmp_path / "public"
    (pub / "countries" / "uganda" / "notes").mkdir(parents=True)
    (pub / "index.html").write_text("<a href='calculator.html?c=uganda#bid'>x</a><a href='https://x.org'>y</a><a href='#top'>z</a>")
    (pub / "calculator.html").write_text("<a href='index.html'>home</a>")
    (pub / "countries" / "uganda" / "notes" / "n.html").write_text("<a href='../../calculator.html'>bad</a><a href='../../../calculator.html'>good</a>")
    monkeypatch.setattr(site_check, "PUB", pub)
    assert site_check.link_problems() == ["countries/uganda/notes/n.html → ../../calculator.html"]
    keys = site_check.i18n_keys()
    assert "lp.cta" in keys["en"] and keys["en"] - keys["sw"] == set() and keys["en"] - keys["fr"] == set()   # all translated
    t = site_check.visible_text("<script>var a = {when}; NaN</script><p>About +2.6% by Jan 2027</p>")
    assert "NaN" not in t and "{when}" not in t and "2.6%" in t                  # script contents are not "seen"


def test_usage_funnel_and_returning():
    u = Usage(":memory:")
    for v, ret in (("a", 0), ("b", 1), ("c", 1)):
        u.record("/", "view", v, ret=ret)
    u.record("/countries/uganda/", "view", "a")
    u.record("/", "country", "b", country="kenya")
    u.record("/report.html", "view", "a")
    u.record("/report.html", "price", "a", country="uganda")
    today = date.today().isoformat()
    r = u.usage_report(today, today)
    steps = dict(r["funnel"])
    assert steps["Visited the site"] == 3 and steps["Looked at a forecast"] == 3 and steps["Used a tool"] == 1
    assert steps["Opened Report a price"] == 1 and steps["Reported a price"] == 1
    assert r["returning"] == pytest.approx(2 / 3)                                # views without the flag are not counted


def test_admin_usage_and_health_pages(tmp_path, monkeypatch):
    monkeypatch.setenv("CIO_DB", str(tmp_path / "u.sqlite"))
    monkeypatch.setenv("CIO_ADMIN_KEY", "k")
    monkeypatch.setenv("CIO_SECURE_COOKIES", "0")
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    c = TestClient(webapp.app)
    assert c.post("/api/public/hit", json={"path": "/", "kind": "view", "ret": 1}).json()["ok"]
    c.post("/api/public/hit", json={"path": "/", "kind": "view"}, headers={"user-agent": "Mozilla/5.0 HeadlessChrome/120"})
    assert webapp.usage().usage_report(date.today().isoformat(), date.today().isoformat())["views"] == 1   # robots not counted
    assert c.get("/admin/usage", follow_redirects=False).status_code == 303          # organiser only
    c.post("/admin/login", data={"key": "k"})
    page = c.get("/admin/usage?days=7").text
    assert "How far visits get" in page and "Visited the site" in page and "100%" in page
    admin = c.get("/admin").text
    t = date.today()
    prev = f"{(t.year * 12 + t.month - 2) // 12}-{(t.month - 2) % 12 + 1:02d}"
    assert "Health" in admin and f"month={prev}" in admin                         # last month is listed (no gaps)


def test_alerts_measure_from_today(tmp_path, monkeypatch):
    import alerts
    now = date.today().strftime("%Y-%m")
    out = tmp_path / "countries" / "uganda" / "outputs"
    out.mkdir(parents=True)
    path = [{"month": now, "median": 3.0}, {"month": "2099-01", "median": 9.0}]
    (out / "forecast_latest.json").write_text(json.dumps({"paths": {"Overall": path}}))
    monkeypatch.setattr(alerts, "ROOT", tmp_path)
    x, _ = alerts.expected_3m("uganda", "Overall")
    assert x == pytest.approx(0.0)              # 3% already reached by today's level: no further change before 2099


def test_reports_held_for_review(tmp_path, monkeypatch):
    """Sent from another country, or far from what others nearby pay: saved, counted nowhere until released."""
    monkeypatch.setenv("CIO_DB", str(tmp_path / "h.sqlite"))
    monkeypatch.setenv("CIO_ADMIN_KEY", "k")
    monkeypatch.setenv("CIO_SECURE_COOKIES", "0")
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    from reports import Participants
    c = TestClient(webapp.app)
    towns = webapp.TOWNS["uganda"]["towns"]
    with Participants(tmp_path / "h.sqlite") as p:
        with pytest.raises(Exception):
            p.add_report("x", "uganda", "cement_50kg", 35000, "Nairobi", town_list=towns)        # not a Ugandan town
        p.add_report("x", "uganda", "cement_50kg", 35000, "Jinja", town_list=towns)
        assert p.reports("uganda").iloc[0]["area"] == "other"                                   # area follows the town
        for h, v in (("a", 35000), ("b", 36000), ("c", 34000)):
            p.add_report(h, "uganda", "cement_50kg", v, "Kampala", town_list=towns)
        assert p.far_from_others("uganda", "cement_50kg", 90000, "Kampala", "z").startswith("far from others: typical 35,000 in Kampala")
        assert p.far_from_others("uganda", "cement_50kg", 40000, "Kampala", "z") is None
    body = {"country": "uganda", "item": "cement_50kg", "price": 36000, "location": "Kampala"}
    assert not c.post("/api/public/price", json=body, headers={"cf-ipcountry": "UG"}).json()["held"]
    r = c.post("/api/public/price", json=dict(body, location="elsewhere"), headers={"cf-ipcountry": "GB"}).json()
    assert r["ok"] and r["held"]                                                                 # sent from the UK
    p = webapp.people()
    held = p.held_reports()
    assert len(held) == 1 and held[0]["held"] == "sent from another country: GB" and held[0]["seen_from"] == "GB"
    assert len(p.reports("uganda")) == 5                                                         # the held one is not counted
    c.post("/admin/login", data={"key": "k"})
    assert "sent from another country: GB" in c.get("/admin").text
    c.post(f"/admin/report/{held[0]['id']}", data={"decision": "count"})
    assert p.held_reports() == [] and len(p.reports("uganda")) == 6                             # released: now it counts

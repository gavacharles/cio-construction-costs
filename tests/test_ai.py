"""
test_ai.py
==========
The assistant (src/ai/): data scout and contract reader. Claude is replaced by a fake client, so these tests
cost nothing and need no key; they test what the code checks and decides, not what the model says. Run: pytest -q
"""
import importlib
import sys
from pathlib import Path
from types import SimpleNamespace as NS

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
for sub in ("market", "webapp", "ingest", "forecast", "ai"):
    sys.path.insert(0, str(ROOT / "src" / sub))

import claude                                            # noqa: E402
import contract_reader                                   # noqa: E402
import scout                                             # noqa: E402
from reports import Participants                         # noqa: E402

CFG = {"office": "RURA", "sites": ["rura.rw"], "unit": "RWF per litre", "where": "Kigali", "how_often": "every two months",
       "items": {"diesel": "diesel", "petrol": "petrol"}}
URL = "https://www.rura.rw/fileadmin/notice.pdf"
NOTICE = "COMMUNIQUE  The maximum pump prices in Kigali are:\n  Diesel   2,205 Frw/litre\n  Petrol 2,303 Frw/litre"


def usage(i=1000, o=200):
    return NS(input_tokens=i, output_tokens=o, cache_creation_input_tokens=0, cache_read_input_tokens=0,
              server_tool_use=NS(web_search_requests=1))


def call(name, inp, i):
    return NS(type="tool_use", name=name, input=inp, id=f"t{i}")


class FakeClient:
    """Answers each create() with the next scripted response and keeps the requests."""
    def __init__(self, responses):
        self.responses, self.requests = list(responses), []
        self.beta = NS(messages=NS(create=self._create))

    def _create(self, **kw):
        self.requests.append(kw)
        return self.responses.pop(0)


@pytest.fixture
def files(tmp_path, monkeypatch):
    off, cur = tmp_path / "official.csv", tmp_path / "curated.csv"
    pd.DataFrame([{"country": "rwanda", "item": "diesel", "month": "2026-02", "price": 1800.0, "unit": "RWF per litre",
                   "source": URL, "verified": "typed from the official notice"},
                  {"country": "zambia", "item": "diesel", "month": "2026-02", "price": 27.5, "unit": "ZMW per litre",
                   "source": "erb", "verified": "next notice agrees"}]).to_csv(off, index=False)
    pd.DataFrame([{"country": "rwanda", "item": "diesel", "month": "2026-02", "price": 1800.0, "unit": "RWF per litre",
                   "source": URL}]).to_csv(cur, index=False)
    monkeypatch.setattr(scout, "OFFICIAL", off)
    monkeypatch.setattr(scout, "CURATED", cur)
    import official_prices
    monkeypatch.setattr(official_prices, "OUT", off)
    monkeypatch.setattr(official_prices, "CURATED", cur)
    return off, cur


def test_scout_keeps_only_prices_it_can_check(files):
    have = scout.known("rwanda")
    fetch = lambda url: NOTICE
    p = {"item": "diesel", "month": "2026-04", "price": 2205.0, "source_url": URL, "quote": "Diesel 2,205 Frw/litre"}
    keep, notes = scout.check(p, CFG, have, fetch)
    assert keep and notes == ["quote found in the notice"]                      # 1800 -> 2205: +22.5%, not flagged
    _, n = scout.check(dict(p, price=3000.0, quote="Diesel 3,000"), CFG, have, lambda url: "Diesel 3,000 Frw")
    assert any("big change: +67%" in x for x in n)
    assert scout.check(dict(p, source_url="https://example.com/x.pdf"), CFG, have, fetch) == (False, ["not on an allowed site"])
    assert scout.check(dict(p, price=2250.0), CFG, have, fetch) == (False, ["the price is not in the quote"])
    assert not scout.check(dict(p, month="2026-02", price=1800.0, quote="Diesel 1800"), CFG, have, fetch)[0]   # already have it
    _, n = scout.check(dict(p, quote="Diesel costs 2205 now"), CFG, have, fetch)
    assert "NOT found" in n[0]                                                   # a quote the notice does not contain
    _, n = scout.check(p, CFG, have, lambda url: None)
    assert "could not open" in n[0]


def test_scout_agent_loop_records_checked_proposals(files):
    db = Participants(":memory:")
    fake = FakeClient([
        NS(stop_reason="pause_turn", usage=usage(), content=[NS(type="text", text="searching")]),
        NS(stop_reason="tool_use", usage=usage(), content=[
            call("propose_price", {"item": "diesel", "month": "2026-04", "price": 2205, "source_url": URL, "quote": "Diesel 2,205 Frw/litre"}, 1),
            call("propose_price", {"item": "petrol", "month": "2026-04", "price": 9999, "source_url": URL, "quote": "Petrol 2,303 Frw/litre"}, 2),
            call("propose_price", {"item": "petrol", "month": "April", "price": 2303, "source_url": URL, "quote": "Petrol 2,303"}, 3)]),
        NS(stop_reason="tool_use", usage=usage(), content=[call("finish", {"note": "April found; earlier notices not online"}, 4)]),
    ])
    out = scout.run_country("rwanda", CFG, db, cl=fake, fetch=lambda url: NOTICE)
    assert out["proposed"] == 1 and out["dropped"] == 1 and out["note"].startswith("April found")
    rows = db.proposals()
    assert len(rows) == 1 and rows[0]["price"] == 2205 and rows[0]["checks"].startswith("quote found")
    results = [r for m in fake.requests[-1]["messages"] if m["role"] == "user" and isinstance(m["content"], list)
               for r in m["content"]]                                            # what the model was told back
    assert any(r.get("is_error") for r in results) and any("not recorded" in r["content"] for r in results)
    req = fake.requests[0]
    assert req["model"] == claude.MODEL and req["fallbacks"] == "default"
    assert all(t.get("allowed_domains", ["rura.rw"]) == ["rura.rw"] for t in req["tools"])
    assert db.ai_spend() > 0


def test_scout_due_and_approval(files, tmp_path):
    off, cur = files
    from datetime import date
    assert scout.due("rwanda", CFG, {}, date(2026, 4, 10))
    assert not scout.due("rwanda", CFG, {"rwanda": "2026-04-08"}, date(2026, 4, 10))       # looked at this week
    p = {"country": "rwanda", "item": "diesel", "month": "2026-04", "price": 2205.0, "unit": "RWF per litre", "source": URL}
    scout.approve_to_curated(p)
    import official_prices
    official_prices.merge_curated()
    o = pd.read_csv(off)
    assert ((o.country == "zambia") & (o.verified == "next notice agrees")).sum() == 1          # automatic rows kept
    row = o[(o.country == "rwanda") & (o.month == "2026-04")].iloc[0]
    assert row.price == 2205 and "data scout" in row.verified
    assert (o[(o.country == "rwanda") & (o.month == "2026-02")].verified == "typed from the official notice").all()


def test_contract_reader_checks_the_answer():
    pages = ["Contract Data\nBase Date: 28 days before the latest date for submission of the Tender, 1 March 2025",
             "Schedule of cost indexation\na  Fixed 0.15\nb  Cement 0.30  UBOS CIPI cement\nc  Labour 0.55 UBOS CIPI labour"]
    out = contract_reader.review({
        "found": True, "note": "", "base_date": "2025-03-01", "base_date_quote": "1 March 2025", "base_date_page": 1,
        "currency": "UGX", "fixed_coef": 0.15, "fixed_quote": "a Fixed 0.15", "fixed_page": 2,
        "elements": [{"label": "Cement", "coef": 0.30, "index_named": "UBOS CIPI cement", "source": "mat:Cement", "quote": "b Cement 0.30", "page": 2},
                     {"label": "Labour", "coef": 0.55, "index_named": "UBOS", "source": "made-up", "quote": "Labour 0.50", "page": 2}]},
        pages, ["overall", "mat:Cement"])
    assert out["base_date_check"] == "found on page 1" and out["fixed_check"] == "found on page 2"
    assert out["elements"][0]["check"] == "found on page 2" and out["elements"][1]["source"] == "manual"   # unknown index -> manual
    assert "not found" in out["elements"][1]["check"]                         # the quote says 0.50: not in the document
    assert out["sum_ok"] and out["sum"] == 1.0
    bad = contract_reader.review({"found": True, "note": "", "base_date": "2025-02-30", "base_date_quote": "", "base_date_page": None,
                                  "currency": None, "fixed_coef": 0.2, "fixed_quote": "", "fixed_page": None,
                                  "elements": [{"label": "x", "coef": 0.5, "index_named": "", "source": "overall", "quote": "", "page": None}]},
                                 pages, ["overall"])
    assert bad["base_date"] is None and not bad["sum_ok"]
    with pytest.raises(contract_reader.ReadError):
        contract_reader.read(b"not a pdf", "uganda", {})


def test_contract_endpoint_limits(tmp_path, monkeypatch):
    monkeypatch.setenv("CIO_DB", str(tmp_path / "c.sqlite"))
    monkeypatch.setenv("CIO_ADMIN_KEY", "k")
    monkeypatch.setenv("CIO_SECURE_COOKIES", "0")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)
    import app as webapp
    importlib.reload(webapp)
    from fastapi.testclient import TestClient
    c = TestClient(webapp.app)
    up = lambda **kw: c.post("/api/pro/contract", files={"file": ("c.pdf", b"%PDF-1.4 x", "application/pdf")},
                             data={"country": "uganda", "options": '{"overall": "Overall"}', **kw})
    r = up()
    assert r.status_code == 503 and "not switched on" in r.json()["error"]          # no key: says so, calls nothing
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test")
    seen = []
    monkeypatch.setattr(webapp.contract_reader, "read", lambda pdf, country, opts: (seen.append(opts) or {"found": True, "elements": []}, 0.05))
    assert up().json()["ok"] and seen[0] == {"overall": "Overall"}
    assert up().status_code == 429                                               # one free reading a day
    assert up(code="PRO-NOPE").json()["error"] == "That Pro code is not valid."
    code = webapp.people().issue_pro_code("qs@example.com")
    assert up(code=code).json()["pro"]
    c.post("/admin/login", data={"key": "k"})
    assert "Data scout" in c.get("/admin").text

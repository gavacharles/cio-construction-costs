"""
test_market_agent.py
====================
The market agent (src/ai/market_agent.py). Claude is replaced by a scripted fake, so these tests cost nothing and need
no key; they test what the code checks, queues and applies, not what the model says. Run: pytest -q
"""
import json
import sys
from pathlib import Path
from types import SimpleNamespace as NS

import pandas as pd
import pytest
import yaml

ROOT = Path(__file__).resolve().parents[1]
for sub in ("market", "ai", "forecast"):
    sys.path.insert(0, str(ROOT / "src" / sub))

import market_agent as ma                                # noqa: E402

CFG = {"sites": ["monitor.co.ug", "ura.go.ug"], "currency": "UGX", "where": "Kampala"}
ITEMS = ["diesel", "petrol", "cement"]
URL = "https://www.monitor.co.ug/uganda/news/fuel-prices"
PAGE = "Fuel prices: diesel now sells at between Shs6,700 and Shs7,300 per litre in Kampala, up from Shs5,200 in April."
TAX = "https://www.ura.go.ug/excise-notice"
TAXPAGE = "Excise duty on diesel rises by Shs100 per litre from July 2026 under the Excise Duty (Amendment) Act."


def usage():
    return NS(input_tokens=1000, output_tokens=200, cache_creation_input_tokens=0, cache_read_input_tokens=0,
              server_tool_use=NS(web_search_requests=1))


def call(name, inp, i):
    return NS(type="tool_use", name=name, input=inp, id=f"t{i}")


class FakeClient:
    def __init__(self, responses):
        self.responses, self.requests = list(responses), []
        self.beta = NS(messages=NS(create=self._create))

    def _create(self, **kw):
        self.requests.append(kw)
        return self.responses.pop(0)


def fetch(url):
    return {URL: PAGE, TAX: TAXPAGE}.get(url)


@pytest.fixture
def tmp(tmp_path, monkeypatch):
    monkeypatch.setattr(ma, "DB", tmp_path / "x.sqlite")
    monkeypatch.setattr(ma, "OBSERVED", tmp_path / "observed.csv")
    monkeypatch.setattr(ma, "NOTES", tmp_path / "notes.json")
    monkeypatch.setattr(ma, "ROOT", tmp_path)
    (tmp_path / "countries" / "uganda").mkdir(parents=True)
    (tmp_path / "countries" / "uganda" / "policy_events.yaml").write_text("# Known policy measures\nevents: []\n")
    return tmp_path


def test_verify_keeps_only_what_it_can_check(tmp):
    ok, notes = ma.verify("observed_price", dict(country="uganda", item="diesel", month="2026-10", price_low=6700, price_high=7300,
                                                 unit="UGX per litre", source_url=URL, quote="between Shs6,700 and Shs7,300 per litre"), CFG, fetch)
    assert ok and notes[0] == "quote found on the page"
    ok, notes = ma.verify("observed_price", dict(country="uganda", item="diesel", month="2026-10", price_low=6700, price_high=7400,
                                                 unit="UGX", source_url=URL, quote="between Shs6,700 and Shs7,300 per litre"), CFG, fetch)
    assert not ok and "7400 is not in the quote" in notes[0]
    ok, notes = ma.verify("observed_price", dict(country="uganda", item="diesel", month="2026-10", price_low=6700, price_high=7300,
                                                 unit="UGX", source_url="https://blog.example.com/x", quote="6,700 and 7,300"), CFG, fetch)
    assert not ok and notes == ["not on an allowed site"]


def test_agent_loop_queues_checked_proposals(tmp, monkeypatch):
    monkeypatch.setattr(ma.claude, "create", lambda cl, **kw: cl.beta.messages.create(**kw))
    good = dict(item="diesel", month="2026-10", price_low=6700, price_high=7300, unit="UGX per litre (pump, Kampala)",
                source_url=URL, quote="between Shs6,700 and Shs7,300 per litre")
    bad = {**good, "source_url": "https://rumours.example.com/x"}
    ev = dict(date="2026-07", measure="Diesel excise +Shs100/litre", items=["diesel"], pct=None, status="enacted",
              source_url=TAX, quote="Excise duty on diesel rises by Shs100 per litre from July 2026")
    ex = dict(text="Oil spiked in October and the shilling weakened, so pump prices rose about a third on April.",
              source_url=URL, quote="up from Shs5,200 in April")
    cl = FakeClient([NS(stop_reason="tool_use", usage=usage(), content=[call("observed_price", good, 1), call("observed_price", bad, 2),
                                                                       call("policy_event", ev, 3), call("explain", ex, 4)]),
                     NS(stop_reason="tool_use", usage=usage(), content=[call("finish", {"note": "done"}, 5)])])
    out = ma.run_country("uganda", CFG, ITEMS, {"flags": ["Oil has moved -23% in 4 weeks"]}, cl=cl, fetch=fetch)
    assert out["proposed"] == 3 and out["dropped"] == 1 and out["note"] == "done"
    kinds = sorted(p["kind"] for p in ma.pending())
    assert kinds == ["explanation", "observed_price", "policy_event"]
    expl = next(p for p in ma.pending() if p["kind"] == "explanation")
    ma.decide(expl["id"], True)                          # an explanation found by the loop is applied on approval
    assert json.loads((tmp / "notes.json").read_text())["uganda"]["text"].startswith("Oil spiked")
    # the same proposal again is not queued twice
    cl2 = FakeClient([NS(stop_reason="tool_use", usage=usage(), content=[call("observed_price", good, 1), call("finish", {"note": ""}, 2)])])
    assert ma.run_country("uganda", CFG, ITEMS, {}, cl=cl2, fetch=fetch)["proposed"] == 0


def test_approving_applies_and_rejecting_does_not(tmp, monkeypatch):
    c = ma.db()
    ma.add(c, "uganda", "observed_price", dict(item="diesel", month="2026-10", price_low=6700, price_high=7300, unit="UGX per litre"),
           URL, "q", "quote found on the page")
    ma.add(c, "uganda", "policy_event", dict(date="2026-07", measure="Diesel excise +Shs100/litre", items=["diesel"], pct=None,
                                            status="enacted"), TAX, "q", "quote found on the page")
    ma.add(c, "uganda", "explanation", dict(text="Prices rose with October's oil spike."), URL, "q", "quote found on the page")
    ma.add(c, "uganda", "observed_price", dict(item="petrol", month="2026-10", price_low=6000, price_high=6000, unit="UGX per litre"),
           URL, "q", "")
    ids = {(p["kind"], p["payload"].get("item")): p["id"] for p in ma.pending(c)}
    ma.decide(ids[("observed_price", "diesel")], True, c)
    ma.decide(ids[("policy_event", None)], True, c)
    ma.decide(ids[("explanation", None)], True, c)
    ma.decide(ids[("observed_price", "petrol")], False, c)
    obs = pd.read_csv(tmp / "observed.csv")
    assert list(obs.item) == ["diesel"] and obs.price_high.iloc[0] == 7300
    ev = yaml.safe_load((tmp / "countries" / "uganda" / "policy_events.yaml").read_text())["events"]
    assert ev[-1]["status"] == "enacted" and ev[-1]["match"] == ["diesel"]
    assert (tmp / "countries" / "uganda" / "policy_events.yaml").read_text().startswith("# Known policy measures")
    assert json.loads((tmp / "notes.json").read_text())["uganda"]["text"].startswith("Prices rose")
    assert ma.pending(c) == []

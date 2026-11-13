#!/usr/bin/env python3
"""
cycle.py — the automated operating cycle (run from cron; see deploy/crontab.example).

    python src/market/cycle.py daily    # harvest UBOS, KNBS, Stats SA and the BLS benchmark; refit on a new release
    python src/market/cycle.py weekly   # refresh weekly drivers + rainfall, write the weekly notes
    python src/market/cycle.py refresh  # every few hours: latest oil/FX -> forecasts -> site pages
    python src/market/cycle.py monthly  # 1st of the month: pilot report

Both are idempotent: running twice does nothing new. Every step is logged to
data/live/cycle_log.csv; a failing step is logged and the rest still run.

Self-checks:
  - The site is published only when the data checks have no failure; otherwise the last good site stays up
    ("held"), so a broken source or model never reaches the public.
  - When a job has failed steps, held publishing or a failed site check, the organiser is told: a list in /admin
    (data/live/organiser_alerts.json) and an email to CIO_ORGANISER_EMAIL when SMTP is set (CIO_SMTP_* in cio.env).
    The same problem is emailed once a day, not every 3 hours.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOG = ROOT / "data" / "live" / "cycle_log.csv"
CHECKS = ROOT / "data" / "live" / "data_checks.json"
ALERTS = ROOT / "data" / "live" / "organiser_alerts.json"
PY = sys.executable
PROBLEMS: list[str] = []                         # this job's failed steps and held publishing


def _contract_countries() -> list[str]:
    sys.path.insert(0, str(ROOT / "src" / "market"))
    from country import load_country, list_countries
    return [c for c in list_countries() if load_country(c)["markets"]]


COUNTRIES = _contract_countries()               # countries with settled contracts


def log(step: str, status: str, detail: str = "") -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    new = not LOG.exists()
    with open(LOG, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(["utc", "step", "status", "detail"])
        w.writerow([datetime.now(timezone.utc).isoformat(timespec="seconds"), step, status, detail[:500]])
    print(f"[{status}] {step} {detail[:200]}")


def run(step: str, *args: str, db: str | None = None) -> str:
    cmd = [PY, "-W", "ignore", *args] + (["--db", db] if db else [])
    try:
        out = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=3600, check=True).stdout
        log(step, "ok", out.strip().splitlines()[-1] if out.strip() else "")
        return out
    except subprocess.CalledProcessError as err:
        PROBLEMS.append(step)
        log(step, "failed", (err.stderr or err.stdout or "").strip().splitlines()[-1:][0] if (err.stderr or err.stdout) else "")
    except Exception:
        PROBLEMS.append(step)
        log(step, "failed", traceback.format_exc().splitlines()[-1])
    return ""


def failed_checks() -> list[dict]:
    try:
        return [r for r in json.loads(CHECKS.read_text())["checks"] if r["status"] == "fail"]
    except (OSError, ValueError, KeyError):
        return []


def publish(step: str = "site") -> None:
    """Build the public site only when the data checks pass; otherwise keep the last good site."""
    fails = failed_checks()
    if fails:
        detail = "; ".join(f"{r['country']} {r['check']}: {r['detail']}" for r in fails)[:400]
        PROBLEMS.append(f"{step} held: {len(fails)} data check(s) failed — {detail}")
        log(step, "held", f"{len(fails)} failed data checks; last good site kept")
        return
    run(step, "src/site/build_index.py")


def notify(job: str) -> None:
    """Tell the organiser about this job's problems: /admin list always, email once a day per problem set."""
    now = datetime.now(timezone.utc)
    try:
        state = json.loads(ALERTS.read_text())
    except (OSError, ValueError):
        state = {"alerts": [], "emailed": {}}
    if not PROBLEMS:
        return
    key = job + ":" + "|".join(sorted(p.split(":")[0] for p in PROBLEMS))
    state["alerts"] = ([{"utc": now.isoformat(timespec="seconds"), "job": job, "problems": PROBLEMS}] + state["alerts"])[:50]
    last = state["emailed"].get(key)
    to, host = os.environ.get("CIO_ORGANISER_EMAIL"), os.environ.get("CIO_SMTP_HOST")
    if to and host and (not last or (now - datetime.fromisoformat(last)).total_seconds() > 86400):
        try:
            import smtplib
            from email.message import EmailMessage
            msg = EmailMessage()
            msg["Subject"] = f"CiO Costs: {len(PROBLEMS)} problem(s) in the {job} run"
            msg["From"] = os.environ.get("CIO_SMTP_FROM", os.environ.get("CIO_SMTP_USER", ""))
            msg["To"] = to
            msg.set_content("The automatic run found problems:\n\n" + "\n".join(f"- {p}" for p in PROBLEMS)
                            + "\n\nDetails: data/live/cycle_log.csv and /admin. This email repeats at most once a day.")
            with smtplib.SMTP(host, int(os.environ.get("CIO_SMTP_PORT", "587")), timeout=30) as smtp:
                smtp.starttls()
                if os.environ.get("CIO_SMTP_USER"):
                    smtp.login(os.environ["CIO_SMTP_USER"], os.environ.get("CIO_SMTP_PASS", ""))
                smtp.send_message(msg)
            state["emailed"][key] = now.isoformat(timespec="seconds")
            log("notify organiser", "ok", f"emailed {to}")
        except Exception as err:
            log("notify organiser", "failed", str(err))
    ALERTS.parent.mkdir(parents=True, exist_ok=True)
    ALERTS.write_text(json.dumps(state, indent=1), encoding="utf-8")


def latest_release_month(country: str) -> str:
    sys.path.insert(0, str(ROOT / "src" / "market"))
    from country import load_country
    from settlement import load_releases
    return str(load_releases(load_country(country)).release_month.max().date())


def daily(db: str | None) -> None:
    before = {c: latest_release_month(c) for c in COUNTRIES}
    run("harvest UBOS", "src/ingest/pull_ubos_cipi.py", "--out", "countries/uganda/raw/downloads")
    run("harvest KNBS", "src/ingest/pull_knbs_cipi.py")
    run("KNBS scanned releases (OCR, verified)", "src/ingest/knbs_ocr.py")
    run("harvest Stats SA", "src/ingest/statssa_p01511.py", "pull")
    run("harvest benchmarks", "src/ingest/pull_benchmarks.py")
    run("world commodity prices", "src/ingest/build_commodities.py")
    run("official item prices (ERB pump prices, curated notices)", "src/ingest/official_prices.py")
    run("data scout (official prices for review; off without ANTHROPIC_API_KEY)", "src/ai/scout.py")
    run("site check (robot visitor: every page in every language)", "src/ops/site_check.py")
    for c in COUNTRIES:
        after = latest_release_month(c)
        if after != before[c]:
            log(f"new release {c}", "ok", f"{before[c]} -> {after}")
            if c == "uganda":
                run("forecast backtest", "src/forecast/run_forecast.py", "backtest")
                run("forecast", "src/forecast/run_forecast.py", "forecast")


def refresh(db: str | None) -> None:
    """Every few hours: latest oil and exchange rates -> every country's forecast -> site pages.
    Takes seconds; the forecasts move as the outlook moves. Notes stay weekly."""
    run("drivers", "src/ingest/build_weekly_drivers.py")
    run("forecasts", "src/forecast/weekly_note.py", "--country", "all", "--no-fetch", "--data-only", db=db)
    run("data checks", "src/forecast/data_checks.py")       # exits 1 on a failed check: counted as a problem
    publish("site")
    run("alerts", "src/market/alerts.py", db=db)
    run("send alerts", "src/market/send_alerts.py", "--send")       # sends only channels configured in cio.env


def weekly(db: str | None) -> None:
    run("rainfall", "src/ingest/build_rainfall_block.py")
    run("fx history", "src/ingest/build_fx_history.py")
    run("weekly notes", "src/forecast/weekly_note.py", "--country", "all", db=db)
    run("market link", "src/ops/market_link.py", "--push")     # cost signal out, site weather in (gavacharles/kampala-heat-atlas)
    run("data checks", "src/forecast/data_checks.py")
    publish("front page")


def monthly(db: str | None) -> None:
    """On the 1st: the pilot report for the month that just ended."""
    from datetime import date, timedelta
    last = (date.today().replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
    run("pilot report", "src/market/pilot_report.py", "--month", last, db=db)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("job", choices=["daily", "weekly", "refresh", "monthly"])
    ap.add_argument("--db", default=os.environ.get("CIO_DB"),
                    help="ledger path (default: $CIO_DB, the app's database; else data/live/exchange.sqlite)")
    a = ap.parse_args()
    {"daily": daily, "weekly": weekly, "refresh": refresh, "monthly": monthly}[a.job](a.db)
    notify(a.job)

# Running the pilot: app, weekly note, monthly cycle, countries

## Forecaster, market, price reports: what each is for

| Piece | Answers | Knows | Speed |
|---|---|---|---|
| **Forecaster** (`src/forecast/`) | What should prices do, given public data? | Official indices, oil, exchange rates, CPI, rainfall, spending, tax measures | Updated weekly; official data arrives 1–3 months late |
| **Price reports** (`src/market/reports.py`) | What are people actually paying this week? | Participants' quotes and invoices | Weekly, in shillings per bag/bar/litre |
| **Market** (`src/market/`) | What do informed people expect the next official print to be? | Everything participants know, including what no dataset shows | Continuous until trading closes |

The forecaster is the base and the market opens at its prices. Participants move prices only when they
know something the model doesn't, so **the gap between crowd and model is the signal**. Over a few
rounds the record shows whose information beats the model, and by how much.

**Do you need the market?** Not on day one. The most useful products for contractors are the
**weekly note** and the **crowd price reports**. They need no regulator and work with a handful of
participants. The market adds value once 20–30 active participants trade, and it is the step toward
hedging contracts later. Run all three and judge the market on its record after 3–4 settled rounds.

## Participant app (`src/webapp/app.py`)

```bash
pip install -r requirements.txt
CIO_ADMIN_KEY=<secret> uvicorn --app-dir src/webapp app:app --host 0.0.0.0 --port 8000
```

- **Organiser:** open `/admin?key=<secret>`, create an invite code per person (name, organisation,
  country), and send it to them. Codes can be redeemed again on a new phone; the old login stops.
- **Participants:** enter the code, then:
  - **Contracts:** open contracts for their country, crowd vs model, trade with a live cost quote.
  - **Report prices:** the item, the price paid or quoted, and where. Medians of each person's
    reports, so repeated or wild reports can't move the series.
  - **Weekly note** and **Leaderboard**.
- **Storage:** one sqlite file, `data/live/exchange.sqlite` (git-ignored). Back it up daily.
- **Hosting:** any small Linux VM, behind HTTPS (e.g. Caddy or nginx), with the crontab below.
  Phones are the main client; the pages are built for 360-px screens.

## Automation (`src/market/cycle.py`, `deploy/crontab.example`)

| Job | When | What |
|---|---|---|
| `cycle.py daily` | 06:30 every day | Harvest UBOS and KNBS → settle any contract whose first print appeared → on a new UBOS release refit and re-forecast → open the next contracts. Idempotent |
| `cycle.py weekly` | Monday 05:00 | Refresh rainfall, Brent and UGX/KES/RWF → write `countries/<country>/notes/weekly_<date>.{md,html}` (the app shows the latest) |
| `cycle.py refresh` | every 3 hours | Drivers → forecasts → site → alerts; also saves each forecast to `data/live/forecast_log/` for the track record |
| `cycle.py monthly` | 1st of the month, 07:00 | Pilot report for the month just ended → `data/live/reports/pilot_<month>.html` (also at `/admin/pilot-report?month=YYYY-MM`) |

Every step is logged to `data/live/cycle_log.csv`. A failed step is logged and the others still run.

## Weekly notes (`src/forecast/weekly_note.py`) — one per country, every Monday

| Country | What the note forecasts | Evidence |
|---|---|---|
| Uganda | Overall index and key materials for this month and +3 months; structural model conditioned on Brent and UGX since the last UBOS release | Monthly backtest, docs/FORECAST_MODEL.md |
| Kenya | KNBS overall, building and civil indices for the next two quarterly prints (`quarterly_model.py`: shilling and Brent in shillings, ridge-shrunk, conditioned on observed months) | Walk-forward, 12–13 quarters: two quarters ahead 0.86–0.93 of trend's error; one quarter ahead about equal. It lost for cement and labour, so single materials show the latest KNBS readings only. Bands come from the model's own past errors |
| Rwanda | No forecast (no official index): RWF, Brent in RWF, crowd prices, and Uganda's oil-to-diesel pass-through as a labelled reference | – |

`python src/forecast/weekly_note.py --country all` writes `countries/<country>/notes/weekly_<country>_<date>.{md,html}`;
the app shows each participant their own country's note. Exchange-rate history comes from the IMF
(`build_fx_history.py`, monthly, from 2015), spliced with weekly snapshots.

### Uganda note detail

The note works between official releases. It refits the structural model at the last UBOS release
and **conditions on the Brent and UGX/USD readings observed since then**
(`model.known_primitives`, from `build_weekly_drivers.py`). In the first note (22 Oct 2026):

- The shilling had weakened 13% in 13 weeks, and Brent was up 35% over the same period.
- That raised the expected January 2027 change in the overall index from +4.1% (no new data) to
  +5.6%, in diesel from +14% to +24%, and in rebar from +3.8% to +6.7%.

Contractors apply the expected % to their own last quote for the same item. Sections: drivers,
expected changes, crowd prices, open contracts, method. Note bands are the raw simulation 10–90%.
The backtest calibration (`interval_calibration.csv`) applies to `run_forecast.py forecast` output.

## Countries

| | Uganda | Kenya | Rwanda |
|---|---|---|---|
| Official index | UBOS CIPI, monthly Excel | KNBS CIPI, quarterly PDF | None (NISR PPI may cover construction; unconfirmed) |
| Contracts | 12, monthly | 7, quarterly; trading closes on the 15th of the quarter's middle month (KNBS price date) | None yet |
| Opening prices | Structural / blend / pooled per contract | Pooled nowcast (12 test quarters; mixed skill) | – |
| Forecaster | Full structural model | Quarterly model for the 3 cost indices | None (no index) |
| Weekly note | Yes | Yes | Yes (drivers + crowd prices) |
| Price reports and weekly drivers | Yes | Yes (KES) | Yes (RWF) |

**Kenya data:** `pull_knbs_cipi.py` and `parse_knbs_cipi.py`. 22 releases from Q1 2021 to Q2 2026; 16
have text tables, and six are scanned or have no readable tables. The six-quarter tables cover
Q4 2019–Q2 2026 except Q4 2021. No revisions across 2,228 repeated points, so history stitches
releases (`settlement.history: combine_releases`). KNBS publishes the full basket with weights,
so a Kenya structural model is possible once more quarters accumulate.

**Rwanda:** collect prices and run the note. Contracts wait until a settlement series is agreed:
confirm with NISR whether the PPI includes construction. An index built from participants' own
reports must not settle contracts, because participants could move it.

## Pilot (first 3 months)

Forecasting and price collection only (the play-money market is switched off; its code stays in `src/market/`).
Live countries are set in `config/site.yaml`: `pilot_countries` (Uganda, South Africa, Kenya, Rwanda, Zambia,
Tanzania, Nigeria) plus `benchmark_countries` (United States). Only these appear on the site and the public API;
add the others to `pilot_countries` when expanding.

Anyone can view the site and report prices: no accounts or invites (`/app` redirects to the site). People can report
what they paid up to 6 months back, whenever they have a moment; typical prices pool the last 8 weeks and publish from
3 different people (`src/market/reports.py`).

Benchmarks (`benchmark_countries`): the same kind of forecast on official monthly indices that are published on time —
United States (BLS via FRED), United Kingdom (DBT/ONS "All Work" materials), Austria (Eurostat construction costs),
Hong Kong (C&SD materials; equal-weight basket of six, our calculation), Philippines (PSA materials, Metro Manila) and
Brazil (FGV INCC via the Central Bank). `src/ingest/pull_benchmarks.py` downloads them daily; each gets a 48-month
walk-forward test (`countries/<c>/outputs/forecast/backtest_errors.csv`), a track record on its page and a weekly note
that explains it. Not added yet: China (no downloadable official monthly series), Singapore (monthly prices only in
PDFs since 2020), India (WPI items; needs a free data.gov.in key).

The monthly pilot report (`/admin/pilot-report`) scores: main items with a typical price in the capital, contributors
and returning contributors, forecasts inside the likely range, the benchmark, and site visits. Site visits come from
`/api/public/hit` (`src/market/usage.py`): no cookies, no IP addresses, a visitor counted once per day, nothing sent when
the browser asks not to be tracked.

## Data checks and tests (`src/forecast/data_checks.py`)

Run with every refresh (and in the test suite). For each live country: forecast age, official-data lag, complete and
ordered forecast ranges, plausible history, oil and exchange-rate feeds, benchmark downloads, calibration of the
benchmark and trend-forecast tests, and the weekly note. Results: `data/live/data_checks.json` and the organiser page
(`/admin`); `fail` stops nothing but shows in the cron log and fails `pytest`.

How the forecasts are tested:
- Benchmarks: 48-month walk-forward (only data known at the time); ranges calibrated only from earlier test errors
  (recent 24, never narrower than 0.85x); results on each benchmark page.
- Trend forecasts (materials without their own model): damped drift with ranges from the material's own past
  changes, chosen after AR(1) missed more than "no change"; per-material test shown on hover in the materials table.
- Kenya: six KNBS releases are scanned images (Q4 2021, Q1-Q4 2022, Q3 2025). `src/ingest/knbs_ocr.py` reads their
  three headline rows by OCR and accepts a value only when the quarters just before it match the text releases
  (Q4 2021 recovered: overall 106.12, building 104.23, civil 108.06; also stated in the Q1 2022 release's text).
  Accepted values are in `countries/kenya/raw/knbs_ocr_verified.csv`; text releases always take priority.
- Benchmark calibration uses only errors whose outcome was already observable at each test month (no hindsight).
- Currencies: every live country's rate against the US dollar is in the weekly feed; the United States shows the
  Federal Reserve broad dollar index (FRED DTWEXBGS) instead.
- The import-cost estimate (countries without an official index) is checked against Uganda and South Africa:
  its 3-month direction matched the official index about 6 times in 10 (`data/shared/estimate_validation.json`);
  the estimate-country notes say so.

## Before going live

- Legal: play money only (`regulation.mode` is enforced). Get a one-page opinion per country
  before any prize or cash element.
- Verify the cement excise in `countries/uganda/policy_events.yaml` (the sources conflict).
- Set a strong `CIO_ADMIN_KEY` and serve over HTTPS.

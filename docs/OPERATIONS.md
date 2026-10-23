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
- Per-material forecasts (`src/forecast/material_models.py`, materials without their own structural model): candidate
  drivers by material (world steel and iron ore, oil, coal, copper, natural gas, rain, the exchange rate; world prices from
  `src/ingest/build_commodities.py`), chosen on the first half of a 48-month (16-quarter) test and judged on the second.
  Pooling all countries showed real predictability only for fuel (oil), labour (exchange rate) and sand/stone, so only
  those groups may use a driver model, and only if it beats "no change" by 5%; the rest forecast "no change" with a
  calibrated range. Unpublished months after the last official release are filled with the drivers already known.
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

## Countries without official material indices (Rwanda, Nigeria, Tanzania, Zambia)

Three kinds of per-item series, labelled on the site:
1. Official prices of single items — `src/ingest/official_prices.py`: Zambia's ERB monthly pump price notices (diesel,
   petrol; each month checked against the next notice's previous price, image tables read by OCR, gaps filled from the
   next notice). Notices that cannot be fetched (RURA Rwanda, EWURA Tanzania, NBS Nigeria Price Watch, Tanzania CPI items
   such as cement and iron sheets) go in `data/shared/official_item_prices_curated.csv`, typed from the official
   document with its URL — never from news reports.
2. Tested CiO estimates (`material_models.PROXIES`): fuel from oil (tracks official fuel and asphalt indices in Uganda,
   Kenya and South Africa: correlation 0.5-0.8); steel from world steel prices, labelled rough (0.33). No cement,
   sand or block estimate: energy prices do not track cement (correlation ~0).
3. Reported prices — the index built from what people pay (`Participants.crowd_index`), the main path for cement,
   sand and blocks.

## Trust pages and accuracy (Oct 2026)

- Public pages: `methodology.html` (how every figure is built and tested), `terms.html`, `privacy.html`. Operator, contact email,
  jurisdiction and version come from `config/site.yaml` (`operator`, `contact_email`, `jurisdiction`, `legal_version`).
  Have a lawyer review the terms and privacy text before launch; fill in `contact_email`.
- Uganda's main model is now checked material by material (choose on the first half of its backtest, judge on the second):
  cement and steel bars use "no change" (the model did not beat it), diesel and labour keep the model.
- Live track record (method page, `public/data/track_record.csv`): every saved forecast checked automatically when the
  official figure is published; rebuilt with the site every refresh.
- Reported prices feed forecasts: an item with 12+ months of reported-price index gets its own tested forecast.
- Rainfall now covers Kenya and South Africa (five main markets each); labour rates (skilled mason, casual labourer, per day)
  can be reported in every pilot country.

## Before going live

- Legal: play money only (`regulation.mode` is enforced). Get a one-page opinion per country
  before any prize or cash element.
- Verify the cement excise in `countries/uganda/policy_events.yaml` (the sources conflict).
- Set a strong `CIO_ADMIN_KEY` and serve over HTTPS.

## The assistant (Claude): data scout and contract reader

Both are off until `ANTHROPIC_API_KEY` is set in the web app's and the cycle's environment. `CIO_AI_MONTHLY_USD`
(default 30) caps the spending per month; `CIO_AI_MODEL` changes the model (default claude-opus-5-5).
Spending is shown in /admin.

- **Data scout** (`src/ai/scout.py`, in the daily cycle). For the countries in `config/scout.yaml` (Rwanda RURA,
  Tanzania EWURA, Nigeria NBS) it searches only the listed official sites for pump prices we lack (the last 24
  months). Code re-opens each notice and checks the quote and the price; then each proposal waits in /admin →
  "Data scout". **Open the notice and find the quote before approving.** Approved rows go to
  `data/shared/official_item_prices_curated.csv` and are in the site's data at the next refresh. A country is looked
  at only when its current month is missing, at most once a week. Run by hand: `python src/ai/scout.py --country rwanda --force`.
- **Contract reader** (`src/ai/contract_reader.py`, `POST /api/pro/contract`, on the Bids & contracts page). Reads
  the FIDIC price adjustment data from an uploaded PDF; code checks every quote against the document and that the
  coefficients add up to 1. The file is never stored. Limits: 1 reading per person per day free; 20 a day with a Pro
  code (give one from the Pro waitlist in /admin); 60 a day in total.

## Self-checks and usage

- **Publishing is held when a data check fails.** The refresh rebuilds the site only when
  `data/live/data_checks.json` has no `fail`; otherwise the last good site stays up and /admin → Health says
  "site held". Fix the source (or the check), then run `python src/market/cycle.py refresh`.
- **Problems are reported**: /admin → Health lists the last 3 days; set `CIO_ORGANISER_EMAIL` (plus `CIO_SMTP_*`)
  to get an email, at most once a day for the same problem.
- **Robot visitor**: `python src/ops/site_check.py` (daily in the cycle; `--quick` for English only). Needs Chrome or
  Chromium (`apt install chromium`; set `CIO_CHROME` if it is not found). Result: `data/live/site_check.json` and
  /admin → Health.
- **Usage**: /admin → Usage (7, 30 or 90 days). Robots and Do-Not-Track browsers are not counted.

## Running on this Mac (until there is a server)

`python3 deploy/mac/install.py` installs launchd agents that keep the web app and a free Cloudflare tunnel running
and run the refresh (every 3 hours), daily, weekly and monthly jobs and the nightly backup — no one needs to start
anything. `--status` shows each job and **the current public link** (also in /admin → Health); `--remove` stops it all.

- The public link changes whenever the tunnel restarts (after a reboot, for example). A fixed address needs a
  domain and a named Cloudflare tunnel, or the server in `docs/DEPLOY.md`.
- Nothing runs while the Mac is off; jobs missed during sleep run on waking. For the site to stay up, keep the Mac
  on and set it not to sleep (System Settings → Displays/Battery → prevent automatic sleeping).
- Settings and the admin password: `~/Library/Application Support/cio/cio.env`. Backups:
  `~/Library/Application Support/cio/backups` (copy them off the Mac now and then; macOS blocks background jobs from
  writing into OneDrive without Full Disk Access).
- Logs: `data/live/launchd-<job>.log`, plus `cycle_log.csv`.

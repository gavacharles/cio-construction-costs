# Austria — benchmark (Europe)

The same forecasting tool on Construction cost index, new residential buildings (monthly, 2021 = 100), from Statistics Austria (via Eurostat). Published monthly and on time, so the forecasts can be checked against it in public. No price reporting here.

- Data: `src/ingest/pull_benchmarks.py` (daily job), saved in `raw/`.
- Forecast and 48-month walk-forward test: `src/forecast/weekly_note.py` (`benchmark_body`), test in `outputs/forecast/backtest_errors.csv`.

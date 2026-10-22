# United Kingdom — benchmark (Europe)

The same forecasting tool on Construction material price index, All Work (monthly, 2015 = 100), from Department for Business and Trade (DBT), from ONS and BCIS. Published monthly, so the forecasts can be checked against it in public. No price reporting here.

- Data: `src/ingest/pull_benchmarks.py` (daily job), saved in `raw/`.
- Forecast and 48-month walk-forward test: `src/forecast/weekly_note.py` (`benchmark_body`), test in `outputs/forecast/backtest_errors.csv`.

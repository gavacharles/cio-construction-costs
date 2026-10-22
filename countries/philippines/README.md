# Philippines — benchmark (Asia)

The same forecasting tool on Construction Materials Wholesale Price Index, National Capital Region (monthly, 2018 = 100), from Philippine Statistics Authority (PSA). Published monthly and on time, so the forecasts can be checked against it in public. No price reporting here.

- Data: `src/ingest/pull_benchmarks.py` (daily job), saved in `raw/`.
- Forecast and 48-month walk-forward test: `src/forecast/weekly_note.py` (`benchmark_body`), test in `outputs/forecast/backtest_errors.csv`.

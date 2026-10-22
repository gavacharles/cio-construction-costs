# Hong Kong — benchmark (Asia)

The same forecasting tool on Costs of materials used in public sector construction projects (monthly, April 2003 = 100), from Census and Statistics Department (C&SD), Hong Kong. Published monthly, so the forecasts can be checked against it in public. No price reporting here.

- Data: `src/ingest/pull_benchmarks.py` (daily job), saved in `raw/`.
- Forecast and 48-month walk-forward test: `src/forecast/weekly_note.py` (`benchmark_body`), test in `outputs/forecast/backtest_errors.csv`.

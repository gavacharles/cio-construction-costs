# Brazil — benchmark (Latin America)

The same forecasting tool on INCC, national construction cost index (monthly % change), from Fundação Getulio Vargas (FGV), via Banco Central do Brasil. Published monthly and on time, so the forecasts can be checked against it in public. No price reporting here.

- Data: `src/ingest/pull_benchmarks.py` (daily job), saved in `raw/`.
- Forecast and 48-month walk-forward test: `src/forecast/weekly_note.py` (`benchmark_body`), test in `outputs/forecast/backtest_errors.csv`.

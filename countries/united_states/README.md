# United States — benchmark

CiO Costs runs the same forecasting method on the US Bureau of Labor Statistics construction input price index,
which is published every month, on time, with history back to 1986. That lets anyone check how well the tool
forecasts where the official data is good. No price reporting here.

- Data: BLS Producer Price Indexes via FRED (`src/ingest/pull_fred.py`, daily job), saved in `raw/`.
- Forecast and walk-forward test: `src/forecast/weekly_note.py` (`united_states_body`); the test is written to
  `outputs/forecast/backtest_errors.csv` and shown as the track record.

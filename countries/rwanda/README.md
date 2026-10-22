# Rwanda

| | |
|---|---|
| Status | **reporting** |
| Currency | RWF (exchange rates: weekly currency-api `rwf`, monthly IMF `RWA`) |
| Statistics office | National Institute of Statistics of Rwanda (NISR) |
| Official construction price series | none yet (candidate: Producer Price Index, construction component) |
| Latest official reading | – |
| Forecast | Imported-input cost-pressure outlook (src/forecast/cost_pressure.py): oil in local currency and the exchange rate; an indicator, not a price index |
| Weekly note | `countries/rwanda/notes/weekly_rwanda_<date>.md` / `.html` |

## Contracts
- None yet (no official series wired in)

## Prices participants report
Cement, 50 kg bag, Rebar Y12, 12 m bar, Iron sheet, gauge 30, 3 m, Diesel, pump price, Sand, per tonne, Aggregate / gravel, per tonne, Burnt clay brick, Mason, daily wage

## Files
- `config.yaml` — everything the code needs for this country (settlement source, contracts, price items, regulation).
- `raw/` — official releases as published (where an adapter exists).
- `outputs/` — parsed series, backtests, forecasts.
- `notes/` — weekly notes.

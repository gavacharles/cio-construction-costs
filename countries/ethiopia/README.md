# Ethiopia

| | |
|---|---|
| Status | **reporting** |
| Currency | ETB (exchange rates: weekly currency-api `etb`, monthly IMF `ETH`) |
| Statistics office | Ethiopian Statistics Service (ESS) |
| Official construction price series | unclear: a quarterly construction materials index was planned in 2020; status unknown |
| Latest official reading | – |
| Forecast | Imported-input cost-pressure outlook (src/forecast/cost_pressure.py): oil in local currency and the exchange rate; an indicator, not a price index |
| Weekly note | `countries/ethiopia/notes/weekly_ethiopia_<date>.md` / `.html` |

## Contracts
- None yet (no official series wired in)

## Prices participants report
Cement, 50 kg bag, Rebar 12 mm, 12 m bar, Roofing sheet, 3 m, Diesel, pump price, Sand, per tonne, Aggregate / stone, per tonne, Concrete block or brick, Mason, daily wage

## Files
- `config.yaml` — everything the code needs for this country (settlement source, contracts, price items, regulation).
- `raw/` — official releases as published (where an adapter exists).
- `outputs/` — parsed series, backtests, forecasts.
- `notes/` — weekly notes.

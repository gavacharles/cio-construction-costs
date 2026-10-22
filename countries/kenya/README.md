# Kenya

| | |
|---|---|
| Status | **pilot** |
| Currency | KES (exchange rates: weekly currency-api `kes`, monthly IMF `KEN`) |
| Statistics office | Kenya National Bureau of Statistics (KNBS) |
| Official construction price series | Construction Input Price Indices, quarterly PDF |
| Latest official reading | – |
| Forecast | Quarterly driver model for the KNBS overall/building/civil indices (src/forecast/quarterly_model.py) |
| Weekly note | `countries/kenya/notes/weekly_kenya_<date>.md` / `.html` |

## Contracts
- `KE_CIPI` Overall construction input prices (`all|total`)
- `KE_BUILD` Building cost index (`buildings|total`)
- `KE_CIVIL` Civil engineering cost index (`civil|total`)
- `KE_CEM` Cement (`all|cement`)
- `KE_STEEL` Steel and reinforcement bars (`all|steel and reinforced bars`)
- `KE_FUEL` Fuel and lubricants (`all|fuel and lubricants`)
- `KE_LABOUR` Construction labour (`all|labour`)

## Prices participants report
Cement, 50 kg bag, Rebar Y12, 12 m bar, Iron sheet, gauge 30, 3 m, Diesel, pump price, Ballast, per tonne, River sand, per tonne, Machine-cut stone / block, 6 in, Mason, daily wage

## Files
- `config.yaml` — everything the code needs for this country (settlement source, contracts, price items, regulation).
- `raw/` — official releases as published (where an adapter exists).
- `outputs/` — parsed series, backtests, forecasts.
- `notes/` — weekly notes.

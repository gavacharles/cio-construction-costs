# South Africa

| | |
|---|---|
| Status | **pilot** |
| Currency | ZAR (exchange rates: weekly currency-api `zar`, monthly IMF `ZAF`) |
| Statistics office | Statistics South Africa (Stats SA) |
| Official construction price series | P0151.1 Construction materials price indices, monthly PDF |
| Latest official reading | – |
| Forecast | Contract nowcast from Stats SA P0151.1 patterns; driver model planned |
| Weekly note | `countries/south_africa/notes/weekly_south_africa_<date>.md` / `.html` |

## Contracts
- `ZA_CIPI` Construction input prices (whole industry) (`cipi|total construction`)
- `ZA_CEM` Cement (`cipi|cement`)
- `ZA_READY` Ready-mix concrete (`cipi|ready-mix concrete`)
- `ZA_REBAR` Reinforcing steel (`cipi|reinforcing metal work`)
- `ZA_STONE` Construction stone and sand (`cipi|construction stone and sand`)
- `ZA_CIVIL` Civil engineering materials (`civil|civil engineering material - total`)

## Prices participants report
Cement, 50 kg bag, Reinforcing steel, per tonne, Ready-mix concrete 25 MPa, per m3, Diesel, pump price, Building sand, per m3, 19 mm stone, per m3, Clay stock bricks, per 1,000, Builder / bricklayer, daily wage

## Files
- `config.yaml` — everything the code needs for this country (settlement source, contracts, price items, regulation).
- `raw/` — official releases as published (where an adapter exists).
- `outputs/` — parsed series, backtests, forecasts.
- `notes/` — weekly notes.

# Senegal

| | |
|---|---|
| Status | **reporting** |
| Currency | XOF (exchange rates: weekly currency-api `xof`, monthly IMF `SEN`) |
| Statistics office | ANSD |
| Official construction price series | available: ANSD monthly Indice des prix des materiaux de construction (IMC); adapter next |
| Latest official reading | ANSD Indice des prix des materiaux de construction (IMC), 2022 = 100, monthly, 2026-04: level None, change on previous period 1.1%, on a year earlier 2.4% (official). Source: https://www.ansd.sn/Indicateur/indice-des-prix-des-materiaux-de-construction-imc |
| Forecast | Imported-input cost-pressure outlook (src/forecast/cost_pressure.py): oil in local currency and the exchange rate; an indicator, not a price index |
| Weekly note | `countries/senegal/notes/weekly_senegal_<date>.md` / `.html` |

## Contracts
- None yet (no official series wired in)

## Prices participants report
Cement, 50 kg bag, Rebar 12 mm, 12 m bar, Roofing sheet, 3 m, Diesel, pump price, Sand, per tonne, Aggregate / stone, per tonne, Concrete block or brick, Mason, daily wage

## Files
- `config.yaml` — everything the code needs for this country (settlement source, contracts, price items, regulation).
- `raw/` — official releases as published (where an adapter exists).
- `outputs/` — parsed series, backtests, forecasts.
- `notes/` — weekly notes.

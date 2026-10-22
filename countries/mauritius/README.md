# Mauritius

| | |
|---|---|
| Status | **reporting** |
| Currency | MUR (exchange rates: weekly currency-api `mur`, monthly IMF `MUS`) |
| Statistics office | Statistics Mauritius |
| Official construction price series | available: quarterly Construction Price Index (materials 68.6%); adapter next |
| Latest official reading | Statistics Mauritius Construction Price Index (single-family house), quarterly, 2026-03: level 151.6, change on previous period None%, on a year earlier 4.5% (secondary). Source: https://fr.allafrica.com/stories/202604260011.html |
| Forecast | Imported-input cost-pressure outlook (src/forecast/cost_pressure.py): oil in local currency and the exchange rate; an indicator, not a price index |
| Weekly note | `countries/mauritius/notes/weekly_mauritius_<date>.md` / `.html` |

## Contracts
- None yet (no official series wired in)

## Prices participants report
Cement, 50 kg bag, Rebar 12 mm, 12 m bar, Roofing sheet, 3 m, Diesel, pump price, Sand, per tonne, Aggregate / stone, per tonne, Concrete block or brick, Mason, daily wage

## Files
- `config.yaml` — everything the code needs for this country (settlement source, contracts, price items, regulation).
- `raw/` — official releases as published (where an adapter exists).
- `outputs/` — parsed series, backtests, forecasts.
- `notes/` — weekly notes.

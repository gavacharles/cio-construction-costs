# Zimbabwe

| | |
|---|---|
| Status | **reporting** |
| Currency | ZWG (exchange rates: weekly currency-api `zwg`, monthly IMF `ZWE`) |
| Statistics office | ZimStat |
| Official construction price series | available: ZimStat monthly building materials (BMPI) and civil engineering materials (CEMPI) indices; adapter next |
| Latest official reading | ZimStat weighted Building Materials Price Index (BMPI), June 2024 = 100, quarterly, 2025-12: level 122.14, change on previous period 1.0%, on a year earlier 7.8% (official). Source: https://www.zimstat.co.zw/wp-content/uploads/Macro/Prices/BMPI/2025/BMPI_Weighted_12_2025.pdf |
| Forecast | Imported-input cost-pressure outlook (src/forecast/cost_pressure.py): oil in local currency and the exchange rate; an indicator, not a price index |
| Weekly note | `countries/zimbabwe/notes/weekly_zimbabwe_<date>.md` / `.html` |

## Contracts
- None yet (no official series wired in)

## Prices participants report
Cement, 50 kg bag, Rebar 12 mm, 12 m bar, Roofing sheet, 3 m, Diesel, pump price, Sand, per tonne, Aggregate / stone, per tonne, Concrete block or brick, Mason, daily wage

## Files
- `config.yaml` — everything the code needs for this country (settlement source, contracts, price items, regulation).
- `raw/` — official releases as published (where an adapter exists).
- `outputs/` — parsed series, backtests, forecasts.
- `notes/` — weekly notes.

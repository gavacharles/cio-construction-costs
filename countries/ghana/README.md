# Ghana

| | |
|---|---|
| Status | **reporting** |
| Currency | GHS (exchange rates: weekly currency-api `ghs`, monthly IMF `GHA`) |
| Statistics office | Ghana Statistical Service (GSS) |
| Official construction price series | available: GSS Prime Building Cost Index (PBCI), monthly, 406 items, base 2023; adapter next |
| Latest official reading | GSS Prime Building Cost Index (PBCI), 2023 = 100, monthly, 2026-08: level 138.4, change on previous period 0.1%, on a year earlier 4.6% (official). Source: https://www.myjoyonline.com/wp-content/uploads/2026/09/August-2026_PBCI-Bulletin.pdf |
| Forecast | Imported-input cost-pressure outlook (src/forecast/cost_pressure.py): oil in local currency and the exchange rate; an indicator, not a price index |
| Weekly note | `countries/ghana/notes/weekly_ghana_<date>.md` / `.html` |

## Contracts
- None yet (no official series wired in)

## Prices participants report
Cement, 50 kg bag, Rebar 12 mm, 12 m bar, Roofing sheet, 3 m, Diesel, pump price, Sand, per tonne, Aggregate / stone, per tonne, Concrete block or brick, Mason, daily wage

## Files
- `config.yaml` — everything the code needs for this country (settlement source, contracts, price items, regulation).
- `raw/` — official releases as published (where an adapter exists).
- `outputs/` — parsed series, backtests, forecasts.
- `notes/` — weekly notes.

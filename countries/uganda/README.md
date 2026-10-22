# Uganda

| | |
|---|---|
| Status | **pilot** |
| Currency | UGX (exchange rates: weekly currency-api `ugx`, monthly IMF `UGA`) |
| Statistics office | Uganda Bureau of Statistics (UBOS) |
| Official construction price series | Construction Input Price Index (CIPI), monthly Excel tables |
| Latest official reading | – |
| Forecast | Structural model on UBOS's own weights (src/forecast/model.py), conditioned weekly on oil and shilling readings |
| Weekly note | `countries/uganda/notes/weekly_uganda_<date>.md` / `.html` |

## Contracts
- `CIPI_ALL` Overall construction input prices (`overall construction index`)
- `CEM` Cement (`cement`)
- `REBAR` Reinforcement steel bars (`high tensile steel bars`)
- `ROOFSHEET` Steel roofing sheets (`sheet steel, roofing sheets and similar`)
- `DIESEL` Diesel (`diesel`)
- `LABOUR` Construction labour (`labour`)
- `AGG` Aggregate and hardcore (`aggregate, hardcore, crushed or broken stone`)
- `SAND` Sand (`sand`)
- `BLOCKS` Concrete blocks (`concrete bricks, blocks and slabs`)
- `TIMBER` Timber (`timber, coniferous, greater than 6mm thick`)
- `PAINT` Paints (`paints and varnishes`)
- `PIPES` Plastic pipes (`plastic pipes and fittings`)

## Prices participants report
Cement, 50 kg bag, Rebar Y12, 12 m bar, Rebar Y16, 12 m bar, Iron sheet, gauge 28, 3 m, Diesel, pump price, Sand, per tipper (7 t), Aggregate, per tipper (7 t), Concrete block, 6 in, Timber 2x4, per foot, Mason, daily wage

## Files
- `config.yaml` — everything the code needs for this country (settlement source, contracts, price items, regulation).
- `raw/` — official releases as published (where an adapter exists).
- `outputs/` — parsed series, backtests, forecasts.
- `notes/` — weekly notes.

# CiO Construction Cost Platform

Weekly, forward-looking construction input cost signals for 18 African countries: official
statistics, live market drivers (oil, exchange rates, rainfall, fiscal and tax data), prices
reported by participants, and a play-money forecasting challenge.

Separated on 22 Oct 2026 from the research pipeline (`gavacharles/cio_pipeline-2`), which still
builds the Uganda research panel (`data/shared/panel_v1.0*.csv` are copies of its outputs).

## Countries
| Country | Status | Currency | Contracts | Forecast |
|---|---|---|---|---|
| [Botswana](countries/botswana/README.md) | reporting | BWP | 0 | Imported-input cost-pressure outlook |
| [Egypt](countries/egypt/README.md) | reporting | EGP | 0 | Imported-input cost-pressure outlook |
| [Ethiopia](countries/ethiopia/README.md) | reporting | ETB | 0 | Imported-input cost-pressure outlook |
| [Ghana](countries/ghana/README.md) | reporting | GHS | 0 | Imported-input cost-pressure outlook |
| [Kenya](countries/kenya/README.md) | pilot | KES | 7 | Quarterly driver model for the KNBS overall/building/civil indices |
| [Malawi](countries/malawi/README.md) | reporting | MWK | 0 | Imported-input cost-pressure outlook |
| [Mauritius](countries/mauritius/README.md) | reporting | MUR | 0 | Imported-input cost-pressure outlook |
| [Morocco](countries/morocco/README.md) | reporting | MAD | 0 | Imported-input cost-pressure outlook |
| [Mozambique](countries/mozambique/README.md) | reporting | MZN | 0 | Imported-input cost-pressure outlook |
| [Namibia](countries/namibia/README.md) | reporting | NAD | 0 | Imported-input cost-pressure outlook |
| [Nigeria](countries/nigeria/README.md) | reporting | NGN | 0 | Imported-input cost-pressure outlook |
| [Rwanda](countries/rwanda/README.md) | reporting | RWF | 0 | Imported-input cost-pressure outlook |
| [Senegal](countries/senegal/README.md) | reporting | XOF | 0 | Imported-input cost-pressure outlook |
| [South Africa](countries/south_africa/README.md) | pilot | ZAR | 6 | Contract nowcast from Stats SA P0151.1 patterns; driver model planned |
| [Tanzania](countries/tanzania/README.md) | reporting | TZS | 0 | Imported-input cost-pressure outlook |
| [Uganda](countries/uganda/README.md) | pilot | UGX | 12 | Structural model on UBOS's own weights |
| [Zambia](countries/zambia/README.md) | reporting | ZMW | 0 | Imported-input cost-pressure outlook |
| [Zimbabwe](countries/zimbabwe/README.md) | reporting | ZWG | 0 | Imported-input cost-pressure outlook |

Everything about a country lives in `countries/<country>/` (`config.yaml`, `README.md`, `raw/`,
`outputs/`, `notes/`). Cross-country inputs live in `data/shared/`.

## Layout
```
countries/<country>/      config, README, official releases, outputs, weekly notes
data/shared/              macro panel, exchange rates (weekly + IMF), Brent, rainfall, fiscal
data/live/                participant database (git-ignored; server only)
src/ingest/               harvesters and parsers (UBOS, KNBS, Stats SA, FX, Brent, rainfall)
src/forecast/             Uganda structural model, Kenya quarterly model, cost-pressure outlook, weekly notes
src/market/               contracts, settlement, LMSR market maker, ledger, price reports, daily/weekly cycle
src/webapp/               participant app (FastAPI) and demo seed
deploy/                   systemd, Caddy, cron, backup
docs/                     design, forecast model, operations, deployment, countries
outreach/                 local only (git-ignored): playbook and post templates
```

## Quick start
```bash
pip install -r requirements.txt
python src/forecast/weekly_note.py --no-fetch --country all      # notes from data on disk
python src/market/cycle.py weekly                                # refresh drivers + notes
CIO_SECURE_COOKIES=0 CIO_ADMIN_KEY=dev uvicorn --app-dir src/webapp app:app --port 8000
pytest -q
```
How the forecasts work: `FORECASTING.md`. Deployment: `docs/DEPLOY.md`. Operations: `docs/OPERATIONS.md`. Methods: `docs/FORECAST_MODEL.md`,
`docs/MARKET_DESIGN.md`. Country status: `docs/COUNTRIES.md`.

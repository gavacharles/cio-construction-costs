# cio-construction-costs

Code, data and static site for the CiO construction cost platform: weekly construction input cost signals for African countries from official statistics, market drivers (oil, exchange rates, rainfall, fiscal and tax data), participant price reports, and a play-money forecasting challenge.

Open `index.html` (it opens `public/index.html`) for the public site: front page, a page per country, bid calculator, price reporting, the forecasting game and an explainer. It is built by `src/site/build_index.py`; in production the app serves `public/` at `/` and the participant app at `/app`.

The Uganda research panel is built in [cio_pipeline-2](https://github.com/gavacharles/cio_pipeline-2); `data/shared/panel_v1.0*.csv` are copies of its outputs.

## Layout

```
countries/<country>/      config.yaml, README, official releases (raw/), outputs, weekly notes
data/shared/              macro panel, exchange rates, Brent, rainfall, fiscal data
data/live/                participant database (git-ignored; server only)
src/ingest/               harvesters and parsers (UBOS, KNBS, Stats SA, FX, Brent, rainfall)
src/forecast/             Uganda structural model, Kenya quarterly model, cost-pressure outlook, weekly notes
src/market/               contracts, settlement, LMSR market maker, ledger, price reports, daily/weekly cycle
src/webapp/               participant app (FastAPI) and demo seed
src/ai/                   AI helpers (contract reader, scout)
src/site/                 public site builder
public/                   built public site
config/                   site, towns and scout settings
deploy/                   systemd, Caddy, cron, backup, macOS install
docs/                     design, forecast model, operations, deployment, country list
tests/                    pytest suites
```

Countries covered: Botswana, Egypt, Ethiopia, Ghana, Kenya, Malawi, Mauritius, Morocco, Mozambique, Namibia, Nigeria, Rwanda, Senegal, South Africa, Tanzania, Uganda, Zambia and Zimbabwe (status per country in `docs/COUNTRIES.md`).

## Quick start

```bash
pip install -r requirements.txt
python src/forecast/weekly_note.py --no-fetch --country all      # notes from data on disk
python src/market/cycle.py weekly                                # refresh drivers and notes
CIO_SECURE_COOKIES=0 CIO_ADMIN_KEY=dev uvicorn --app-dir src/webapp app:app --port 8000
pytest -q
```

## Further documentation

`PROJECT_OVERVIEW.md` (project, hosting, server), `FORECASTING.md` (how the forecasts work), `docs/DEPLOY.md`, `docs/OPERATIONS.md`, `docs/FORECAST_MODEL.md`, `docs/MARKET_DESIGN.md`, `docs/COUNTRIES.md`.

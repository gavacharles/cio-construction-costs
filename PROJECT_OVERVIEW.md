# CiO Construction Cost Platform — Project Overview and Hosting Specification

*Owner: Gavamukulya (Gava) Charles, CiO Lab · Repository: `gavacharles/cio-construction-costs` (private) · Version: 22 October 2026*

This file covers what the project is, what gets hosted, and the server it needs. For how the
forecasts work, see `FORECASTING.md`; for step-by-step installation, `docs/DEPLOY.md`.

---

## 1. What the project is

**A weekly, forward-looking view of construction input costs across 18 African countries, in local
currency.** It combines four things:

| Component | What it does | For whom |
|---|---|---|
| **Forecaster** | Turns official construction price indices plus live drivers (oil, exchange rates, rainfall, public spending, tax measures) into forecasts with ranges | Everyone, through the weekly notes |
| **Weekly notes** | One per country every Monday: this week's drivers, expected cost changes, latest official reading, participants' prices | Contractors, quantity surveyors, developers, lenders, media |
| **Price reports** | Participants report what they actually pay for cement, steel, diesel, sand and labour each week | Participants; feeds the notes |
| **Forecasting challenge (market)** | Play-money contracts on the next official index print, priced by an automated market maker that opens at the forecaster's probabilities | Participants; measures whether the crowd knows more than the model |

**Why it matters:** contractors bid fixed prices and then lose margin when costs move. Official
indices come out late (Uganda: 1–2 months), infrequently (Kenya: quarterly) or not at all
(Nigeria, Zambia, Tanzania and others).

**Countries:**

| Coverage | Countries |
|---|---|
| Contracts and fitted forecasts | Uganda (monthly, structural model), Kenya (quarterly), South Africa (monthly) |
| Weekly note, price reports, cost-pressure outlook | Ghana, Zimbabwe, Senegal and Mauritius (with their latest official readings); Tanzania, Zambia, Botswana, Malawi, Egypt, Nigeria, Rwanda, Namibia, Ethiopia, Mozambique, Morocco |

**Legal position:** play money only. Points have no cash value, and the code refuses real-money
settings. Any prize or cash element needs a legal opinion per country first.

## 2. What gets hosted

| # | Service | What it is | Public? |
|---|---|---|---|
| 1 | **Participant web app** | FastAPI app (`src/webapp/app.py`): invite-code login, contracts and trading, price reports, weekly note, leaderboard, organiser admin page | Yes, over HTTPS on your domain |
| 2 | **Weekly notes and forecast pages** | Per country, written every Monday: the note (HTML) and the in-app **Forecast** page (from `countries/<c>/outputs/forecast_latest.json`) with range charts | Inside the app (notes optionally public) |
| 3 | **Daily job** | Harvests UBOS, KNBS and Stats SA; settles contracts when official figures appear; refits forecasts; opens new contracts | No (scheduled job) |
| 4 | **Weekly job** | Refreshes Brent, 18 exchange rates, IMF history and rainfall; writes the 18 notes | No (scheduled job) |
| 5 | **Database** | One SQLite file: participants, invite codes, trades, positions, contracts, price reports | No, never exposed |
| 6 | **Backups** | Nightly copy of the database (30 days kept), plus an off-server copy | No |

**Not hosted:** research notebooks, the research data pipeline (in `cio_pipeline-2`) and the
outreach material (local only).

## 3. Architecture

```
                 Internet (participants on phones / laptops)
                                  │  HTTPS 443
                       ┌──────────▼──────────┐
                       │  Caddy (reverse     │  automatic TLS (Let's Encrypt),
                       │  proxy, port 80/443)│  HSTS, gzip
                       └──────────┬──────────┘
                                  │  http 127.0.0.1:8000 (local only)
                       ┌──────────▼──────────┐
                       │  Uvicorn, 2 workers │  systemd unit `cio-app`
                       │  FastAPI app        │  runs as user `cio`
                       └──────────┬──────────┘
                                  │
     ┌────────────────────────────▼─────────────────────────────┐
     │ /srv/cio-construction-costs   (git clone of the repo)    │
     │   data/live/exchange.sqlite   participants, trades, prices│
     │   countries/<c>/notes/        weekly notes (HTML/MD)      │
     │   countries/<c>/raw/, outputs/ official releases, results │
     └────────────────────────────▲─────────────────────────────┘
                                  │ cron (user `cio`)
          daily 06:30 cycle.py daily  ·  Monday 05:00 cycle.py weekly
          nightly 02:00 deploy/backup.sh → /srv/cio_backups → off-site copy
                                  │ outbound HTTPS only
   UBOS · KNBS · Stats SA · EIA · IMF · currency-api (jsDelivr) · Open-Meteo · FRED · GitHub
```

## 4. Server specification

| Item | Specification |
|---|---|
| **Type** | One cloud virtual machine (VPS) |
| **Size** | 2 vCPU, **2 GB RAM** (1 GB works for a demo), 40 GB SSD |
| **Operating system** | Ubuntu 24.04 LTS |
| **Location** | Nearest available region to East Africa (e.g. Johannesburg or Frankfurt); lower latency for users |
| **Suggested providers** | Hetzner, DigitalOcean, AWS Lightsail, or a Ugandan/Kenyan host |
| **Indicative cost** | About **US$6–15 per month**, plus a domain (about $10–20 per year) |
| **Software** | Python 3.10+ (virtual environment at `.venv`), Caddy, SQLite 3, poppler-utils (`pdftotext`), git |
| **Timezone** | Africa/Kampala (cron times are East Africa Time) |
| **Users** | `cio` (system user that owns the app and runs cron); your admin login with sudo |
| **App directory** | `/srv/cio-construction-costs` |
| **Backups directory** | `/srv/cio_backups` |
| **Secrets file** | `/etc/cio/cio.env` (owner root, group `cio`, chmod 640; the app and its jobs read it) |

**Capacity:** the pilot (hundreds of participants, 18 countries) uses well under 1 GB of disk for
the database and notes; the official PDFs add about 60 MB. Expected load is light. If it grows to
thousands of concurrent users, move the database to PostgreSQL and add workers; a single VM is
fine until then.

## 5. Network, domain and ports

| Item | Setting |
|---|---|
| **Domain** | e.g. `pilot.yourdomain.com` (or `costs.ciolab.org`), with a DNS **A record** pointing at the server IP (AAAA for IPv6 too, if used) |
| **Inbound ports** | **22** (SSH, key-only), **80** (HTTP, redirects to HTTPS), **443** (HTTPS). Close everything else |
| **App port** | 8000, bound to **127.0.0.1 only**; never open it publicly |
| **TLS** | Caddy obtains and renews Let's Encrypt certificates automatically |
| **Outbound** | HTTPS to the data sources above, and to GitHub for updates |
| **Firewall** | `ufw allow OpenSSH; ufw allow 80; ufw allow 443; ufw enable` |

## 6. Configuration and secrets (`/etc/cio/cio.env`)

| Variable | Purpose | Value |
|---|---|---|
| `CIO_ADMIN_KEY` | Organiser password for `/admin` (create invite codes) | Long random string: `openssl rand -base64 24` |
| `CIO_DB` | Database file | `/srv/cio-construction-costs/data/live/exchange.sqlite` (live) or `.../demo.sqlite` (demo) |
| `CIO_SECURE_COOKIES` | Cookies only over HTTPS | `1` |
| `CIO_DEMO` | Shows a "demo data" banner | `1` only on a demo instance |

**GitHub access:** the repository is private, so the server clones it with a **read-only deploy
key** (see `docs/DEPLOY.md` §1). No personal GitHub password or token goes on the server.

## 7. Scheduled jobs (crontab of user `cio`, from `deploy/crontab.example`)

| When (EAT) | Command | Purpose |
|---|---|---|
| Daily 06:30 | `cycle.py daily` | Harvest official releases, settle contracts, refit on a new UBOS release, open new contracts |
| Monday 05:00 | `cycle.py weekly` | Refresh drivers and write the 18 weekly notes |
| Every 3 hours | `cycle.py refresh` | Latest oil and exchange rates → all 18 forecasts → public site pages (seconds) |
| Nightly 02:00 | `deploy/backup.sh` | Consistent SQLite backup, kept 30 days |

Each step is logged to `data/live/cycle_log.csv`, and cron output to `data/live/cron.log`.

## 8. Security and data protection

- **HTTPS everywhere:** cookies are HTTPS-only and http-only, with HSTS, `X-Frame-Options: DENY` and
  `nosniff`.
- **Access control:**
  - Participants log in with personal invite codes. A code redeemed again ends the old session.
  - Failed logins are limited to 10 per IP per 15 minutes.
  - The organiser logs in with a password form; the password never appears in URLs.
- **Least privilege:** the app runs as an unprivileged user, under systemd hardening
  (`NoNewPrivileges`, `ProtectSystem=full`, `PrivateTmp`), listening on localhost only.
- **Personal data:** names, organisations, countries, trades and reported prices stay on the server
  and in backups, and are never committed to git (`data/live/` is ignored). Before the live pilot:
  - publish a short privacy notice (what is collected, why, retention, contact),
  - follow Uganda's Data Protection and Privacy Act 2019, and the equivalent law in each country
    where participants are invited.
- **Server hygiene:** SSH keys only (password login disabled), unattended security updates, and a
  backup restore tested monthly.

## 9. Operating it

| Task | How |
|---|---|
| Invite a participant | `https://<domain>/admin` → name, organisation, country → send the code by WhatsApp or email |
| Check the jobs ran | `tail data/live/cycle_log.csv` |
| Update the code | `git pull && .venv/bin/pip install -r requirements.txt && sudo systemctl restart cio-app` |
| Add a tax measure | Edit `countries/uganda/policy_events.yaml` (with sources), commit, pull on the server |
| Update an official reading | Edit `official_reading` in `countries/<c>/config.yaml` |
| Restore a backup | `gunzip` the file from `/srv/cio_backups`, stop `cio-app`, replace `exchange.sqlite`, start `cio-app` |
| Run a demo | Seed `data/live/demo.sqlite` with `src/webapp/seed_demo.py`; set `CIO_DB` to it and `CIO_DEMO=1` |

## 10. Monitoring (recommended)

- A free uptime monitor (e.g. UptimeRobot) on `https://<domain>/` every 5 minutes, with alerts by
  email or WhatsApp.
- A weekly check that the 18 notes have Monday's date, and that `cycle_log.csv` shows no `failed`
  steps.
- A disk usage alert at 80%.

## 11. Costs (pilot)

| Item | Estimate |
|---|---|
| Server (2 GB VM) | $6–15 per month |
| Domain | $10–20 per year |
| Off-site backup storage | $0–5 per month |
| TLS certificates, data sources | Free |
| **Total** | **about $10–20 per month** |

## 12. Roadmap for the hosted platform

1. **Demo:** a server with the seeded demo database and banner, shown to 5–10 people.
2. **Uganda pilot:** live database, 20–50 invited participants, weekly notes on WhatsApp and LinkedIn.
3. **Kenya and South Africa:** participants invited in time for the Q4 2026 Kenya contracts (close
   15 November) and the next Stats SA print.
4. **Automatic adapters:** Ghana, Zimbabwe, Senegal and Mauritius official data.
5. **Premium tier:** dashboard, alerts, escalation reports. Needs payments, and with it terms of
   service and invoicing.

## 13. Where things are in the repository

| Path | Contents |
|---|---|
| `FORECASTING.md` | How the forecasts work |
| `PROJECT_OVERVIEW.md` | This file |
| `countries/<c>/` | Each country's config, README, official releases, outputs, weekly notes |
| `data/shared/` | Macro panel, exchange rates, Brent, rainfall, fiscal data |
| `src/` | `ingest/` (harvesters, parsers), `forecast/` (models, notes), `market/` (contracts, settlement, ledger, cycle), `webapp/` (app, demo seed) |
| `deploy/` | systemd unit, Caddyfile, env template, crontab, backup script |
| `docs/` | Market design, forecast model, operations, deployment, countries |
| `tests/` | 30 automated tests (`pytest -q`) |

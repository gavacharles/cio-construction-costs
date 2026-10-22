# Deploying the pilot on a server (demo or live)

Target: one Ubuntu 24.04 server, 1–2 GB RAM, with a domain whose DNS **A record** points at its
IP address. Everything runs as a `cio` user under `/srv/cio-construction-costs`. About 30 minutes.

## 1. Server packages and code

```bash
sudo apt update && sudo apt install -y python3-venv python3-pip sqlite3 poppler-utils git caddy
sudo timedatectl set-timezone Africa/Kampala
sudo useradd --system --create-home --shell /bin/bash cio
sudo mkdir -p /srv && sudo chown cio:cio /srv
# The repository is private: give the server a read-only deploy key.
sudo -iu cio ssh-keygen -t ed25519 -N "" -f /home/cio/.ssh/cio_deploy -C "cio-server"
sudo -iu cio cat /home/cio/.ssh/cio_deploy.pub
#   -> GitHub: gavacharles/cio-construction-costs > Settings > Deploy keys > Add (read-only)
sudo -iu cio bash -c 'printf "Host github.com\n  IdentityFile ~/.ssh/cio_deploy\n  IdentitiesOnly yes\n" >> ~/.ssh/config'
sudo -iu cio bash -c '
  git clone git@github.com:gavacharles/cio-construction-costs.git /srv/cio-construction-costs &&
  cd /srv/cio-construction-costs && python3 -m venv .venv &&
  .venv/bin/pip install -r requirements.txt'
```

## 2. Secrets

```bash
sudo mkdir -p /etc/cio
sudo cp /srv/cio-construction-costs/deploy/cio.env.example /etc/cio/cio.env
sudo nano /etc/cio/cio.env          # set CIO_ADMIN_KEY to a long random password
sudo chown root:cio /etc/cio/cio.env && sudo chmod 640 /etc/cio/cio.env   # readable by the app user's jobs
```

Generate a password with `openssl rand -base64 24`. Keep it in a password manager.

## 3. For a demo: seed the demo database

```bash
sudo -iu cio bash -c 'cd /srv/cio-construction-costs && .venv/bin/python src/webapp/seed_demo.py --db data/live/demo.sqlite'
```

It prints an invite code for each demo participant (Uganda, Kenya, Rwanda). In `/etc/cio/cio.env`,
set `CIO_DB=/srv/cio-construction-costs/data/live/demo.sqlite` and `CIO_DEMO=1`. Every page then shows a
"Demo — illustrative sample data" banner.

For the **live** pilot, leave `CIO_DB` at `exchange.sqlite` and leave `CIO_DEMO` unset. Never seed
the live database; the script refuses the name `exchange.sqlite`.

## 4. Start the app and HTTPS

```bash
sudo cp /srv/cio-construction-costs/deploy/cio-app.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now cio-app
sudo cp /srv/cio-construction-costs/deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile      # replace pilot.example.com with your domain
sudo systemctl reload caddy         # fetches the HTTPS certificate automatically
```

Check:
- `systemctl status cio-app` shows active.
- `https://<your-domain>` shows the invite-code page.
- `https://<your-domain>/admin` asks for the admin password.

## 5. Automation and backups

```bash
sudo -iu cio crontab /srv/cio-construction-costs/deploy/crontab.example
sudo -iu cio bash -c 'cd /srv/cio-construction-costs && .venv/bin/python src/market/cycle.py weekly'   # first notes now
```

| Job | Schedule |
|---|---|
| Harvest UBOS and KNBS, settle contracts, open new ones | Daily 06:30 |
| Weekly notes | Monday 05:00 |
| Database backup to `/srv/cio_backups` (30 days kept) | Nightly 02:00 |

Also copy `/srv/cio_backups` off the server, e.g. with `rclone` to cloud storage.

## 6. Run the demo

1. Open `https://<your-domain>` on a phone and enter a demo invite code.
2. Walk through:
   - **Contracts:** Uganda monthly, Kenya quarterly. Show crowd vs model, then place a trade.
   - **Report prices:** submit a price, then show the median table.
   - **Weekly note:** the country's note, including "with vs without new data".
   - **Leaderboard.**
3. As organiser, open `/admin` to show how invitations work.
4. Tell the audience:
   - Points are play money.
   - The demo prices are invented.
   - UBOS data ends April 2026, and the note bridges the gap with oil and exchange-rate data.
   - Kenya's model rests on about 12 test quarters.
   - Rwanda has no official index, so it has price reports and the note only.

## 7. Updating

```bash
sudo -iu cio bash -c 'cd /srv/cio-construction-costs && git pull && .venv/bin/pip install -r requirements.txt'
sudo systemctl restart cio-app
```

## Security notes

- The app listens only on 127.0.0.1; Caddy is the only public entry point, and it uses HTTPS.
- Cookies are HTTPS-only and http-only.
- The organiser password lives in `/etc/cio/cio.env`; it never appears in URLs.
- Failed logins are limited to 10 per IP per 15 minutes.
- The scheduled jobs read `CIO_DB` from `/etc/cio/cio.env`, so on a demo server they update the
  demo database and on the live server the live one.
- Participant data (names, organisations, prices) stays on the server and in backups. It is never
  committed to git: `data/live/` is ignored.
- Before a live pilot, publish a short privacy notice saying what is collected and why.

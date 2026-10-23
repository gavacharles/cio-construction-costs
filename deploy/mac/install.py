#!/usr/bin/env python3
"""
install.py — run CiO Costs on this Mac without anyone starting it (launchd agents, the macOS scheduler).

Installs, for the logged-in user:
  app       the web app on http://127.0.0.1:8000 (restarted if it stops, started at login)
  tunnel    a free Cloudflare quick tunnel to it: the public link (it changes when the tunnel restarts;
            `--status` and /admin show the current one)
  refresh   every 3 hours: drivers → forecasts → data checks → site (only if checks pass) → alerts
  daily     06:30: harvest official data, refit on new releases, robot visitor
  weekly    Monday 05:00: rainfall, exchange-rate history, weekly notes
  monthly   1st of the month 07:00: pilot report
  backup    02:00: database backup to CIO_BACKUP_DIR (default ~/Library/Application Support/cio/backups, 30 days)
A job missed while the Mac was asleep runs when it wakes. Nothing runs while the Mac is off.

Settings and secrets: ~/Library/Application Support/cio/cio.env (created on first install, chmod 600).
Logs: data/live/launchd-<job>.log.

    python3 deploy/mac/install.py            # install or update
    python3 deploy/mac/install.py --status   # what is loaded, last results, the public link
    python3 deploy/mac/install.py --remove   # stop and remove everything (data is kept)
"""
from __future__ import annotations

import argparse
import os
import plistlib
import re
import secrets
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
HOME = Path.home()
CONF_DIR = HOME / "Library" / "Application Support" / "cio"
ENV = CONF_DIR / "cio.env"
AGENTS = HOME / "Library" / "LaunchAgents"
LOGS = REPO / "data" / "live"
PREFIX = "org.ciolab.cio."
RUN = REPO / "deploy" / "mac" / "run.sh"
PY = sys.executable
UID = os.getuid()


def jobs() -> dict[str, dict]:
    cloudflared = shutil.which("cloudflared") or "/opt/homebrew/bin/cloudflared"
    cycle = lambda job: [PY, "-W", "ignore", "src/market/cycle.py", job]
    return {
        "app": {"args": [PY, "-m", "uvicorn", "--app-dir", "src/webapp", "app:app", "--host", "127.0.0.1", "--port", "8000",
                         "--proxy-headers", "--forwarded-allow-ips", "127.0.0.1"], "KeepAlive": True, "RunAtLoad": True},
        "tunnel": {"args": [cloudflared, "tunnel", "--no-autoupdate", "--url", "http://127.0.0.1:8000"],
                   "KeepAlive": True, "RunAtLoad": True},
        "refresh": {"args": cycle("refresh"), "StartInterval": 3 * 3600, "RunAtLoad": True},
        "daily": {"args": cycle("daily"), "StartCalendarInterval": {"Hour": 6, "Minute": 30}},
        "weekly": {"args": cycle("weekly"), "StartCalendarInterval": {"Weekday": 1, "Hour": 5, "Minute": 0}},
        "monthly": {"args": cycle("monthly"), "StartCalendarInterval": {"Day": 1, "Hour": 7, "Minute": 0}},
        "backup": {"args": ["/bin/bash", "deploy/backup.sh"], "StartCalendarInterval": {"Hour": 2, "Minute": 0}},
    }


def write_env() -> None:
    """First install: settings file with a new admin password (kept if the file exists)."""
    if ENV.exists():
        return
    CONF_DIR.mkdir(parents=True, exist_ok=True)
    key = os.environ.get("CIO_ADMIN_KEY") or secrets.token_urlsafe(24)
    backups = CONF_DIR / "backups"          # not OneDrive: macOS stops background jobs from replacing files there
    ENV.write_text(f'''# CiO Costs on this Mac (read by deploy/mac/run.sh). Keep private: it holds the admin password.
CIO_REPO="{REPO}"
CIO_ADMIN_KEY="{key}"
CIO_DB="{REPO}/data/live/exchange.sqlite"
CIO_BACKUP_DIR="{backups}"
CIO_SITE_URL="http://127.0.0.1:8000"
PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
# Optional: email problems in the automatic runs to you (needs an SMTP service):
# CIO_ORGANISER_EMAIL="you@example.com"
# CIO_SMTP_HOST=... CIO_SMTP_PORT=587 CIO_SMTP_USER=... CIO_SMTP_PASS=... CIO_SMTP_FROM=...
''', encoding="utf-8")
    ENV.chmod(0o600)
    print(f"settings written: {ENV} (admin password inside)")


def plist(name: str, spec: dict) -> dict:
    p = {"Label": PREFIX + name, "ProgramArguments": ["/bin/bash", str(RUN), *spec["args"]],
         "WorkingDirectory": str(REPO), "StandardOutPath": str(LOGS / f"launchd-{name}.log"),
         "StandardErrorPath": str(LOGS / f"launchd-{name}.log"), "ProcessType": "Background"}
    for k in ("KeepAlive", "RunAtLoad", "StartInterval", "StartCalendarInterval"):
        if k in spec:
            p[k] = spec[k]
    return p


def launchctl(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["launchctl", *args], capture_output=True, text=True)


def remove() -> None:
    for name in jobs():
        launchctl("bootout", f"gui/{UID}/{PREFIX}{name}")
        (AGENTS / f"{PREFIX}{name}.plist").unlink(missing_ok=True)
    print("removed all CiO Costs agents (data and settings kept)")


def install() -> None:
    write_env()
    RUN.chmod(0o755)
    LOGS.mkdir(parents=True, exist_ok=True)
    AGENTS.mkdir(parents=True, exist_ok=True)
    for name, spec in jobs().items():
        f = AGENTS / f"{PREFIX}{name}.plist"
        launchctl("bootout", f"gui/{UID}/{PREFIX}{name}")          # update: unload the old one first
        f.write_bytes(plistlib.dumps(plist(name, spec)))
        r = launchctl("bootstrap", f"gui/{UID}", str(f))
        print(f"{name:8s} {'installed' if r.returncode == 0 else 'FAILED: ' + (r.stderr.strip() or r.stdout.strip())}")
    print("\nThe public link appears in a few seconds: python3 deploy/mac/install.py --status")


def public_link() -> str | None:
    f = LOGS / "launchd-tunnel.log"
    if not f.exists():
        return None
    found = re.findall(r"https://[a-z0-9-]+\.trycloudflare\.com", f.read_text(errors="replace"))
    return found[-1] if found else None


def status() -> None:
    out = launchctl("list").stdout
    for name in jobs():
        m = re.search(rf"^(\S+)\s+(\S+)\s+{re.escape(PREFIX + name)}$", out, re.M)
        state = "not installed" if not m else (f"running (pid {m.group(1)})" if m.group(1) != "-" else f"waiting (last exit {m.group(2)})")
        print(f"{name:8s} {state}")
    print("public link:", public_link() or "not yet (see data/live/launchd-tunnel.log)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--status", action="store_true")
    g.add_argument("--remove", action="store_true")
    a = ap.parse_args()
    status() if a.status else remove() if a.remove else install()

#!/usr/bin/env bash
# Nightly consistent copy of the participant database (safe while the app is running),
# keeping 30 days. Copy /srv/cio_backups off the server too (e.g. rclone to cloud storage).
set -euo pipefail
DB="${CIO_DB:-/srv/cio-construction-costs/data/live/exchange.sqlite}"
DEST="${CIO_BACKUP_DIR:-/srv/cio_backups}"
mkdir -p "$DEST"
STAMP=$(date +%Y-%m-%d)
TMP=$(mktemp -d)
sqlite3 "$DB" ".backup '$TMP/exchange-$STAMP.sqlite'"
gzip "$TMP/exchange-$STAMP.sqlite"
rm -f "$DEST/exchange-$STAMP.sqlite.gz"                 # a second run the same day replaces that day's copy
mv "$TMP/exchange-$STAMP.sqlite.gz" "$DEST/"
rm -f "$DEST/exchange-$STAMP.sqlite"
rmdir "$TMP"
find "$DEST" -name 'exchange-*.sqlite.gz' -mtime +30 -delete
echo "backup ok: $DEST/exchange-$STAMP.sqlite.gz"

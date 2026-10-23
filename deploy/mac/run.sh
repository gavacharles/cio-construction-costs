#!/bin/bash
# Runs one CiO Costs command with the settings in ~/Library/Application Support/cio/cio.env.
# Used by the launchd agents that deploy/mac/install.py installs.
set -a
. "$HOME/Library/Application Support/cio/cio.env"
set +a
cd "$CIO_REPO" || exit 1
exec "$@"

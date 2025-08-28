#!/bin/sh
set -e
# Initialize Filebrowser database and admin user if not present
DB_PATH=/database/filebrowser.db
CONFIG_PATH=/config/filebrowser.json

if [ ! -f "$DB_PATH" ]; then
  filebrowser config init -a 0.0.0.0 -p 80 -r /srv -c "$CONFIG_PATH" -d "$DB_PATH" >/dev/null 2>&1
  filebrowser users add Bjoern admin25 --perm.admin -d "$DB_PATH" >/dev/null 2>&1 || true
fi

exec filebrowser -c "$CONFIG_PATH" -d "$DB_PATH"

#!/bin/sh
set -e
# Initialize Filebrowser database and admin user if not present
if [ ! -f /database/filebrowser.db ]; then
  filebrowser config init -a 0.0.0.0 -p 80 -r /srv >/dev/null 2>&1
  filebrowser users add Bjoern admin25 --perm.admin >/dev/null 2>&1 || true
fi
exec /init.sh "$@"

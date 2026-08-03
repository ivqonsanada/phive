#!/bin/sh
set -e

# Migrations run on boot so a fresh managed database is usable immediately.
# Set RUN_MIGRATIONS=false if your platform runs them as a separate release step.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force --isolated || true
fi

php artisan config:cache
php artisan route:cache
php artisan event:cache

# Only useful when FILESYSTEM_DISK=public and storage is on a persistent volume.
php artisan storage:link 2>/dev/null || true

exec "$@"

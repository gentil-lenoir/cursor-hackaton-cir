#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v php >/dev/null 2>&1; then
  echo "PHP is not installed. Install PHP 8.3+ and Composer, then retry."
  exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
  echo "Composer is not installed. See https://getcomposer.org/download/"
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  php artisan key:generate
fi

if [ ! -f database/database.sqlite ]; then
  touch database/database.sqlite
fi

composer install
php artisan migrate --seed --force

echo ""
echo "Starting Laravel API on http://0.0.0.0:8000"
echo "Admin login: admin@cir.rw / password"
echo ""

php artisan serve --host=0.0.0.0 --port=8000

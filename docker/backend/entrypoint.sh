#!/usr/bin/env bash
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME:-postgres}"

echo "[entrypoint] Aguardando o PostgreSQL em ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" >/dev/null 2>&1; do
  sleep 1
done
echo "[entrypoint] PostgreSQL disponível."

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "[entrypoint] .env ausente — copiando de .env.example"
  cp .env.example .env
fi

if [ -z "$(grep -E '^APP_KEY=.+' .env 2>/dev/null)" ]; then
  echo "[entrypoint] Gerando APP_KEY..."
  php artisan key:generate --force
fi

echo "[entrypoint] Executando migrations..."
php artisan migrate --force

echo "[entrypoint] Executando seeders..."
php artisan db:seed --force || echo "[entrypoint] Nenhum seeder executado (ainda não implementado ou já semeado)."

echo "[entrypoint] Subindo o servidor Laravel (AtendSaude) em 0.0.0.0:8000..."
exec php artisan serve --host=0.0.0.0 --port=8000

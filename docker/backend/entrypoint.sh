#!/usr/bin/env bash
set -e

if [ "$APP_ENV" != "production" ]; then
  DB_HOST="${DB_HOST:-db}"
  DB_PORT="${DB_PORT:-5432}"
  DB_USERNAME="${DB_USERNAME:-postgres}"

  echo "[entrypoint] Aguardando o PostgreSQL em ${DB_HOST}:${DB_PORT}..."
  MAX_TRIES=30
  TRIES=0
  until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" >/dev/null 2>&1 || [ $TRIES -eq $MAX_TRIES ]; do
    sleep 1
    TRIES=$((TRIES+1))
  done
  echo "[entrypoint] Verificação do PostgreSQL concluída."
else
  echo "[entrypoint] Ambiente de produção (Render) detetado. A ignorar o pg_isready."
fi

if [ "$APP_ENV" != "production" ]; then
  if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "[entrypoint] .env ausente — copiando de .env.example"
    cp .env.example .env
  fi

  if [ -z "$(grep -E '^APP_KEY=.+' .env 2>/dev/null)" ]; then
    echo "[entrypoint] A gerar APP_KEY..."
    php artisan key:generate --force
  fi
fi

echo "[entrypoint] A executar migrations..."
php artisan migrate --force

echo "[entrypoint] A executar seeders..."
php artisan db:seed --force || echo "[entrypoint] Nenhum seeder executado (ainda não implementado ou já semeado)."

SERVER_PORT="${PORT:-8000}"

echo "[entrypoint] A iniciar o servidor Laravel em 0.0.0.0:${SERVER_PORT}..."
exec php artisan serve --host=0.0.0.0 --port="${SERVER_PORT}"
# syntax=docker/dockerfile:1
FROM php:8.3-cli-alpine

RUN apk add --no-cache \
        bash \
        git \
        unzip \
        postgresql-client \
        postgresql-dev \
        libzip-dev \
        oniguruma-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql mbstring zip bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copia primeiro apenas os manifests para aproveitar o cache de camadas do
# Docker (o composer install só roda de novo se composer.json/lock mudarem).
# ATENÇÃO: backend/composer.json ainda não existe (será criado na Fase 2 -
# scaffold do Laravel). O build desta imagem só será bem-sucedido a partir
# da Fase 2.
COPY backend/composer.json backend/composer.lock* ./
RUN composer install --no-interaction --no-progress --prefer-dist

COPY backend/ .

COPY docker/backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && sed -i 's/\r$//' /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["entrypoint.sh"]

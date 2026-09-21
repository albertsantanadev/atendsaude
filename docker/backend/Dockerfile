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

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html

COPY backend/composer.json backend/composer.lock* ./

RUN composer install --no-interaction --no-progress --prefer-dist --no-scripts --no-autoloader

COPY backend/ .

RUN composer dump-autoload --optimize

COPY docker/backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && sed -i 's/\r$//' /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["entrypoint.sh"]
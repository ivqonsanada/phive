# Single-image PHive API: nginx + php-fpm behind supervisord.
# Works unchanged on Fly.io, Railway, Render, Coolify, or any Docker host.

FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
      --no-dev \
      --no-scripts \
      --no-autoloader \
      --prefer-dist \
      --no-interaction

COPY . .
RUN composer dump-autoload --optimize --no-dev


FROM php:8.4-fpm-alpine AS runtime

RUN apk add --no-cache nginx supervisor postgresql-dev icu-dev libzip-dev \
    && docker-php-ext-install pdo_pgsql pgsql intl zip opcache bcmath pcntl \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www/html

COPY --from=vendor /app /var/www/html

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/99-phive.ini
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]

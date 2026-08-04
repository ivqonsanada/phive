# Single-image PHive API: Octane on FrankenPHP, plus the queue worker, scheduler and
# (optionally) the Nightwatch agent under supervisord.
#
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


FROM dunglas/frankenphp:php8.4 AS runtime

# `install-php-extensions` ships with the FrankenPHP image and is idempotent — it
# pulls the right system libraries and skips anything the base image already has.
# `docker-php-ext-install` would fail the build on an extension that is already
# compiled in, which opcache typically is here.
RUN apt-get update && apt-get install -y --no-install-recommends supervisor \
    && install-php-extensions pdo_pgsql pgsql intl zip opcache bcmath pcntl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=vendor /app /app

COPY docker/php.ini /usr/local/etc/php/conf.d/99-phive.ini
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]

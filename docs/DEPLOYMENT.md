# Deploying PHive

PHive is two independently deployable apps. Pick any host for each — the only contract
between them is HTTPS plus two environment variables:

| App        | Variable       | Value                                    |
| ---------- | -------------- | ---------------------------------------- |
| `backend`  | `FRONTEND_URL` | Origin of the deployed frontend          |
| `frontend` | `API_URL`      | Origin of the deployed API (no `/api`)   |

`FRONTEND_URL` drives CORS and the links in verification/reset emails. `API_URL` is read
on the server only, so it is never exposed to the browser.

---

## Frontend

### Cloudflare Workers (default)

The repo ships an [OpenNext](https://opennext.js.org/cloudflare) setup.

```bash
cd frontend
pnpm install
pnpm wrangler login

# Point the Worker at your API
pnpm wrangler secret put API_URL

pnpm cf:deploy
```

`pnpm cf:preview` builds and runs the Worker locally in `workerd` — worth doing before a
first deploy, since Node APIs behave differently there than under `next dev`.

Custom domain: add a route in `wrangler.jsonc` or attach one in the Cloudflare dashboard.

For ISR that survives across isolates, switch on the R2 incremental cache — the commented
blocks in `open-next.config.ts` and `wrangler.jsonc` show exactly what to uncomment.

### Vercel

Import the repo and set the root directory to `frontend`; `vercel.json` covers the rest.

### Any Node host / Docker

```bash
docker build -t phive-web ./frontend
docker run -p 3000:3000 -e API_URL=https://api.example.com phive-web
```

Full instructions for all three targets, including the environment variables and their
build-time/runtime distinction, are in [`frontend/DEPLOY.md`](../frontend/DEPLOY.md).

---

## Backend

Every option below uses the same `backend/Dockerfile` — Laravel Octane on FrankenPHP,
plus the queue worker, scheduler and Nightwatch agent under supervisord, listening on
port **8080** with a health check at **`/up`**.

Octane keeps the framework booted between requests instead of rebuilding it each time.
The Filament panel runs on it too — verified that a logged-in admin session does not
bleed into other requests hitting the same persistent worker, and that the API still
resolves each bearer token independently.
Workers recycle every 500 requests, which bounds anything a long-lived worker might
accumulate. If you deploy without Docker, `php artisan octane:start` replaces
php-fpm — but plain php-fpm still works, and nothing in the app depends on Octane.

> **Not yet built anywhere.** The image has been audited statically — COPY sources
> exist, the entrypoint is valid shell, supervisord's absolute paths match `WORKDIR`,
> and Octane resolves the FrankenPHP binary from `PATH` (so it will not try to prompt
> or download one at runtime). But no `docker build` has actually run against it. Do
> one before you rely on it.

Generate `APP_KEY` once and keep it stable; rotating it invalidates encrypted data:

```bash
cd backend && php artisan key:generate --show
```

### Laravel Cloud

No Dockerfile needed. Connect the repo, set the app root to `backend`, attach a Postgres
database, and set `APP_KEY` and `FRONTEND_URL`. Queue worker and scheduler are toggles in
the dashboard, so set `RUN_MIGRATIONS=false` and use the platform's deploy hook instead.

### Fly.io

```bash
cd backend
fly launch --no-deploy            # accept the existing fly.toml
fly postgres create --name phive-db
fly postgres attach phive-db      # sets DATABASE_URL, which fly.toml maps to DB_URL
fly secrets set APP_KEY="base64:..." FRONTEND_URL="https://your-frontend"
fly deploy
```

### Railway / Render / Coolify

Point the service at `backend/` and let it use the Dockerfile (`railway.json` already
does this for Railway). Add a Postgres plugin, then set:

```
APP_KEY=base64:...
APP_ENV=production
APP_DEBUG=false
FRONTEND_URL=https://your-frontend
DB_URL=<connection string from the database plugin>
LOG_CHANNEL=stderr
```

### VPS with Docker Compose

`docker-compose.yml` at the repo root runs Postgres, the API and the frontend together.
It is tuned for local development — for a real server, put a TLS terminator (Caddy,
Traefik, nginx) in front, drop the published `5432` port, and replace the sample database
credentials.

### VPS without Docker

Requires PHP 8.3+, Composer, Postgres, and a web server pointed at `backend/public`.

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan phive:install          # interactive: env, key, database, migrations
php artisan config:cache && php artisan route:cache
```

Then run `php artisan queue:work` and `php artisan schedule:work` under systemd or
supervisor.

---

## Monitoring (Nightwatch)

[Nightwatch](https://nightwatch.laravel.com) reports requests, queries, queue jobs and
exceptions. Set a token and the agent starts reporting; leave it empty and the agent
exits immediately and the app is unaffected.

```
NIGHTWATCH_TOKEN=<from nightwatch.laravel.com>
NIGHTWATCH_ENABLED=true
```

The Docker image runs `nightwatch:agent` under supervisord, and the entrypoint sends
deploy metadata on boot so metrics can be attributed to a release. Without Docker, run
the agent as its own long-lived process next to the app.

## Realtime (Reverb)

Direct messages are pushed over WebSockets. The API image already runs the queue and
scheduler; Reverb is a separate long-running process on its own port:

```bash
php artisan reverb:start --host=0.0.0.0 --port=8080
```

Set the same app credentials on both sides — `REVERB_APP_ID`, `REVERB_APP_KEY`,
`REVERB_APP_SECRET` on the API, and on the frontend:

```
NEXT_PUBLIC_REVERB_APP_KEY=<same as REVERB_APP_KEY>
NEXT_PUBLIC_REVERB_HOST=realtime.example.com
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
```

Terminate TLS in front of Reverb and allow WebSocket upgrades. On Fly.io add a second
service on the Reverb port; on Railway or Render run it as a second service from the
same image with `reverb:start` as the command.

**Cloudflare Workers note:** the browser connects to Reverb directly, so the Worker
does not proxy WebSocket traffic — but `/api/broadcasting/auth` is served by Next.js
and must be reachable, which it is by default.

Leaving `NEXT_PUBLIC_REVERB_APP_KEY` unset disables realtime cleanly; messages still
send and threads still load, they just do not push.

## Demo instances

A public demo drifts: people post nonsense, delete each other's things, upload junk.
`phive:demo-reset` drops every table, reseeds, and clears uploaded files.

```
DEMO_MODE=true
DEMO_RESET_AT=03:00
```

With `DEMO_MODE=true` the reset is scheduled nightly at that local time; without it the
schedule is not even registered, and running the command by hand refuses with an error.
That gate is the whole safety story — **never set `DEMO_MODE` on an instance holding
real data.**

The scheduler has to be running for the nightly job to fire; the Docker image already
runs `schedule:work`. To reset on demand:

```bash
php artisan phive:demo-reset            # prompts first
php artisan phive:demo-reset --force    # no prompt, what the scheduler uses
```

Seeded demo accounts all use the password `password`, including `admin@phive.test`
for the Filament panel — fine for a throwaway demo, unacceptable anywhere else.

## Post-deploy checklist

- [ ] `GET https://api.example.com/up` returns 200
- [ ] `FRONTEND_URL` exactly matches the frontend origin — scheme included, no trailing slash
- [ ] Registering a user delivers a verification email whose link opens the **frontend**
- [ ] `APP_DEBUG=false` and `APP_ENV=production` in production
- [ ] Mail transport configured (`MAIL_MAILER=log` silently swallows every email)
- [ ] Reverb reachable over `wss://` if realtime is enabled, with matching app keys
- [ ] `NIGHTWATCH_TOKEN` set if you want monitoring — it is silently off without one
- [ ] `DEMO_MODE` is **false** anywhere holding real data
- [ ] `TRUSTED_PROXIES` left at `*`, or set to your proxy's addresses — without it
      every visitor looks like the proxy and the rate limits become one shared bucket
- [ ] File uploads have somewhere durable to live — set `FILESYSTEM_DISK=s3` if the
      container filesystem is ephemeral, which it is on Fly, Railway and Render

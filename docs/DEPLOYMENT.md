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

Zero config. Import the repo, set the root directory to `frontend`, add `API_URL`.

### Any Node host / Docker

```bash
docker build -t phive-web ./frontend
docker run -p 3000:3000 -e API_URL=https://api.example.com phive-web
```

---

## Backend

Every option below uses the same `backend/Dockerfile` — nginx + php-fpm + queue worker +
scheduler under supervisord, listening on port **8080**, health check at **`/up`**.

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

## Post-deploy checklist

- [ ] `GET https://api.example.com/up` returns 200
- [ ] `FRONTEND_URL` exactly matches the frontend origin — scheme included, no trailing slash
- [ ] Registering a user delivers a verification email whose link opens the **frontend**
- [ ] `APP_DEBUG=false` and `APP_ENV=production` in production
- [ ] Mail transport configured (`MAIL_MAILER=log` silently swallows every email)
- [ ] File uploads have somewhere durable to live — set `FILESYSTEM_DISK=s3` if the
      container filesystem is ephemeral, which it is on Fly, Railway and Render

# PHive API on Hono

The PHive API on Cloudflare Workers: Hono for routing, D1 (SQLite, via Drizzle) for data,
R2 for uploads, and a Durable Object for realtime. It is a drop-in replacement for the
Laravel API in [`../backend`](../backend). The routes, JSON, status codes and error
messages match, so the frontend switches between the two with `API_URL` and nothing else.

Live: https://api-phive.ivqonsanada.com (demo data, reset nightly).

## Run it

Requires Node 24 and pnpm 12.

```bash
cd backend-hono
pnpm install
cp .dev.vars.example .dev.vars
pnpm db:migrate:local
pnpm db:seed:local          # demo accounts, password "password"
pnpm dev                    # http://localhost:8787
```

Point the frontend at it with `API_URL=http://localhost:8787` in `frontend/.env.local`.
For live messages, add `NEXT_PUBLIC_REVERB_APP_KEY=phive`,
`NEXT_PUBLIC_REVERB_HOST=localhost` and `NEXT_PUBLIC_REVERB_PORT=8787`.

## Test

```bash
pnpm test        # the Laravel feature tests, ported; runs inside workerd with real D1 and R2
pnpm typecheck
```

## Deploy

```bash
pnpm run deploy                               # creates D1 and R2 on the first run
openssl rand -base64 48 | pnpm exec wrangler secret put APP_KEY
pnpm db:migrate:remote
pnpm db:seed:remote                           # only for a demo
```

Edit `routes` and `vars` in `wrangler.jsonc` first: `APP_URL` is this API's origin,
`FRONTEND_URL` the site's. Social sign-in reads `GOOGLE_*` and `APPLE_*` secrets (listed
in `.dev.vars.example`). Email goes to the log until `MAIL_DRIVER=cloudflare` and the
sender domain is enabled with `wrangler email sending enable <domain>`.

## How it maps to Laravel

| Laravel | Here |
| --- | --- |
| PostgreSQL, Eloquent | D1 + Drizzle; the UUIDv7 is the primary key |
| Sanctum tokens | `<id>\|<secret>` bearer tokens, SHA-256 stored |
| bcrypt | PBKDF2-SHA256 on WebCrypto |
| Public disk at `/storage` | R2, served at the same `/storage/...` URLs |
| Reverb | `RealtimeHub`, a Durable Object speaking Pusher protocol 7 |
| `throttle:` middleware | Fixed-window counters in D1 |
| `phive:demo-reset` | Cron trigger, only when `DEMO_MODE=true` |
| Filament admin | Not ported |

Where the port deliberately differs (Laravel bugs it does not copy), and the full
decision log, are in [`docs/PLAN.md`](docs/PLAN.md). The contract it was built from is in
[`docs/contract/`](docs/contract).

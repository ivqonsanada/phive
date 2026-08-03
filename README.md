<p align="center">
  <img src="frontend/public/icons/icon-192x192.png" alt="PHive" width="80" height="80">
</p>

<h1 align="center">PHive</h1>

<p align="center">
  A freelancing platform for college — lecturers publish real projects, students apply
  alone or with a party they recruit, and get paid and certified for finishing them.
</p>

<p align="center">
  <a href="#getting-started">Getting started</a> ·
  <a href="docs/DEPLOYMENT.md">Deployment</a> ·
  <a href="#roadmap">Roadmap</a> ·
  <a href="https://github.com/ivqonsanada/phive/tree/legacy">Legacy version</a>
</p>

---

## What this is

PHive started in 2020 as a Laravel 7 + Vue 2 monolith. This repository is the rewrite:
two independently deployable apps that talk over a JSON API.

```
phive/
├── backend/     Laravel 13 · PHP 8.3+ · PostgreSQL · Sanctum tokens
├── frontend/    Next.js 16 · React 19 · TypeScript · Tailwind 4
├── docs/        Deployment guide and assets
└── docker-compose.yml
```

The original code is preserved on the [`legacy`](https://github.com/ivqonsanada/phive/tree/legacy)
branch, untouched.

### Why two apps

The frontend is edge-deployable (Cloudflare Workers by default) while the API needs PHP
and a database. Splitting them lets each go where it runs best, and makes the API usable
by anything else you want to build later.

### How auth works

Sanctum **personal access tokens**, not stateful cookies — so the two apps never need to
share a root domain.

```
Browser ──▶ Next.js server action ──▶ POST /api/login ──▶ Laravel
                    │                                        │
                    │◀──────────── { user, token } ──────────┘
                    ▼
          httpOnly cookie (phive_token)
                    │
Browser ──▶ Next.js Server Component ──▶ Authorization: Bearer ──▶ Laravel
```

The token lives in an httpOnly cookie and is only ever read on the server, so client-side
JavaScript can never touch it. `src/proxy.ts` does a cheap cookie-presence check for
routing; `requireUser()` in `src/lib/dal.ts` is what actually verifies against the API.

---

## Getting started

**Requirements:** PHP 8.3+, Composer 2, Node 24+, pnpm 10+, PostgreSQL 14+.

```bash
git clone https://github.com/ivqonsanada/phive.git
cd phive
```

### Backend

```bash
cd backend
composer install
php artisan phive:install     # env file, app key, database, migrations, demo data
composer dev                  # serve + queue worker + log tail on :8000
```

`phive:install` asks which database to use and writes the credentials into `.env` for
you. Non-interactively (CI, containers):

```bash
php artisan phive:install --no-interaction-defaults --seed
```

Seeded accounts — password `password` for both:

| Email                 | Role     |
| --------------------- | -------- |
| `lecturer@phive.test` | Lecturer |
| `student@phive.test`  | Student  |

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local    # API_URL=http://localhost:8000
pnpm dev                      # :3000
```

### Everything at once

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

---

## Development

| Task            | Backend                | Frontend         |
| --------------- | ---------------------- | ---------------- |
| Dev server      | `composer dev`         | `pnpm dev`       |
| Tests           | `php artisan test`     | —                |
| Lint / format   | `composer lint` (Pint) | `pnpm lint`      |
| Types           | —                      | `pnpm typecheck` |
| Production build| —                      | `pnpm build`     |

### A note on Next.js 16

Next 16 renamed `middleware.ts` to `proxy.ts` and made `cookies()` async. `frontend/AGENTS.md`
points at the version-accurate docs bundled in `node_modules/next/dist/docs/` — read those
rather than relying on older tutorials.

---

## API

Base URL `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

| Method  | Endpoint                        | Auth | Purpose                        |
| ------- | ------------------------------- | ---- | ------------------------------ |
| `POST`  | `/register`                     | —    | Create an account, get a token |
| `POST`  | `/login`                        | —    | Exchange credentials for a token |
| `POST`  | `/logout`                       | ✓    | Revoke the calling token only  |
| `GET`   | `/user`                         | ✓    | The signed-in user             |
| `PATCH` | `/settings/password`            | ✓    | Change password, keep this device |
| `POST`  | `/password/email`               | —    | Send a reset link              |
| `POST`  | `/password/reset`               | —    | Consume a reset token          |
| `GET`   | `/email/verify/{id}/{hash}`     | —    | Signed verification link       |
| `POST`  | `/email/resend`                 | ✓    | Resend the verification email  |

Lecturer sign-ups are restricted to non-student academic addresses. That rule is
Indonesian-university-specific and lives in `config/phive.php` — change
`lecturer_email_pattern`, or set it to `null` to accept anything.

---

## Roadmap

The data model is fully ported (24 tables, typed Eloquent models, enums for every status
field). Auth is complete end to end. Remaining features, roughly in dependency order:

- [ ] Profile: view, edit, avatar and CV upload, skills, experiences
- [ ] Projects: explore, search, detail, similar projects, wishlist
- [ ] Publishing: draft, post, thumbnail upload, invite students
- [ ] Applying: as an individual, as a team, party recruitment
- [ ] Project Box: shortlist, confirmation, start, terminate, review
- [ ] Inbox and direct messaging (Laravel Reverb replaces the old Pusher setup)
- [ ] Leaderboard

---

## License

MIT — see [LICENSE](LICENSE).

# Hono backend: plan and status

A second, drop-in implementation of the PHive API on Cloudflare Workers, next to the
Laravel one in `backend/`. The frontend picks a backend with `API_URL` alone: same
routes, same JSON, same status codes and messages.

Resume from this file. The exact contract lives in `docs/contract/*.md`, extracted
from the Laravel code and tests. Where a contract file and the Laravel code disagree,
the Laravel code wins, so fix the contract file.

## Why

The Laravel stack needs a PHP host, and a PHP host was how the old VPS got owned (a
PHP web shell). This one runs where the frontend already runs, with no server to
patch: Workers for compute, D1 for data, R2 for uploads, a Durable Object for
realtime.

## Decisions

| Concern | Laravel | Hono |
| --- | --- | --- |
| Database | PostgreSQL, int id + uuid | D1 (SQLite) via Drizzle. The UUIDv7 *is* the primary key; table and column names are unchanged |
| Migrations | artisan | `drizzle-kit generate` → `migrations/*.sql` → `wrangler d1 migrations apply` |
| Tokens | Sanctum personal access tokens | Same idea: random token, SHA-256 stored, revocable per device |
| Passwords | bcrypt | PBKDF2-SHA256 on WebCrypto (100k iterations, the Workers maximum) |
| Uploads | public disk, `/storage/...` | R2, served by the Worker at the same `/storage/...` paths |
| Realtime | Reverb (Pusher protocol) | `RealtimeHub` Durable Object speaking Pusher protocol 7, so Echo works unchanged |
| Rate limits | `throttle:6,1`, `throttle:10,1` | Workers rate-limiting bindings |
| Social codes | cache, 2 min | `social_auth_codes` table, deleted on use |
| Mail | Laravel notifications | `MAIL_DRIVER=log` (dev) or Cloudflare Email Service |
| Demo reset | scheduled artisan command | cron trigger, gated on `DEMO_MODE` |
| Admin panel | Filament at `/admin` | Not ported (see below) |

## Contract gotchas (read before each phase)

The contract files are long; these are the traps their authors flagged.

- Dates serialise with six fractional digits, `2026-08-03T20:13:09.000000Z`, not JS's
  three. The broadcast payload is the exception: `…+00:00`.
- Laravel trims every input and turns `""` into `null` before validating.
- Error bodies vary by source. Bare 403 is `{"message":""}`, a policy failure is
  "This action is unauthorized.", a binding miss is
  `No query results for model [App\\Models\\User] <value>`, a bad signature is
  "Invalid signature.". Several business errors are 409, not 422. 422's message is
  "<first error> (and N more errors)".
- Envelopes differ: only `GET /projects` is paginated
  (`{data, links, meta}`, simple paginator, per_page 9, absolute URLs); show, similar,
  my/projects and wishlist are bare.
- `PATCH my/projects/{p}` always rewrites status: Draft without `publish`, Hiring with it.
- Draft detail and draft wishlist toggle are 404 even for the owner; `/similar` on a
  draft is 200.
- Inviting a student creates an empty project team row, so `team` stops being null.
- `GET messages/{tagname}` creates the conversation and marks inbox rows read. Each new
  message replaces the conversation's single inbox row.
- A missing `accept` means no: confirm bails out, respond declines.
- Channel auth is `POST /broadcasting/auth` (not under `/api`); one channel
  `private-user.{uuid}`, one event `message.sent`.
- Upload folders: `avatars/`, `cv/`, `project-thumbnails/`; Laravel picks the extension
  by sniffing content, not by trusting the client.
- The frontend only accepts verification links that start with its `API_URL`.

## Deliberate differences from Laravel

Laravel behaviour that is a bug, so the port does not copy it. Each needs a test.

- Throttle buckets are per route and client. Laravel keys them on the client only, so
  every guarded route shares one counter, and since the Next server makes the calls,
  the whole site shares it.
- A null for a NOT NULL column (blank "Team size" on create, clearing last name in
  settings, `skills: null`) is a 422 or falls back to the column default, never a 500.
- Register returns `is_open_hired: false`, not `null`.
- Passwords are PBKDF2. Only migrated Laravel users would have bcrypt hashes; if that
  ever matters, verify `$2y$` with bcryptjs once and rehash on login.
- The review form's `review` is the resource shape with UUIDs; integer ids do not exist here.
- Public profiles return `email` and `identity_number` as null unless you are viewing
  your own. Laravel published both for everyone.
- A mail transport failure is logged, not a 500 (the user/reset row already exists).
- Verification links are signed over `APP_URL`, not the request host, and carry the
  user's UUID. `APP_URL` must equal the frontend's `API_URL`.
- Social sign-in state is a signed `state` plus a short-lived cookie, so Apple's
  cross-site form POST works (it never could through Laravel's session + CSRF).
- Social sign-in onto an existing *unverified* account takes it over (password
  cleared, tokens revoked, marked verified) instead of linking silently, which let
  whoever pre-registered the address keep access.
- The social exchange mints the token at exchange time; nothing plaintext is stored.
- The draft-detail 404 names the slug, not Laravel's leaked integer id.
- Saving a project (PATCH) only moves it between Draft and Hiring. Laravel rewrote the
  status on every save, so "Save draft" demoted Ongoing/Finished projects to Draft.
- A null for a NOT NULL project column means its default; `skills: null` /
  `requirements: null` clear the list (all three were 500s).
- Create returns the stored project (defaults filled in), not Laravel's in-memory model.
- Deleting a project deletes its thumbnail from R2.
- A repeated member in a team application is de-duplicated (Laravel: 500).

## Phases

- [x] 0. Scaffold: wrangler, Drizzle schema + migration, vitest pool, realtime hub
- [x] Contracts extracted: `docs/contract/{auth-users,projects,collaboration}.md`
      (each ends with Shared logic and Open questions)
- [x] 1. Core: errors and 422 format, auth middleware, pagination, CORS, storage
- [x] 2. Auth: register, login, logout, user, password change/reset, email verify
- [x] 3. Public reads: home, projects, project detail, similar, profiles, leaderboards
- [x] 4. Settings: profile, avatar, CV, experiences (+ wishlist from phase 6)
- [x] 5. Lecturer projects: CRUD, publish, close, thumbnail, invite
- [x] 6. Wishlist, party, applications
- [x] 7. Project box, shortlist, start, review, leaderboard points
- [x] 8. Inbox, messages, realtime broadcasts and channel auth
- [x] 9. Social sign-in (Google, Apple) and the code exchange (no live provider test yet)
- [x] 10. Demo seed and nightly reset
- [x] Deployed 2026-11-04: worker `phive-api` at https://api-phive.ivqonsanada.com, D1 `phive`,
      R2 `phive-uploads`, APP_KEY secret set, migration + demo seed applied, DEMO_MODE on
- [ ] 11. Docs (README, DEPLOYMENT), CI job, frontend env notes
- [x] 12. Frontend pointed at it and moved to https://phive.ivqonsanada.com (phive.ivqon.dev was
      detached on 2026-11-04). Build with `.env.local` moved aside (OpenNext bundles it) and
      `API_URL=https://api-phive.ivqonsanada.com NEXT_PUBLIC_REVERB_APP_KEY=phive
      NEXT_PUBLIC_REVERB_HOST=api-phive.ivqonsanada.com NEXT_PUBLIC_REVERB_PORT=443
      NEXT_PUBLIC_REVERB_SCHEME=https`; `frontend/worker.ts` wraps OpenNext to 410 spam URLs
- [ ] 13. Mail: `wrangler email sending enable ivqonsanada.com`, then MAIL_DRIVER=cloudflare
- [ ] 14. Google/Apple credentials as secrets, if social sign-in is wanted

Each phase ports the matching Laravel feature tests to `test/`. Run them with
`pnpm test` (the pnpm 12 binary; see the memory note) — they run inside workerd with
real D1 and R2.

## Not ported

- **Filament admin.** No PHP means no Filament. Until there is a replacement, manage
  data with `wrangler d1 execute` or the D1 console.

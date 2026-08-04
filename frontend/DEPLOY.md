# Deploying the frontend

The same codebase deploys to either target with no code changes. Pick one.

Both need the API to be reachable, and both are configured by environment variables
rather than by editing files:

| Variable                      | Required | What it is                                        |
| ----------------------------- | -------- | ------------------------------------------------- |
| `API_URL`                     | yes      | Origin of the Laravel API, no `/api` suffix        |
| `NEXT_PUBLIC_REVERB_APP_KEY`  | no       | Enables live messages; leave empty to disable      |
| `NEXT_PUBLIC_REVERB_HOST`     | no       | Reverb hostname                                    |
| `NEXT_PUBLIC_REVERB_PORT`     | no       | `443` behind TLS                                   |
| `NEXT_PUBLIC_REVERB_SCHEME`   | no       | `https` behind TLS                                 |

`API_URL` is read on the server only and never reaches the browser. The `NEXT_PUBLIC_`
values are baked into the client bundle **at build time**, so changing them requires a
rebuild, not just a restart.

Remember to add the deployed frontend origin to `FRONTEND_URL` on the API, or CORS
will reject it and the emails will link to the wrong place.

---

## Vercel

```bash
cd frontend
pnpm dlx vercel link
pnpm dlx vercel env add API_URL production
pnpm dlx vercel --prod
```

Or from the dashboard: import the repo and **set the root directory to `frontend`** —
that is the only non-default setting. `vercel.json` pins the rest.

The Cloudflare adapter in `devDependencies` is inert here; Vercel never runs it.

---

## Cloudflare Workers

Uses [OpenNext](https://opennext.js.org/cloudflare), already configured in
`open-next.config.ts` and `wrangler.jsonc`.

```bash
cd frontend
pnpm install
pnpm wrangler login

pnpm cf:deploy
```

`wrangler.jsonc` ships a `routes` entry binding the Worker to `phive.ivqon.dev`.
Wrangler creates and manages that DNS record itself, so the zone only has to exist in
the same account. Point it elsewhere by editing the pattern, or delete the block to
serve from the generated `*.workers.dev` URL instead.

Set the API origin before expecting anything to work. It is a plain URL rather than a
credential, so it lives in `vars` — edit `wrangler.jsonc` and redeploy:

```jsonc
"vars": { "API_URL": "https://api.example.com" }
```

Until it points at a reachable backend, every route that renders API data returns 500
and the home page hangs on its `Loading…` fallback. `/login` and `/register` still
render, which makes a 200 on the root a misleading smoke test — check `/explore`.

Preview the real Worker runtime locally before a first deploy — `workerd` behaves
differently from Node in ways `next dev` will not show you:

```bash
pnpm cf:preview
```

This has been exercised: public and authenticated pages render, the httpOnly session
cookie resolves the right user, server-rendered API data comes through, guest redirects
work, and `/api/broadcasting/auth` returns 401 without a session — all inside `workerd`,
not just under `next start`.

Public variables go in the `vars` block of `wrangler.jsonc`. Do not also declare a
secret of the same name — a secret and a var sharing a key is a conflict rather than an
override.

For ISR that survives across isolates, switch on the R2 incremental cache — the
commented blocks in `open-next.config.ts` and `wrangler.jsonc` show what to uncomment.

**No Proxy/Middleware:** Next 16's Proxy runs on the Node.js runtime and cannot be
switched to edge, which OpenNext cannot deploy. This app has none — every protected page
enforces auth itself through `requireUser()`. Adding a `proxy.ts` will break `cf:build`.

**Realtime note:** the browser connects to Reverb directly, so the Worker never
proxies WebSocket traffic. `/api/broadcasting/auth` is served by Next itself and works
on both targets.

---

## Self-hosted (Docker)

```bash
docker build -t phive-web ./frontend
docker run -p 3000:3000 -e API_URL=https://api.example.com phive-web
```

The image deliberately does not use `output: "standalone"`, because that changes the
build layout the Cloudflare adapter expects.

---

## Checklist

- [ ] `API_URL` set, with no trailing slash and no `/api`
- [ ] API's `FRONTEND_URL` includes this deployment's origin
- [ ] If realtime is wanted: `NEXT_PUBLIC_REVERB_*` set **and** a rebuild done
- [ ] Signing in works — that exercises the API, cookies and CORS in one go

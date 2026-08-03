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

pnpm wrangler secret put API_URL
pnpm cf:deploy
```

Preview the real Worker runtime locally before a first deploy — `workerd` behaves
differently from Node in ways `next dev` will not show you:

```bash
pnpm cf:preview
```

Public variables go in the `vars` block of `wrangler.jsonc` (they are not secret);
`API_URL` is better as a secret since it is server-side only.

For ISR that survives across isolates, switch on the R2 incremental cache — the
commented blocks in `open-next.config.ts` and `wrangler.jsonc` show what to uncomment.

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

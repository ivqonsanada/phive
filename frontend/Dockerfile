# Self-hosted Next.js server. Only needed if you are NOT deploying to Cloudflare
# Workers — for Cloudflare use `pnpm cf:deploy` (see wrangler.jsonc) instead.
#
# `output: "standalone"` is deliberately not used: it changes the build layout that
# the OpenNext Cloudflare adapter expects, and this image is the secondary path.

FROM node:24-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN addgroup -g 1001 -S nextjs && adduser -S -u 1001 -G nextjs nextjs
USER nextjs

EXPOSE 3000
CMD ["pnpm", "start"]

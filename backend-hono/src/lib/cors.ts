/**
 * fruitcake/php-cors as configured in backend/config/cors.php, for `/api/*` only.
 *
 * With a single configured origin, Laravel sends it unconditionally, whatever the
 * request's Origin. With several, it echoes a listed Origin and adds `Vary: Origin`.
 * No credentials, no exposed headers, preflights cached for a day.
 */
import { createMiddleware } from "hono/factory";

import type { AppEnv } from "../env";

export function frontendOrigins(value: string): string[] {
  return value
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export const cors = createMiddleware<AppEnv>(async (c, next) => {
  const origins = frontendOrigins(c.env.FRONTEND_URL);
  const requestOrigin = c.req.header("origin");
  const vary: string[] = [];

  let allowOrigin: string | null = null;
  if (origins.length === 1) {
    allowOrigin = origins[0]!;
  } else {
    vary.push("Origin");
    if (requestOrigin && origins.includes(requestOrigin)) allowOrigin = requestOrigin;
  }

  if (c.req.method === "OPTIONS" && c.req.header("access-control-request-method")) {
    const headers = new Headers();
    if (allowOrigin) {
      headers.set("Access-Control-Allow-Origin", allowOrigin);
      headers.set(
        "Access-Control-Allow-Methods",
        c.req.header("access-control-request-method")!.toUpperCase(),
      );
      const requested = c.req.header("access-control-request-headers");
      if (requested) headers.set("Access-Control-Allow-Headers", requested);
      headers.set("Access-Control-Max-Age", "86400");
      vary.push("Access-Control-Request-Method", "Access-Control-Request-Headers");
    }
    if (vary.length) headers.set("Vary", vary.join(", "));
    return new Response(null, { status: 204, headers });
  }

  await next();
  if (allowOrigin) c.res.headers.set("Access-Control-Allow-Origin", allowOrigin);
  if (vary.length) c.res.headers.append("Vary", vary.join(", "));
});

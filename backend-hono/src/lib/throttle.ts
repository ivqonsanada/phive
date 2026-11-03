/**
 * Laravel's fixed-window rate limiter on D1: the first hit opens a window of
 * `decay` seconds, later hits count against it, and it resets when the window ends.
 *
 * Unlike Laravel, each throttled route gets its own counter. Laravel keys only on
 * the client, so register, password/email, email/verify, email/resend and
 * auth/exchange all drew from one bucket.
 */
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

import type { AppEnv } from "../env";
import { sha256 } from "./crypto";
import { HttpError } from "./http";

export function clientIp(c: Context): string {
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown"
  );
}

export async function hit(
  db: D1Database,
  key: string,
  decaySeconds: number,
): Promise<{ hits: number; resetAt: number }> {
  const now = Date.now();
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key, hits, reset_at) VALUES (?1, 1, ?2)
       ON CONFLICT (key) DO UPDATE SET
         hits = CASE WHEN reset_at <= ?3 THEN 1 ELSE hits + 1 END,
         reset_at = CASE WHEN reset_at <= ?3 THEN ?2 ELSE reset_at END
       RETURNING hits, reset_at`,
    )
    .bind(key, now + decaySeconds * 1000, now)
    .first<{ hits: number; reset_at: number }>();
  return { hits: row!.hits, resetAt: row!.reset_at };
}

/** Seconds until the window ends when `max` is already reached, else null. */
export async function lockedFor(db: D1Database, key: string, max: number): Promise<number | null> {
  const row = await db
    .prepare("SELECT hits, reset_at FROM rate_limits WHERE key = ?1 AND reset_at > ?2")
    .bind(key, Date.now())
    .first<{ hits: number; reset_at: number }>();
  if (!row || row.hits < max) return null;
  return Math.max(0, Math.ceil((row.reset_at - Date.now()) / 1000));
}

export async function clear(db: D1Database, key: string): Promise<void> {
  await db.prepare("DELETE FROM rate_limits WHERE key = ?1").bind(key).run();
}

/** `throttle:max,minutes`, keyed on the signed-in user, or the client IP for guests. */
export function throttle(name: string, max: number, minutes = 1) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");
    const who = user ? `user:${user.id}` : `ip:${clientIp(c)}`;
    const key = `throttle:${name}:${await sha256(who)}`;
    const { hits, resetAt } = await hit(c.env.DB, key, minutes * 60);

    if (hits > max) {
      const retryAfter = Math.max(0, Math.ceil((resetAt - Date.now()) / 1000));
      throw new HttpError(429, "Too Many Attempts.", undefined, {
        "X-RateLimit-Limit": String(max),
        "X-RateLimit-Remaining": "0",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
      });
    }

    await next();
    c.header("X-RateLimit-Limit", String(max));
    c.header("X-RateLimit-Remaining", String(Math.max(0, max - hits)));
  });
}

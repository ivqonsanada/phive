/**
 * Bearer tokens with Sanctum's behaviour: `<id>|<secret>`, SHA-256 of the secret
 * stored, one row per device, never expiring, revocable one at a time.
 *
 * Public routes resolve the token too (to personalise reads) but treat a missing or
 * bad one as a guest rather than a 401.
 */
import { and, eq, ne } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import { personalAccessTokens, users } from "../db/schema";
import type { AppEnv, Database } from "../env";
import { safeEqual, sha256 } from "./crypto";
import { HttpError } from "./http";

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Laravel's Str::random: [A-Za-z0-9]{length}, unbiased. */
export function randomString(length: number): string {
  let out = "";
  while (out.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte < 248 && out.length < length) out += ALPHANUMERIC[byte % 62];
    }
  }
  return out;
}

export async function issueToken(db: Database, userId: string, name: string): Promise<string> {
  const secret = randomString(40);
  const [row] = await db
    .insert(personalAccessTokens)
    .values({ user_id: userId, name, token: await sha256(secret) })
    .returning({ id: personalAccessTokens.id });
  return `${row!.id}|${secret}`;
}

/** The last `Bearer ` in the header, cut at the first comma, as Sanctum reads it. */
function bearer(header: string | undefined): string | null {
  if (!header) return null;
  const at = header.toLowerCase().lastIndexOf("bearer ");
  if (at === -1) return null;
  const token = header.slice(at + 7).split(",")[0]!.trim();
  return token || null;
}

export const resolveUser = createMiddleware<AppEnv>(async (c, next) => {
  c.set("user", null);
  c.set("tokenId", null);

  const token = bearer(c.req.header("authorization"));
  if (token) {
    const db = c.get("db");
    const bar = token.indexOf("|");
    const [id, secret] = bar === -1 ? [null, token] : [token.slice(0, bar), token.slice(bar + 1)];
    const hash = await sha256(secret);

    const [row] = await db
      .select({ token: personalAccessTokens, user: users })
      .from(personalAccessTokens)
      .innerJoin(users, eq(users.id, personalAccessTokens.user_id))
      .where(id ? eq(personalAccessTokens.id, id) : eq(personalAccessTokens.token, hash))
      .limit(1);

    const valid =
      row &&
      secret !== "" &&
      safeEqual(row.token.token, hash) &&
      (!row.token.expires_at || row.token.expires_at > new Date());

    if (valid) {
      c.set("user", row.user);
      c.set("tokenId", row.token.id);
      // Only worth a write once a minute; the column is informational.
      const last = row.token.last_used_at?.getTime() ?? 0;
      if (Date.now() - last > 60_000) {
        c.executionCtx.waitUntil(
          db
            .update(personalAccessTokens)
            .set({ last_used_at: new Date() })
            .where(eq(personalAccessTokens.id, row.token.id))
            .then(() => undefined),
        );
      }
    }
  }

  await next();
});

/** `auth:sanctum`: a 401 that comes before throttling, binding and validation. */
export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.get("user")) throw new HttpError(401, "Unauthenticated.");
  await next();
});

/** The signed-in user, for handlers behind `requireUser`. */
export function currentUser(c: { get(key: "user"): AppEnv["Variables"]["user"] }) {
  const user = c.get("user");
  if (!user) throw new HttpError(401, "Unauthenticated.");
  return user;
}

export async function revokeOtherTokens(db: Database, userId: string, keepId: string | null) {
  await db
    .delete(personalAccessTokens)
    .where(
      keepId
        ? and(eq(personalAccessTokens.user_id, userId), ne(personalAccessTokens.id, keepId))
        : eq(personalAccessTokens.user_id, userId),
    );
}

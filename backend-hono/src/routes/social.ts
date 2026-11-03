/**
 * Google and Apple sign-in. The browser starts at /auth/<provider>/redirect and ends
 * on the frontend's /auth/callback with a single-use code, which the frontend's
 * server swaps for a token at POST /api/auth/exchange. The token never touches a URL.
 *
 * State lives in a signed, short-lived cookie (SameSite=None so Apple's cross-site
 * form POST carries it) rather than Laravel's session, which that POST never had.
 */
import { Apple, decodeIdToken, Google } from "arctic";
import { and, eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { socialAccounts, socialAuthCodes, users } from "../db/schema";
import { USER_ROLES, UserRole } from "../domain/enums";
import { generateTagname, lecturerPattern } from "../domain/users";
import type { AppEnv, Bindings } from "../env";
import { randomString, revokeOtherTokens } from "../lib/auth";
import { hmacHex, randomToken, safeEqual, sha256 } from "../lib/crypto";
import { frontendOrigins } from "../lib/cors";

export const socialRoutes = new Hono<AppEnv>();

type Provider = "google" | "apple";
const LABEL: Record<Provider, string> = { google: "Google", apple: "Apple" };
const COOKIE = "phive_oauth";

const apiRoot = (env: Bindings) => env.APP_URL.replace(/\/$/, "");
const redirectUri = (env: Bindings, provider: Provider) => `${apiRoot(env)}/auth/${provider}/callback`;

function client(env: Bindings, provider: Provider): Google | Apple | null {
  if (provider === "google") {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;
    return new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri(env, provider));
  }
  if (!env.APPLE_CLIENT_ID || !env.APPLE_TEAM_ID || !env.APPLE_KEY_ID || !env.APPLE_PRIVATE_KEY) return null;
  const pem = env.APPLE_PRIVATE_KEY.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const key = Uint8Array.from(atob(pem), (ch) => ch.charCodeAt(0));
  return new Apple(env.APPLE_CLIENT_ID, env.APPLE_TEAM_ID, env.APPLE_KEY_ID, key, redirectUri(env, provider));
}

interface Pending {
  provider: Provider;
  role: string;
  state: string;
  verifier: string;
  expires: number;
}

async function seal(env: Bindings, value: Pending): Promise<string> {
  const body = btoa(JSON.stringify(value));
  return `${body}.${await hmacHex(env.APP_KEY, `oauth:${body}`)}`;
}

async function unseal(env: Bindings, raw: string | undefined): Promise<Pending | null> {
  if (!raw) return null;
  const [body, signature] = raw.split(".");
  if (!body || !signature || !safeEqual(signature, await hmacHex(env.APP_KEY, `oauth:${body}`))) return null;
  try {
    const value = JSON.parse(atob(body)) as Pending;
    return value.expires > Date.now() ? value : null;
  } catch {
    return null;
  }
}

const frontend = (env: Bindings, path: string) => `${frontendOrigins(env.FRONTEND_URL)[0]}${path}`;

function unconfigured(c: Context<AppEnv>, provider: Provider) {
  return c.text(`${LABEL[provider]} sign-in is not configured.`, 503);
}

socialRoutes.get("/auth/:provider{google|apple}/redirect", async (c) => {
  const provider = c.req.param("provider") as Provider;
  const oauth = client(c.env, provider);
  if (!oauth) return unconfigured(c, provider);

  const role = USER_ROLES.includes(c.req.query("role") as never) ? c.req.query("role")! : UserRole.Student;
  const pending: Pending = { provider, role, state: randomToken(), verifier: randomToken(), expires: Date.now() + 10 * 60_000 };
  setCookie(c, COOKIE, await seal(c.env, pending), {
    path: "/auth",
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 600,
  });

  const url =
    oauth instanceof Google
      ? oauth.createAuthorizationURL(pending.state, pending.verifier, ["openid", "profile", "email"])
      : oauth.createAuthorizationURL(pending.state, ["name", "email"]);
  if (oauth instanceof Apple) url.searchParams.set("response_mode", "form_post");
  return c.redirect(url.toString(), 302);
});

interface Identity {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
}

async function identify(oauth: Google | Apple, pending: Pending, params: Record<string, string>): Promise<Identity> {
  if (oauth instanceof Google) {
    const tokens = await oauth.validateAuthorizationCode(params.code ?? "", pending.verifier);
    const claims = decodeIdToken(tokens.idToken()) as Record<string, unknown>;
    // Linking and takeover below trust the address, so Google has to vouch for it.
    const email = claims.email_verified === false ? null : ((claims.email as string | undefined) ?? null);
    return { id: String(claims.sub), email, name: String(claims.name ?? ""), avatar: (claims.picture as string | undefined) ?? null };
  }

  const tokens = await oauth.validateAuthorizationCode(params.code ?? "");
  const claims = decodeIdToken(tokens.idToken()) as Record<string, unknown>;
  // Apple sends the name once, on the first sign-in, as a form field beside the code.
  let name = "";
  try {
    const user = JSON.parse(params.user ?? "{}") as { name?: { firstName?: string; lastName?: string } };
    name = `${user.name?.firstName ?? ""} ${user.name?.lastName ?? ""}`.trim();
  } catch {
    name = "";
  }
  return { id: String(claims.sub), email: (claims.email as string | undefined) ?? null, name, avatar: null };
}

/** The name split Laravel's SocialAuthController used. */
function splitName(name: string): [string, string] {
  if (!name) return ["New", "User"];
  const [first, ...rest] = name.split(/\s+/);
  return [first!, rest.join(" ")];
}

async function callback(c: Context<AppEnv>) {
  const provider = c.req.param("provider") as Provider;
  const oauth = client(c.env, provider);
  if (!oauth) return unconfigured(c, provider);

  const params: Record<string, string> = { ...c.req.query() };
  if (c.req.method === "POST") {
    for (const [k, v] of (await c.req.formData()).entries()) if (typeof v === "string") params[k] = v;
  }

  const pending = await unseal(c.env, getCookie(c, COOKIE));
  deleteCookie(c, COOKIE, { path: "/auth", secure: true, sameSite: "None" });
  const fail = (reason = "social") => c.redirect(frontend(c.env, `/login?error=${reason}`), 302);

  if (!pending || pending.provider !== provider || !params.state || !safeEqual(params.state, pending.state)) return fail();

  let identity: Identity;
  try {
    identity = await identify(oauth, pending, params);
  } catch (error) {
    console.warn("social sign-in failed", provider, error);
    return fail();
  }
  if (!identity.email?.trim()) return fail("social_no_email");
  const email = identity.email.trim();

  const db = c.get("db");
  const [linked] = await db
    .select({ user_id: socialAccounts.user_id })
    .from(socialAccounts)
    .where(and(eq(socialAccounts.provider, provider), eq(socialAccounts.provider_id, identity.id)))
    .limit(1);

  let userId = linked?.user_id;
  if (!userId) {
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      const [sameProvider] = await db
        .select({ id: socialAccounts.id })
        .from(socialAccounts)
        .where(and(eq(socialAccounts.user_id, existing.id), eq(socialAccounts.provider, provider)))
        .limit(1);
      if (sameProvider) return fail();
      if (!existing.email_verified_at) {
        // Whoever registered this address never proved it; the provider just did. Drop
        // their password and sessions rather than hand them a linked account.
        await db.update(users).set({ password: null, email_verified_at: new Date(), updated_at: new Date() }).where(eq(users.id, existing.id));
        await revokeOtherTokens(db, existing.id, null);
      }
      userId = existing.id;
    } else {
      const [first, last] = splitName(identity.name.trim());
      const pattern = lecturerPattern(c.env);
      const role = pending.role === UserRole.Lecturer && (!pattern || pattern.test(email)) ? UserRole.Lecturer : UserRole.Student;
      const [created] = await db
        .insert(users)
        .values({
          first_name: first,
          last_name: last,
          email,
          role,
          password: null,
          email_verified_at: new Date(),
          tagname: await generateTagname(db, identity.name.trim() || email),
        })
        .returning();
      userId = created!.id;
    }
    await db.insert(socialAccounts).values({ user_id: userId, provider, provider_id: identity.id, avatar: identity.avatar });
  }

  const code = randomString(64);
  await db.insert(socialAuthCodes).values({ code: await sha256(code), user_id: userId, provider, expires_at: new Date(Date.now() + 120_000) });
  return c.redirect(frontend(c.env, `/auth/callback?code=${code}`), 302);
}

socialRoutes.get("/auth/:provider{google|apple}/callback", callback);
socialRoutes.post("/auth/:provider{google|apple}/callback", callback);

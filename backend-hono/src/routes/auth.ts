/** Register, login, logout, current user, password change/reset, email verification. */
import { and, eq, gt } from "drizzle-orm";
import { Hono } from "hono";

import { passwordResetTokens, personalAccessTokens, socialAuthCodes, users } from "../db/schema";
import { USER_ROLES } from "../domain/enums";
import {
  emailHash,
  generateTagname,
  hasValidSignature,
  lecturerPattern,
  resetTokenHash,
  verificationUrl,
} from "../domain/users";
import type { AppEnv, Bindings } from "../env";
import { currentUser, issueToken, requireUser, revokeOtherTokens } from "../lib/auth";
import { hashPassword, safeEqual, sha256, verifyPassword } from "../lib/crypto";
import { fieldError, HttpError, modelNotFound, readInput } from "../lib/http";
import { sendMail } from "../lib/mail";
import { resetPasswordMail, verifyEmailMail } from "../lib/mail-templates";
import { clear, clientIp, hit, lockedFor, throttle } from "../lib/throttle";
import {
  check,
  confirmed,
  email,
  max,
  min,
  oneOf,
  regex,
  required,
  string,
  unique,
  validate,
} from "../lib/validator";
import { userResource } from "../resources";
import { loadUserRelations, unreadInboxCount } from "../resources/load";

export const authRoutes = new Hono<AppEnv>();

const newPassword = () => [required(), confirmed(), string(), min(8)];

/** Laravel's Timebox: failures and successes take the same minimum time. */
async function timebox<T>(ms: number, run: () => Promise<T>): Promise<T> {
  const started = Date.now();
  try {
    return await run();
  } finally {
    const left = ms - (Date.now() - started);
    if (left > 0) await new Promise((resolve) => setTimeout(resolve, left));
  }
}

async function sendVerification(env: Bindings, user: { id: string; email: string }) {
  await sendMail(env, verifyEmailMail(env.FRONTEND_URL, user.email, await verificationUrl(env, user)));
}

authRoutes.post("/register", throttle("register", 6), async (c) => {
  const db = c.get("db");
  const input = await readInput(c);
  const pattern = lecturerPattern(c.env);

  const data = await validate(
    input,
    {
      first_name: [required(), string(), max(255)],
      last_name: ["nullable", string(), max(255)],
      role: [required(), oneOf(USER_ROLES)],
      email: [
        required(),
        string(),
        email(),
        max(255),
        unique(async (v) => (await db.select({ id: users.id }).from(users).where(eq(users.email, String(v))).limit(1)).length > 0),
        ...(input.role === "Lecturer" && pattern ? [regex(pattern)] : []),
      ],
      password: newPassword(),
    },
    { "email.regex": "Lecturer accounts require a non-student academic email address." },
  );

  const firstName = data.first_name as string;
  const lastName = (data.last_name as string | null | undefined) ?? "";
  const [user] = await db
    .insert(users)
    .values({
      first_name: firstName,
      last_name: lastName,
      role: data.role as string,
      email: data.email as string,
      password: await hashPassword(data.password as string),
      tagname: await generateTagname(db, `${firstName} ${lastName}`.trim()),
    })
    .returning();

  await sendVerification(c.env, user!);
  const token = await issueToken(db, user!.id, "device_name" in input ? String(input.device_name ?? "") : "phive-web");

  return c.json({ user: userResource(c.env, user!), token }, 201);
});

authRoutes.post("/login", async (c) => {
  const db = c.get("db");
  const data = await validate(await readInput(c), {
    email: [required(), string(), email()],
    password: [required(), string()],
    device_name: ["nullable", string(), max(255)],
  });

  const key = `login:${String(data.email).toLowerCase()}|${clientIp(c)}`;
  const seconds = await lockedFor(c.env.DB, key, 5);
  if (seconds !== null) {
    throw fieldError("email", `Too many login attempts. Please try again in ${seconds} seconds.`, 429);
  }

  const [user] = await db.select().from(users).where(eq(users.email, data.email as string)).limit(1);
  if (!user || !(await verifyPassword(data.password as string, user.password))) {
    await hit(c.env.DB, key, 60);
    throw fieldError("email", "These credentials do not match our records.");
  }

  await clear(c.env.DB, key);
  const name = "device_name" in data ? String(data.device_name ?? "") : "phive-web";
  return c.json({ user: userResource(c.env, user), token: await issueToken(db, user.id, name) });
});

authRoutes.post("/logout", requireUser, async (c) => {
  const tokenId = c.get("tokenId");
  if (tokenId) await c.get("db").delete(personalAccessTokens).where(eq(personalAccessTokens.id, tokenId));
  return c.json({ message: "Signed out." });
});

authRoutes.get("/user", requireUser, async (c) => {
  const db = c.get("db");
  const user = currentUser(c);
  const [relations, unread] = await Promise.all([loadUserRelations(db, user.id), unreadInboxCount(db, user.id)]);
  return c.json(userResource(c.env, user, { ...relations, unread_inbox_count: unread }));
});

authRoutes.patch("/settings/password", requireUser, async (c) => {
  const db = c.get("db");
  const user = currentUser(c);
  const data = await validate(await readInput(c), {
    current_password: [
      required(),
      check("current_password", (v) => verifyPassword(String(v), user.password), "The password is incorrect."),
    ],
    password: newPassword(),
  });

  await db.update(users).set({ password: await hashPassword(data.password as string) }).where(eq(users.id, user.id));
  await revokeOtherTokens(db, user.id, c.get("tokenId"));
  return c.json({ message: "Password updated." });
});

authRoutes.post("/password/email", throttle("password-email", 6), async (c) => {
  const db = c.get("db");
  const data = await validate(await readInput(c), { email: [required(), email()] });
  const address = data.email as string;

  await timebox(200, async () => {
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, address)).limit(1);
    if (!user) return;

    const [recent] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.email, address), gt(passwordResetTokens.created_at, new Date(Date.now() - 60_000))))
      .limit(1);
    if (recent) return;

    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, address));
    await db.insert(passwordResetTokens).values({ email: address, token: await resetTokenHash(token), created_at: new Date() });
    await sendMail(c.env, resetPasswordMail(c.env.FRONTEND_URL, address, token));
  });

  return c.json({ message: "If that address belongs to an account, a reset link is on its way." });
});

authRoutes.post("/password/reset", async (c) => {
  const db = c.get("db");
  const data = await validate(await readInput(c), {
    token: [required(), string()],
    email: [required(), email()],
    password: newPassword(),
  });
  const address = data.email as string;

  return timebox(200, async () => {
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, address)).limit(1);
    if (!user) throw fieldError("email", "We can't find a user with that email address.");

    const [row] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.email, address)).limit(1);
    const fresh = row?.created_at && row.created_at.getTime() + 3_600_000 > Date.now();
    if (!row || !fresh || !safeEqual(row.token, await resetTokenHash(data.token as string))) {
      throw fieldError("email", "This password reset token is invalid.");
    }

    await db.update(users).set({ password: await hashPassword(data.password as string) }).where(eq(users.id, user.id));
    await revokeOtherTokens(db, user.id, null);
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, address));
    return c.json({ message: "Your password has been reset." });
  });
});

authRoutes.get("/email/verify/:id/:hash", throttle("email-verify", 6), async (c) => {
  if (!(await hasValidSignature(c.env, new URL(c.req.url)))) throw new HttpError(403, "Invalid signature.");

  const db = c.get("db");
  const id = c.req.param("id");
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) modelNotFound("User", id);
  if (!safeEqual(c.req.param("hash"), await emailHash(user.email))) {
    throw new HttpError(403, "Invalid verification link.");
  }
  if (user.email_verified_at) return c.json({ message: "Email already verified." });

  await db.update(users).set({ email_verified_at: new Date() }).where(eq(users.id, user.id));
  return c.json({ message: "Email verified." });
});

authRoutes.post("/email/resend", requireUser, throttle("email-resend", 6), async (c) => {
  const user = currentUser(c);
  if (user.email_verified_at) return c.json({ message: "Email already verified." });
  await sendVerification(c.env, user);
  return c.json({ message: "Verification link sent." });
});

authRoutes.post("/auth/exchange", throttle("auth-exchange", 10), async (c) => {
  const db = c.get("db");
  const data = await validate(await readInput(c), { code: [required(), string()] });

  // Delete-and-return in one statement: a code can only ever be redeemed once.
  const [row] = await db
    .delete(socialAuthCodes)
    .where(eq(socialAuthCodes.code, await sha256(data.code as string)))
    .returning();
  if (!row || row.expires_at.getTime() <= Date.now()) {
    throw new HttpError(422, "That sign-in link has expired.");
  }

  const [user] = await db.select().from(users).where(eq(users.id, row.user_id)).limit(1);
  if (!user) throw new HttpError(422, "That account no longer exists.");

  const token = await issueToken(db, user.id, `phive-web-${row.provider}`);
  return c.json({ user: userResource(c.env, user), token });
});

// Expired single-use codes and rate-limit windows, swept by the cron trigger.
export async function sweepExpired(env: Bindings) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM social_auth_codes WHERE expires_at <= ?1").bind(Date.now()),
    env.DB.prepare("DELETE FROM rate_limits WHERE reset_at <= ?1").bind(Date.now()),
  ]);
}

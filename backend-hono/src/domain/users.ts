import { eq } from "drizzle-orm";

import { users } from "../db/schema";
import type { Bindings, Database } from "../env";
import { randomString } from "../lib/auth";
import { hmacHex, safeEqual, sha256 } from "../lib/crypto";

/**
 * Str::slug(name, "") cut to 20 characters, then a random four-character suffix
 * until it is free: "Ada Lovelace" → "adalovelace", then "adalovelacex7k2".
 */
export async function generateTagname(db: Database, name: string): Promise<string> {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/@/g, "at")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
  const base = [...(slug || "user")].slice(0, 20).join("").toLowerCase();

  let tagname = base;
  while ((await db.select({ id: users.id }).from(users).where(eq(users.tagname, tagname)).limit(1)).length) {
    tagname = base + randomString(4).toLowerCase();
  }
  return tagname;
}

export function lecturerPattern(env: Bindings): RegExp | null {
  return env.LECTURER_EMAIL_PATTERN ? new RegExp(env.LECTURER_EMAIL_PATTERN) : null;
}

async function sha1(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const emailHash = sha1;

const VERIFY_MINUTES = 60;

function apiRoot(env: Bindings): string {
  return env.APP_URL.replace(/\/$/, "");
}

/**
 * The signed API URL the verify email carries. It is signed over APP_URL rather than
 * the request's host, so a proxy or service binding in front cannot break it; the
 * frontend accepts only links that start with its own API_URL, which is the same value.
 */
export async function verificationUrl(env: Bindings, user: { id: string; email: string }): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + VERIFY_MINUTES * 60;
  const unsigned = `${apiRoot(env)}/api/email/verify/${user.id}/${await sha1(user.email)}?expires=${expires}`;
  return `${unsigned}&signature=${await hmacHex(env.APP_KEY, unsigned)}`;
}

/** The `signed` middleware: every query parameter but `signature`, in order, and `expires`. */
export async function hasValidSignature(env: Bindings, url: URL): Promise<boolean> {
  const signature = url.searchParams.get("signature");
  if (!signature) return false;
  const rest = [...url.searchParams].filter(([k]) => k !== "signature");
  const query = new URLSearchParams(rest).toString();
  const unsigned = `${apiRoot(env)}${url.pathname}${query ? `?${query}` : ""}`;
  const expected = await hmacHex(env.APP_KEY, unsigned);
  const expires = url.searchParams.get("expires");
  return safeEqual(signature, expected) && (!expires || Date.now() / 1000 <= Number(expires));
}

export async function resetTokenHash(token: string): Promise<string> {
  return sha256(token);
}

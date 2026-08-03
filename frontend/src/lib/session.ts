import "server-only";

import { cookies } from "next/headers";

const COOKIE_NAME = "phive_token";

/**
 * The session is the Sanctum bearer token itself, kept in an httpOnly cookie so it
 * is never readable from client JavaScript. Every call to the API happens on the
 * server, which reads the cookie and forwards the token as an Authorization header.
 */
export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function createSession(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

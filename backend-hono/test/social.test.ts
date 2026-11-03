/** Ports of SocialLoginTest that do not need a live provider. */
import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

import { app } from "../src/app";
import * as schema from "../src/db/schema";
import { sha256 } from "../src/lib/crypto";
import { call, db, makeUser } from "./helpers";

const withGoogle = { ...env, GOOGLE_CLIENT_ID: "client", GOOGLE_CLIENT_SECRET: "secret" };

describe("social sign-in", () => {
  it("is a 404 for an unknown provider and a 503 when unconfigured", async () => {
    expect((await call("/auth/github/redirect")).status).toBe(404);
    const res = await call("/auth/google/redirect");
    expect(res.status).toBe(503);
    expect(res.json).toBe("Google sign-in is not configured.");
  });

  it("redirects to Google with PKCE and a signed state cookie", async () => {
    const res = await app.request("http://localhost:8787/auth/google/redirect?role=Lecturer", {}, withGoogle);
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("location")!);
    expect(location.hostname).toBe("accounts.google.com");
    expect(location.searchParams.get("redirect_uri")).toBe("http://localhost:8787/auth/google/callback");
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    expect(res.headers.get("set-cookie")).toMatch(/phive_oauth=.*HttpOnly.*Secure.*SameSite=None/i);
  });

  it("sends a callback without a matching state back to the login page", async () => {
    const res = await app.request("http://localhost:8787/auth/google/callback?code=x&state=forged", {}, withGoogle);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=social");
  });

  it("exchanges a code for a token exactly once", async () => {
    const user = await makeUser();
    await db.insert(schema.socialAuthCodes).values({
      code: await sha256("the-code"),
      user_id: user.id,
      provider: "google",
      expires_at: new Date(Date.now() + 60_000),
    });
    const first = await call("/api/auth/exchange", { method: "POST", body: { code: "the-code" } });
    expect(first.status).toBe(200);
    expect(first.json.user.uuid).toBe(user.id);
    expect((await call("/api/user", { token: first.json.token })).status).toBe(200);

    const second = await call("/api/auth/exchange", { method: "POST", body: { code: "the-code" } });
    expect(second.status).toBe(422);
    expect(second.json).toEqual({ message: "That sign-in link has expired." });
    expect((await call("/api/auth/exchange", { method: "POST", body: { code: "a".repeat(64) } })).status).toBe(422);
  });
});

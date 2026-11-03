/** Ports of backend/tests/Feature/Auth/*, CurrentUserTest and the HTTP basics. */
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { passwordResetTokens, personalAccessTokens, users } from "../src/db/schema";
import { verifyPassword } from "../src/lib/crypto";
import { call, db, makeUser, outbox, tokenFor } from "./helpers";

beforeEach(() => {
  outbox.length = 0;
});

const register = (body: Record<string, unknown>) =>
  call("/api/register", {
    method: "POST",
    body: { password: "secret-pass", password_confirmation: "secret-pass", ...body },
    headers: { "CF-Connecting-IP": crypto.randomUUID() },
  });

describe("registration", () => {
  it("registers a student and returns an api token", async () => {
    const res = await register({ first_name: "Ada", last_name: "Lovelace", role: "Student", email: "ada@example.com" });
    expect(res.status).toBe(201);
    expect(res.json.user.email).toBe("ada@example.com");
    expect(res.json.user.role).toBe("Student");
    expect(res.json.user).toMatchObject({ tagname: "adalovelace", name: "Ada Lovelace", is_open_hired: false });
    expect(res.json.token).toMatch(/\|/);
    expect(outbox[0]?.subject).toBe("Verify your email address");
    expect(outbox[0]?.text).toContain("http://localhost:3000/email/verify?url=");
  });

  it("summarises every validation error", async () => {
    const res = await call("/api/register", { method: "POST", body: {} });
    expect(res.status).toBe(422);
    expect(res.json.message).toBe("The first name field is required. (and 3 more errors)");
    expect(Object.keys(res.json.errors)).toEqual(["first_name", "role", "email", "password"]);
  });

  it("rejects a lecturer signing up with a student address", async () => {
    const res = await register({ first_name: "Grace", role: "Lecturer", email: "grace@student.example.ac.id" });
    expect(res.status).toBe(422);
    expect(res.json.errors.email).toEqual(["Lecturer accounts require a non-student academic email address."]);
  });

  it("accepts a lecturer with a staff academic address", async () => {
    const res = await register({ first_name: "Grace", role: "Lecturer", email: "grace@example.ac.id" });
    expect(res.status).toBe(201);
    expect(res.json.user.role).toBe("Lecturer");
  });

  it("gives colliding names distinct tagnames", async () => {
    const a = await register({ first_name: "Sam", role: "Student", email: "sam1@example.com" });
    const b = await register({ first_name: "Sam", role: "Student", email: "sam2@example.com" });
    expect(a.json.user.tagname).toBe("sam");
    expect(b.json.user.tagname).toMatch(/^sam[a-z0-9]{4}$/);
  });

  it("ignores an attempt to grant the admin flag", async () => {
    const res = await register({ first_name: "Eve", role: "Student", email: "eve@example.com", is_admin: true });
    const [row] = await db.select().from(users).where(eq(users.id, res.json.user.uuid));
    expect(row!.is_admin).toBe(false);
  });

  it("throttles after six attempts a minute", async () => {
    const headers = { "CF-Connecting-IP": "203.0.113.7" };
    for (let i = 0; i < 6; i++) await call("/api/register", { method: "POST", body: {}, headers });
    const res = await call("/api/register", { method: "POST", body: {}, headers });
    expect(res.status).toBe(429);
    expect(res.json.message).toBe("Too Many Attempts.");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });
});

describe("login", () => {
  it("issues a token for valid credentials", async () => {
    const user = await makeUser({ email: "ada@example.com" });
    const res = await call("/api/login", {
      method: "POST",
      body: { email: "ada@example.com", password: "password", device_name: "integration-test" },
    });
    expect(res.status).toBe(200);
    expect(res.json.user.uuid).toBe(user.id);
    const [token] = await db.select().from(personalAccessTokens).where(eq(personalAccessTokens.user_id, user.id));
    expect(token!.name).toBe("integration-test");
  });

  it("rejects a wrong password", async () => {
    await makeUser({ email: "ada@example.com" });
    const res = await call("/api/login", { method: "POST", body: { email: "ada@example.com", password: "nope" } });
    expect(res.status).toBe(422);
    expect(res.json).toEqual({
      message: "These credentials do not match our records.",
      errors: { email: ["These credentials do not match our records."] },
    });
  });

  it("throttles repeated failures", async () => {
    await makeUser({ email: "ada@example.com" });
    const attempt = () => call("/api/login", { method: "POST", body: { email: "ada@example.com", password: "nope" } });
    for (let i = 0; i < 5; i++) expect((await attempt()).status).toBe(422);
    const res = await attempt();
    expect(res.status).toBe(429);
    expect(res.json.message).toMatch(/^Too many login attempts\. Please try again in \d+ seconds\.$/);
  });

  it("logging out revokes only the current token", async () => {
    const user = await makeUser();
    const first = await tokenFor(user);
    const second = await tokenFor(user);
    expect((await call("/api/logout", { method: "POST", token: first })).json).toEqual({ message: "Signed out." });
    expect((await call("/api/user", { token: first })).status).toBe(401);
    expect((await call("/api/user", { token: second })).status).toBe(200);
  });

  it("the user endpoint requires a token", async () => {
    const res = await call("/api/user");
    expect(res.status).toBe(401);
    expect(res.json).toEqual({ message: "Unauthenticated." });
  });
});

describe("current user", () => {
  it("returns the user unwrapped, with relations and no secrets", async () => {
    const user = await makeUser({ first_name: "Ada", last_name: "Lovelace" });
    const res = await call("/api/user", { token: await tokenFor(user) });
    expect(res.status).toBe(200);
    expect(res.json.data).toBeUndefined();
    expect(res.json).toMatchObject({ uuid: user.id, name: "Ada Lovelace", unread_inbox_count: 0, points: 0, level: "Rookie" });
    expect(res.json.skills).toEqual([]);
    expect(res.json.created_at).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000000Z$/);
    for (const hidden of ["id", "password", "is_admin", "email_verified_at", "updated_at"]) {
      expect(res.json).not.toHaveProperty(hidden);
    }
  });
});

describe("passwords", () => {
  it("changing the password keeps the current device signed in", async () => {
    const user = await makeUser();
    const current = await tokenFor(user);
    const other = await tokenFor(user);
    const res = await call("/api/settings/password", {
      method: "PATCH",
      token: current,
      body: { current_password: "password", password: "new-password", password_confirmation: "new-password" },
    });
    expect(res.json).toEqual({ message: "Password updated." });
    expect((await call("/api/user", { token: current })).status).toBe(200);
    expect((await call("/api/user", { token: other })).status).toBe(401);
  });

  it("reports every password error", async () => {
    const user = await makeUser();
    const res = await call("/api/settings/password", {
      method: "PATCH",
      token: await tokenFor(user),
      body: { current_password: "wrong", password: "short", password_confirmation: "other" },
    });
    expect(res.json).toEqual({
      message: "The password is incorrect. (and 2 more errors)",
      errors: {
        current_password: ["The password is incorrect."],
        password: ["The password field confirmation does not match.", "The password field must be at least 8 characters."],
      },
    });
  });

  it("emails a reset link pointing at the frontend, and resets once", async () => {
    const user = await makeUser({ email: "ada@example.com" });
    const old = await tokenFor(user);
    const sent = await call("/api/password/email", { method: "POST", body: { email: "ada@example.com" } });
    expect(sent.json.message).toBe("If that address belongs to an account, a reset link is on its way.");

    const link = /http:\/\/localhost:3000\/password\/reset\?token=([0-9a-f]{64})&email=ada%40example\.com/.exec(outbox[0]!.text);
    expect(link).not.toBeNull();

    const reset = await call("/api/password/reset", {
      method: "POST",
      body: { token: link![1], email: "ada@example.com", password: "brand-new-pass", password_confirmation: "brand-new-pass" },
    });
    expect(reset.json).toEqual({ message: "Your password has been reset." });
    const [row] = await db.select().from(users).where(eq(users.id, user.id));
    expect(await verifyPassword("brand-new-pass", row!.password)).toBe(true);
    expect((await call("/api/user", { token: old })).status).toBe(401);
    expect(await db.select().from(passwordResetTokens)).toHaveLength(0);
  });

  it("does not reveal whether an address exists", async () => {
    const res = await call("/api/password/email", { method: "POST", body: { email: "nobody@example.com" } });
    expect(res.status).toBe(200);
    expect(res.json.message).toBe("If that address belongs to an account, a reset link is on its way.");
    expect(outbox).toHaveLength(0);
  });

  it("refuses a bad reset token", async () => {
    await makeUser({ email: "ada@example.com" });
    const res = await call("/api/password/reset", {
      method: "POST",
      body: { token: "x", email: "ada@example.com", password: "brand-new-pass", password_confirmation: "brand-new-pass" },
    });
    expect(res.status).toBe(422);
    expect(res.json.errors.email).toEqual(["This password reset token is invalid."]);
  });
});

describe("email verification", () => {
  async function linkFor(email: string) {
    await register({ first_name: "Ada", role: "Student", email });
    const encoded = /email\/verify\?url=(\S+)/.exec(outbox.at(-1)!.text)![1]!;
    return new URLSearchParams(`url=${encoded}`).get("url")!;
  }

  it("a signed link verifies the address", async () => {
    const url = await linkFor("ada@example.com");
    expect(url.startsWith("http://localhost:8787/api/email/verify/")).toBe(true);
    expect((await call(url)).json).toEqual({ message: "Email verified." });
    expect((await call(url)).json).toEqual({ message: "Email already verified." });
  });

  it("an unsigned link is rejected", async () => {
    const url = await linkFor("ada@example.com");
    const res = await call(url.replace(/&signature=.*/, ""));
    expect(res.status).toBe(403);
    expect(res.json).toEqual({ message: "Invalid signature." });
  });

  it("a tampered link is rejected", async () => {
    const url = await linkFor("ada@example.com");
    expect((await call(url.replace(/expires=\d+/, "expires=9999999999"))).status).toBe(403);
  });
});

describe("http basics", () => {
  it("renders laravel's 404 and 405", async () => {
    expect((await call("/api/nope")).json).toEqual({ message: "The route api/nope could not be found." });
    const res = await call("/api/logout");
    expect(res.status).toBe(405);
    expect(res.json.message).toBe("The GET method is not supported for route api/logout. Supported methods: POST.");
    expect(res.headers.get("Allow")).toBe("POST");
  });

  it("answers a CORS preflight with the configured origin", async () => {
    const res = await call("/api/projects", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "get" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET");
  });
});

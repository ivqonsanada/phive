/** Port of DemoResetTest, plus a check that the seed matches the schema. */
import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

import * as schema from "../src/db/schema";
import { resetDemo } from "../src/seed/reset";
import { call, db, files, form, makeUser, tokenFor } from "./helpers";

describe("demo reset", () => {
  it("refuses to run when demo mode is off", async () => {
    await makeUser();
    expect(await resetDemo({ ...env, DEMO_MODE: "false" })).toBe(false);
    expect(await db.select().from(schema.users)).toHaveLength(1);
  });

  it("wipes everything, reseeds and clears uploads", async () => {
    const stray = await makeUser();
    await call("/api/settings/avatar", { method: "POST", token: await tokenFor(stray), body: form({ file: files.png() }) });
    expect((await env.UPLOADS.list({ prefix: "avatars/" })).objects).toHaveLength(1);

    expect(await resetDemo({ ...env, DEMO_MODE: "true" })).toBe(true);
    expect(await db.select().from(schema.users)).toHaveLength(27);
    expect(await db.select().from(schema.projects)).toHaveLength(15);
    expect(await db.select().from(schema.personalAccessTokens)).toHaveLength(0);
    expect((await env.UPLOADS.list({ prefix: "avatars/" })).objects).toHaveLength(0);

    const login = await call("/api/login", { method: "POST", body: { email: "student@phive.test", password: "password" } });
    expect(login.status).toBe(200);
    expect((await call("/api/projects")).json.data).toHaveLength(9);
    expect((await call("/api/leaderboards")).json.boards.front_end_engineer.length).toBeGreaterThan(0);
  });
});

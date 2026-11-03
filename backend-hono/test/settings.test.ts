/** Ports of Settings/ProfileTest, Settings/MediaTest, Settings/ExperienceTest, PrivilegeEscalationTest. */
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import * as schema from "../src/db/schema";
import { call, db, files, form, makeUser, tokenFor } from "./helpers";

describe("profile settings", () => {
  it("updates the profile and leaves omitted fields alone", async () => {
    const user = await makeUser({ university: "ITS" });
    const res = await call("/api/settings/profile", {
      method: "PATCH",
      token: await tokenFor(user),
      body: { biography: "Hello", github: "https://github.com/ada", is_open_hired: true },
    });
    expect(res.status).toBe(200);
    expect(res.json.message).toBe("Profile updated.");
    expect(res.json.user).toMatchObject({ biography: "Hello", university: "ITS", is_open_hired: true, links: { github: "https://github.com/ada" } });
  });

  it("replaces skills as a whole list", async () => {
    const user = await makeUser();
    const token = await tokenFor(user);
    await call("/api/settings/profile", { method: "PATCH", token, body: { skills: ["Go"] } });
    const res = await call("/api/settings/profile", { method: "PATCH", token, body: { skills: ["React", "Postgres", "React"] } });
    expect(res.json.user.skills).toEqual(["React", "Postgres"]);
    expect(await db.select().from(schema.userSkills)).toHaveLength(2);
  });

  it("requires a unique, url-safe handle, but keeping your own is fine", async () => {
    await makeUser({ tagname: "taken" });
    const user = await makeUser({ tagname: "mine" });
    const token = await tokenFor(user);
    const taken = await call("/api/settings/profile", { method: "PATCH", token, body: { tagname: "taken" } });
    expect(taken.json.errors.tagname).toEqual(["The tagname has already been taken."]);
    const invalid = await call("/api/settings/profile", { method: "PATCH", token, body: { tagname: "Not Valid!" } });
    expect(invalid.json.errors.tagname).toEqual(["Handles may only contain lowercase letters, numbers and underscores."]);
    expect((await call("/api/settings/profile", { method: "PATCH", token, body: { tagname: "mine" } })).status).toBe(200);
  });

  it("requires links to be urls and skills to be strings", async () => {
    const token = await tokenFor(await makeUser());
    const res = await call("/api/settings/profile", { method: "PATCH", token, body: { website: "not a url", skills: [1] } });
    expect(res.json.errors).toEqual({
      website: ["The website field must be a valid URL."],
      "skills.0": ["The skills.0 field must be a string."],
    });
  });

  it("stores a cleared last name as empty instead of failing", async () => {
    const token = await tokenFor(await makeUser());
    const res = await call("/api/settings/profile", { method: "PATCH", token, body: { last_name: "" } });
    expect(res.status).toBe(200);
    expect(res.json.user.last_name).toBe("");
  });

  it("ignores attempts to change role, admin flag or email", async () => {
    const user = await makeUser();
    await call("/api/settings/profile", {
      method: "PATCH",
      token: await tokenFor(user),
      body: { role: "Lecturer", is_admin: true, email: "x@y.z", points: 99999 },
    });
    const [row] = await db.select().from(schema.users).where(eq(schema.users.id, user.id));
    expect(row).toMatchObject({ role: "Student", is_admin: false, email: user.email });
    expect(await db.select().from(schema.leaderboards)).toHaveLength(0);
  });

  it("refuses guests", async () => {
    expect((await call("/api/settings/profile", { method: "PATCH", body: {} })).status).toBe(401);
  });
});

describe("media", () => {
  it("uploads, replaces and removes an avatar", async () => {
    const user = await makeUser();
    const token = await tokenFor(user);
    const first = await call("/api/settings/avatar", { method: "POST", token, body: form({ file: files.png() }) });
    expect(first.status).toBe(200);
    expect(first.json.user.photo_url).toMatch(/^http:\/\/localhost:8787\/storage\/avatars\/[A-Za-z0-9]{40}\.png$/);
    const firstKey = first.json.user.photo_url.split("/storage/")[1];
    expect(await env.UPLOADS.head(firstKey)).not.toBeNull();

    const served = await call(`/storage/${firstKey}`);
    expect(served.status).toBe(200);
    expect(served.headers.get("content-type")).toBe("image/png");

    await call("/api/settings/avatar", { method: "POST", token, body: form({ file: files.png() }) });
    expect(await env.UPLOADS.head(firstKey)).toBeNull();

    expect((await call("/api/settings/avatar", { method: "DELETE", token })).json).toEqual({ message: "Avatar removed." });
    const [row] = await db.select().from(schema.users).where(eq(schema.users.id, user.id));
    expect(row!.photo_url).toBeNull();
  });

  it("requires an avatar to be a small image", async () => {
    const token = await tokenFor(await makeUser());
    const exe = await call("/api/settings/avatar", { method: "POST", token, body: form({ file: files.exe() }) });
    expect(exe.json.errors.file).toEqual([
      "The file field must be an image.",
      "The file field must be a file of type: jpeg, jpg, png, webp.",
    ]);
    const big = await call("/api/settings/avatar", { method: "POST", token, body: form({ file: files.png(1100 * 1024) }) });
    expect(big.json.errors.file).toEqual(["The file field must not be greater than 1024 kilobytes."]);
  });

  it("requires a cv to be a pdf", async () => {
    const token = await tokenFor(await makeUser());
    const png = await call("/api/settings/cv", { method: "POST", token, body: form({ file: files.png() }) });
    expect(png.json.errors.file).toEqual(["The file field must be a file of type: pdf."]);
    const pdf = await call("/api/settings/cv", { method: "POST", token, body: form({ file: files.pdf() }) });
    expect(pdf.json.user.cv_url).toMatch(/\/storage\/cv\/[A-Za-z0-9]{40}\.pdf$/);
  });
});

describe("experiences", () => {
  it("adds, edits and removes an experience", async () => {
    const token = await tokenFor(await makeUser());
    const created = await call("/api/settings/experiences", {
      method: "POST",
      token,
      body: { project_name: "Campus App", project_role: "Lead", start_date: "2025-01-01", end_date: null },
    });
    expect(created.status).toBe(201);
    expect(created.json.experience).toMatchObject({ start_date: "2025-01-01T00:00:00.000000Z", end_date: null });

    const path = `/api/settings/experiences/${created.json.experience.uuid}`;
    const edited = await call(path, {
      method: "PATCH",
      token,
      body: { project_name: "Campus App v2", project_role: "Lead", start_date: "2025-01-01" },
    });
    expect(edited.json.experience.project_name).toBe("Campus App v2");
    expect((await call(path, { method: "DELETE", token })).json).toEqual({ message: "Experience removed." });
  });

  it("refuses an end date before the start", async () => {
    const token = await tokenFor(await makeUser());
    const res = await call("/api/settings/experiences", {
      method: "POST",
      token,
      body: { project_name: "X", project_role: "Y", start_date: "2025-05-01", end_date: "2025-01-01" },
    });
    expect(res.json.errors.end_date).toEqual(["The end date field must be a date after or equal to start date."]);
  });

  it("refuses someone else's experience and malformed ids", async () => {
    const owner = await makeUser();
    const [row] = await db
      .insert(schema.experiences)
      .values({ user_id: owner.id, project_name: "Mine", project_role: "Dev", start_date: "2025-01-01" })
      .returning();
    const intruder = await tokenFor(await makeUser());
    const res = await call(`/api/settings/experiences/${row!.id}`, { method: "DELETE", token: intruder });
    expect(res.status).toBe(403);
    expect(res.json).toEqual({ message: "" });
    const bad = await call("/api/settings/experiences/abc", { method: "DELETE", token: intruder });
    expect(bad.json).toEqual({ message: "The route api/settings/experiences/abc could not be found." });
  });
});

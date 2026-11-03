/** Ports of ProjectPublishingTest, ProjectPolicyTest, ProjectBoundariesTest, ProjectInvitationTest, MediaTest (thumbnails). */
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import * as schema from "../src/db/schema";
import { call, db, files, form, makeLecturer, makeProject, makeUser, tokenFor } from "./helpers";

const publishable = {
  publish: true,
  title: "Campus Wayfinding App",
  description: "Help people find rooms.",
  front_end_engineer: true,
  skills: ["React", "Figma"],
  requirements: ["Weekly standup"],
};

describe("publishing", () => {
  it("lets a lecturer publish a project", async () => {
    const lecturer = await makeLecturer();
    const res = await call("/api/my/projects", { method: "POST", token: await tokenFor(lecturer), body: publishable });
    expect(res.status).toBe(201);
    expect(res.json.message).toBe("Project published.");
    expect(res.json.project).toMatchObject({ status: "Hiring", skills: ["React", "Figma"], requirements: ["Weekly standup"] });
    expect(res.json.project.project_url).toMatch(/^campus-wayfinding-app-[a-z0-9]{8}$/);
    // Defaults come back filled in, not null.
    expect(res.json.project).toMatchObject({ applicant_type: "Individual & Team", max_person: "Not Specified", reward: { amount: "0", currency: "IDR" } });
    const [box] = await db.select().from(schema.projectBoxes);
    expect(box).toMatchObject({ user_id: lecturer.id, status: "Hiring" });
  });

  it("lets a draft be incomplete, and treats blank team size as the default", async () => {
    const token = await tokenFor(await makeLecturer());
    const res = await call("/api/my/projects", { method: "POST", token, body: { publish: false, title: "Rough", max_person: "" } });
    expect(res.status).toBe(201);
    expect(res.json.message).toBe("Draft saved.");
    expect(res.json.project).toMatchObject({ status: "Draft", max_person: "Not Specified" });
  });

  it("requires a title, description and expertise to publish, and an amount when paid", async () => {
    const token = await tokenFor(await makeLecturer());
    const res = await call("/api/my/projects", {
      method: "POST",
      token,
      body: { publish: true, title: "", description: "", salary: true },
    });
    expect(res.status).toBe(422);
    expect(res.json.message).toBe("The title field is required. (and 3 more errors)");
    expect(res.json.errors).toEqual({
      title: ["The title field is required."],
      description: ["The description field is required."],
      ui_ux_designer: ["Choose at least one expertise this project is hiring for."],
      salary_amount: ["A paid project needs a salary amount above zero."],
    });
  });

  it("refuses students, validating first", async () => {
    const token = await tokenFor(await makeUser());
    expect((await call("/api/my/projects", { method: "POST", token, body: { publish: "yes" } })).status).toBe(422);
    const res = await call("/api/my/projects", { method: "POST", token, body: publishable });
    expect(res.status).toBe(403);
    expect(res.json.message).toBe("This action is unauthorized.");
  });

  it("ignores owner, status and url sent by the client", async () => {
    const lecturer = await makeLecturer();
    const other = await makeLecturer();
    const res = await call("/api/my/projects", {
      method: "POST",
      token: await tokenFor(lecturer),
      body: { ...publishable, user_id: other.id, status: "Finished", project_url: "mine" },
    });
    const [row] = await db.select().from(schema.projects);
    expect(row).toMatchObject({ user_id: lecturer.id, status: "Hiring" });
    expect(res.json.project.project_url).not.toBe("mine");
  });

  it("replaces the skill list on edit and leaves it alone when omitted", async () => {
    const lecturer = await makeLecturer();
    const token = await tokenFor(lecturer);
    const created = await call("/api/my/projects", { method: "POST", token, body: publishable });
    const path = `/api/my/projects/${created.json.project.project_url}`;

    const edited = await call(path, { method: "PATCH", token, body: { ...publishable, skills: ["React"] } });
    expect(edited.json.project.skills).toEqual(["React"]);
    const untouched = await call(path, { method: "PATCH", token, body: { publish: true, title: "New", description: "D", data_expert: true } });
    expect(untouched.json.project.skills).toEqual(["React"]);
    expect(await db.select().from(schema.projectSkills)).toHaveLength(1);
  });

  it("does not knock a running project back to draft on save", async () => {
    const lecturer = await makeLecturer();
    const project = await makeProject(lecturer, { status: "Ongoing" });
    const res = await call(`/api/my/projects/${project.project_url}`, { method: "PATCH", token: await tokenFor(lecturer), body: { title: "Renamed" } });
    expect(res.json.project).toMatchObject({ status: "Ongoing", title: "Renamed" });
  });

  it("refuses edits to someone else's project but lets an admin through", async () => {
    const project = await makeProject(await makeLecturer());
    const path = `/api/my/projects/${project.project_url}`;
    const stranger = await call(path, { method: "PATCH", token: await tokenFor(await makeLecturer()), body: { title: "Mine" } });
    expect(stranger.status).toBe(403);
    const admin = await call(path, { method: "PATCH", token: await tokenFor(await makeUser({ is_admin: true })), body: { title: "Fixed" } });
    expect(admin.status).toBe(200);
  });

  it("publishes a draft in one call, but not twice and not empty", async () => {
    const lecturer = await makeLecturer();
    const token = await tokenFor(lecturer);
    const draft = await makeProject(lecturer, { status: "Draft" });
    const empty = await makeProject(lecturer, { status: "Draft", description: null });

    const res = await call(`/api/my/projects/${draft.project_url}/publish`, { method: "POST", token });
    expect(res.json).toMatchObject({ message: "Project published.", project: { status: "Hiring", is_open_hiring: true } });
    const again = await call(`/api/my/projects/${draft.project_url}/publish`, { method: "POST", token });
    expect(again.status).toBe(409);
    expect(again.json.message).toBe("Only a draft can be published.");
    const blank = await call(`/api/my/projects/${empty.project_url}/publish`, { method: "POST", token });
    expect(blank.status).toBe(422);
    expect(blank.json).toEqual({ message: "Give the project a title and description before publishing it." });
  });

  it("closes applications but keeps the project visible", async () => {
    const lecturer = await makeLecturer();
    const project = await makeProject(lecturer);
    expect((await call(`/api/my/projects/${project.project_url}/close`, { method: "POST", token: await tokenFor(lecturer) })).json).toEqual({
      message: "Applications closed.",
    });
    const res = await call(`/api/projects/${project.project_url}`);
    expect(res.status).toBe(200);
    expect(res.json.is_open_hiring).toBe(false);
  });

  it("withdraws a project unless it is ongoing", async () => {
    const lecturer = await makeLecturer();
    const token = await tokenFor(lecturer);
    const ongoing = await makeProject(lecturer, { status: "Ongoing" });
    const hiring = await makeProject(lecturer);
    const blocked = await call(`/api/my/projects/${ongoing.project_url}`, { method: "DELETE", token });
    expect(blocked.status).toBe(409);
    expect(blocked.json.message).toBe("An ongoing project cannot be deleted — terminate it from the project box instead.");
    expect((await call(`/api/my/projects/${hiring.project_url}`, { method: "DELETE", token })).json).toEqual({ message: "Project withdrawn." });
    expect(await db.select().from(schema.projects).where(eq(schema.projects.id, hiring.id))).toHaveLength(0);
  });

  it("lists the lecturer's own projects including drafts", async () => {
    const lecturer = await makeLecturer();
    await makeProject(lecturer);
    await makeProject(lecturer, { status: "Draft" });
    await makeProject(await makeLecturer());
    const res = await call("/api/my/projects", { token: await tokenFor(lecturer) });
    expect(res.json).toHaveLength(2);
    expect(res.json[0]).toHaveProperty("skills");
  });
});

describe("thumbnails", () => {
  it("sets and removes a thumbnail, returning an absolute url", async () => {
    const lecturer = await makeLecturer();
    const token = await tokenFor(lecturer);
    const project = await makeProject(lecturer);
    const res = await call(`/api/my/projects/${project.project_url}/thumbnail`, { method: "POST", token, body: form({ file: files.png() }) });
    expect(res.json.message).toBe("Thumbnail updated.");
    expect(res.json.project.thumbnail).toMatch(/^http:\/\/localhost:8787\/storage\/project-thumbnails\//);
    const [row] = await db.select().from(schema.projects).where(eq(schema.projects.id, project.id));
    expect(row!.thumbnail).toMatch(/^project-thumbnails\//);

    expect((await call(`/api/my/projects/${project.project_url}/thumbnail`, { method: "DELETE", token })).json).toEqual({ message: "Thumbnail removed." });
    expect(await env.UPLOADS.head(row!.thumbnail!)).toBeNull();
  });

  it("refuses a thumbnail on someone else's project before validating", async () => {
    const project = await makeProject(await makeLecturer());
    const res = await call(`/api/my/projects/${project.project_url}/thumbnail`, { method: "POST", token: await tokenFor(await makeLecturer()), body: form({}) });
    expect(res.status).toBe(403);
  });
});

describe("invitations", () => {
  it("invites a student once, with one inbox row, and creates the team", async () => {
    const lecturer = await makeLecturer();
    const token = await tokenFor(lecturer);
    const project = await makeProject(lecturer);
    const student = await makeUser({ first_name: "Ada", last_name: "Lovelace" });
    const path = `/api/my/projects/${project.project_url}/invite/${student.tagname}`;

    expect((await call(path, { method: "POST", token })).json).toEqual({ message: "Invitation sent to Ada Lovelace." });
    await call(path, { method: "POST", token });
    expect(await db.select().from(schema.projectInvitations)).toHaveLength(1);
    const inbox = await db.select().from(schema.inboxes);
    expect(inbox).toHaveLength(1);
    expect(inbox[0]).toMatchObject({ category: "Project Invitation", recipient_id: student.id });
    expect((await call(`/api/projects/${project.project_url}`)).json.team).toMatchObject({ leader: null, members: [] });
  });

  it("only invites students, never yourself, and only to your own project", async () => {
    const lecturer = await makeLecturer();
    const token = await tokenFor(lecturer);
    const project = await makeProject(lecturer);
    const other = await makeLecturer();
    const notStudent = await call(`/api/my/projects/${project.project_url}/invite/${other.tagname}`, { method: "POST", token });
    expect(notStudent.json).toEqual({ message: "Only students can be invited to a project." });
    const self = await call(`/api/my/projects/${project.project_url}/invite/${lecturer.tagname}`, { method: "POST", token });
    expect(self.json).toEqual({ message: "You cannot invite yourself." });
    const student = await makeUser();
    const foreign = await call(`/api/my/projects/${project.project_url}/invite/${student.tagname}`, { method: "POST", token: await tokenFor(other) });
    expect(foreign.status).toBe(403);
  });
});

/** Ports of ProjectBrowsingTest, HomeAndLeaderboardTest, ProfileTest, ProfileStandingTest, WishlistTest. */
import { describe, expect, it } from "vitest";

import * as schema from "../src/db/schema";
import { levelForPoints } from "../src/domain/enums";
import { call, db, makeLecturer, makeProject, makeUser, tokenFor } from "./helpers";

describe("browsing projects", () => {
  it("lets guests browse published projects, newest first, without a wishlist flag", async () => {
    const lecturer = await makeLecturer();
    await makeProject(lecturer, { title: "One" });
    await makeProject(lecturer, { title: "Two" });
    await makeProject(lecturer, { title: "Three" });
    await makeProject(lecturer, { title: "Draft", status: "Draft" });

    const res = await call("/api/projects");
    expect(res.status).toBe(200);
    expect(res.json.data.map((p: any) => p.title)).toEqual(["Three", "Two", "One"]);
    expect(res.json.data[0].user.tagname).toBe(lecturer.tagname);
    expect(res.json.data[0]).not.toHaveProperty("is_wished");
    expect(res.json.data[0].created_at).toMatch(/\.000000Z$/);
    expect(res.json.links).toEqual({
      first: "http://localhost:8787/api/projects?page=1",
      last: null,
      prev: null,
      next: null,
    });
    expect(res.json.meta).toMatchObject({ current_page: 1, from: 1, to: 3, per_page: 9, path: "http://localhost:8787/api/projects" });
  });

  it("paginates nine at a time with absolute links that keep the filters", async () => {
    const lecturer = await makeLecturer();
    for (let i = 0; i < 10; i++) await makeProject(lecturer, { title: `App ${i}` });
    const first = await call("/api/projects?query=app");
    expect(first.json.data).toHaveLength(9);
    expect(first.json.links.next).toBe("http://localhost:8787/api/projects?query=app&page=2");
    const second = await call(first.json.links.next);
    expect(second.json.data).toHaveLength(1);
    expect(second.json.meta).toMatchObject({ current_page: 2, from: 10, to: 10 });
    expect(second.json.links.prev).toBe("http://localhost:8787/api/projects?query=app&page=1");
  });

  it("searches title and description case-insensitively", async () => {
    const lecturer = await makeLecturer();
    await makeProject(lecturer, { title: "Campus Wayfinding App" });
    await makeProject(lecturer, { title: "Kiosk", description: "A WAYFINDING kiosk." });
    await makeProject(lecturer, { title: "Unrelated" });
    const res = await call("/api/projects?query=wayfinding");
    expect(res.json.data).toHaveLength(2);
  });

  it("filters by expertise and rejects an unknown one", async () => {
    const lecturer = await makeLecturer();
    await makeProject(lecturer, { title: "Design", ui_ux_designer: true });
    await makeProject(lecturer, { title: "Data", data_expert: true });
    const res = await call(`/api/projects?expertise=${encodeURIComponent("UI/UX Designer")}`);
    expect(res.json.data.map((p: any) => p.title)).toEqual(["Design"]);
    expect(res.json.data[0].looking_for).toEqual(["UI/UX Designer"]);

    const bad = await call("/api/projects?expertise=Wizard");
    expect(bad.status).toBe(422);
    expect(bad.json.errors.expertise).toEqual(["The selected expertise is invalid."]);
  });

  it("shows a signed-in viewer their own wishlist flag", async () => {
    const lecturer = await makeLecturer();
    const project = await makeProject(lecturer);
    const student = await makeUser();
    await db.insert(schema.wishlists).values({ user_id: student.id, project_id: project.id });
    const res = await call("/api/projects", { token: await tokenFor(student) });
    expect(res.json.data[0].is_wished).toBe(true);
  });

  it("includes skills, requirements, team and review on the detail page", async () => {
    const lecturer = await makeLecturer();
    const member = await makeUser();
    const project = await makeProject(lecturer, { status: "Finished" });
    await db.insert(schema.projectSkills).values([{ project_id: project.id, name: "React" }]);
    await db.insert(schema.projectRequirements).values([{ project_id: project.id, requirement: "Laptop" }]);
    const [team] = await db.insert(schema.projectTeams).values({ project_id: project.id }).returning();
    await db.insert(schema.projectTeamMembers).values({ project_team_id: team!.id, member_id: member.id, expertise: "Backend Engineer", score: "4" });
    await db.insert(schema.projectReviews).values({ project_id: project.id, overall_score: "5", overall_review: "Great" });

    const res = await call(`/api/projects/${project.project_url}`);
    expect(res.status).toBe(200);
    expect(res.json).toMatchObject({
      skills: ["React"],
      requirements: ["Laptop"],
      team: { leader: null, members: [{ expertise: "Backend Engineer", score: "4", user: { tagname: member.tagname } }] },
      review: { overall_score: "5", overall_review: "Great" },
    });
  });

  it("hides drafts from the detail page, even from their owner", async () => {
    const lecturer = await makeLecturer();
    const draft = await makeProject(lecturer, { status: "Draft" });
    const res = await call(`/api/projects/${draft.project_url}`, { token: await tokenFor(lecturer) });
    expect(res.status).toBe(404);
    expect((await call("/api/projects/nope")).json.message).toBe("No query results for model [App\\Models\\Project] nope");
  });

  it("suggests similar projects matching the viewer's expertise", async () => {
    const lecturer = await makeLecturer();
    const base = await makeProject(lecturer);
    await makeProject(lecturer, { data_expert: true });
    await makeProject(lecturer, { data_expert: true });
    await makeProject(lecturer, { ui_ux_designer: true });
    const viewer = await makeUser({ expertise: "Data Expert" });
    const res = await call(`/api/projects/${base.project_url}/similar`, { token: await tokenFor(viewer) });
    expect(res.json).toHaveLength(2);
    for (const p of res.json) {
      expect(p.looking_for).toContain("Data Expert");
      expect(p.uuid).not.toBe(base.id);
    }
  });
});

describe("home and leaderboards", () => {
  it("counts projects by status and exposes a top scorer per expertise", async () => {
    const lecturer = await makeLecturer();
    await makeProject(lecturer, { status: "Hiring" });
    await makeProject(lecturer, { status: "Hiring", is_open_hiring: false });
    await makeProject(lecturer, { status: "Ongoing" });
    await makeProject(lecturer, { status: "Draft" });
    const star = await makeUser();
    await db.insert(schema.leaderboards).values({ user_id: star.id, expertise: "Data Expert", points: 120 });

    const res = await call("/api/home");
    expect(res.json.stats).toEqual({ hiring: 2, ongoing: 1, finished: 0 });
    expect(res.json.top_boards.data_expert.user).toMatchObject({ tagname: star.tagname, finished_project_count: 0 });
    expect(res.json.top_boards.ui_ux_designer).toBeNull();
    expect(res.json.latest_projects).toHaveLength(1);
  });

  it("orders the leaderboard by points and gives every expertise a board", async () => {
    for (const points of [30, 90, 60]) {
      const u = await makeUser();
      await db.insert(schema.leaderboards).values({ user_id: u.id, expertise: "Backend Engineer", points });
    }
    const res = await call("/api/leaderboards");
    expect(res.json.boards.back_end_engineer.map((e: any) => e.points)).toEqual([90, 60, 30]);
    expect(Object.keys(res.json.boards)).toEqual(["ui_ux_designer", "front_end_engineer", "back_end_engineer", "data_expert"]);
    expect(res.json.boards.data_expert).toEqual([]);
  });
});

describe("profiles", () => {
  it("lists a lecturer's published projects and a student's finished work", async () => {
    const lecturer = await makeLecturer();
    const finished = await makeProject(lecturer, { status: "Finished" });
    const ongoing = await makeProject(lecturer, { status: "Ongoing" });
    await makeProject(lecturer, { status: "Draft" });
    const student = await makeUser();
    await db.insert(schema.projectBoxes).values([
      { project_id: finished.id, user_id: student.id, status: "Finished" },
      { project_id: ongoing.id, user_id: student.id, status: "Ongoing" },
    ]);

    expect((await call(`/api/users/${lecturer.tagname}`)).json.projects).toHaveLength(2);
    const res = await call(`/api/users/${student.tagname}`);
    expect(res.json.projects.map((p: any) => p.uuid)).toEqual([finished.id]);
    expect(res.json.user).not.toHaveProperty("password");
  });

  it("reports the best board, and hides private fields from other people", async () => {
    const student = await makeUser({ identity_number: "123" });
    await db.insert(schema.leaderboards).values([
      { user_id: student.id, expertise: "Data Expert", points: 400 },
      { user_id: student.id, expertise: "Backend Engineer", points: 9000 },
    ]);
    const res = await call(`/api/users/${student.tagname}`);
    expect(res.json.user).toMatchObject({ points: 9000, level: "Superior", email: null, identity_number: null });
    expect(res.json.user.leaderboards.map((b: any) => b.points)).toEqual([9000, 400]);
    expect(Object.keys(res.json.user.leaderboards[0])).toEqual(["uuid", "expertise", "points"]);

    const own = await call(`/api/users/${student.tagname}`, { token: await tokenFor(student) });
    expect(own.json.user.email).toBe(student.email);
  });

  it("maps points to a standing", () => {
    expect([2500, 2501, 7500, 7501, 15000, 15001].map(levelForPoints)).toEqual([
      "Rookie", "Amateur", "Amateur", "Superior", "Superior", "Expert",
    ]);
  });

  it("is a 404 for an unknown tagname", async () => {
    const res = await call("/api/users/nobody");
    expect(res.status).toBe(404);
    expect(res.json.message).toBe("No query results for model [App\\Models\\User] nobody");
  });
});

describe("wishlist", () => {
  it("lets a student toggle a project on and off", async () => {
    const project = await makeProject(await makeLecturer());
    const token = await tokenFor(await makeUser());
    const path = `/api/projects/${project.project_url}/wishlist`;
    expect((await call(path, { method: "POST", token })).json).toEqual({ is_wished: true });
    expect((await call("/api/wishlist", { token })).json.projects[0].uuid).toBe(project.id);
    expect((await call(path, { method: "POST", token })).json).toEqual({ is_wished: false });
    expect(await db.select().from(schema.wishlists)).toHaveLength(1);
    expect((await call("/api/wishlist", { token })).json.projects).toEqual([]);
  });

  it("refuses lecturers, guests and drafts", async () => {
    const lecturer = await makeLecturer();
    const project = await makeProject(lecturer);
    const draft = await makeProject(lecturer, { status: "Draft" });
    const path = `/api/projects/${project.project_url}/wishlist`;
    expect((await call(path, { method: "POST" })).status).toBe(401);
    const res = await call(path, { method: "POST", token: await tokenFor(lecturer) });
    expect(res.status).toBe(403);
    expect(res.json.message).toBe("Only students keep a wishlist.");
    const draftRes = await call(`/api/projects/${draft.project_url}/wishlist`, { method: "POST", token: await tokenFor(await makeUser()) });
    expect(draftRes.status).toBe(404);
    expect(draftRes.json).toEqual({ message: "" });
  });
});

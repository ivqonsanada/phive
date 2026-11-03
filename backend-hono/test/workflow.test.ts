/** Ports of PartyTest, ApplicationTest, ProjectWorkflowTest, ProjectBoundariesTest (review), SocialBoundariesTest (party). */
import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import * as schema from "../src/db/schema";
import { call, db, makeLecturer, makeProject, makeUser, tokenFor } from "./helpers";

async function boxOf(projectId: string, userId: string) {
  const [box] = await db
    .select()
    .from(schema.projectBoxes)
    .where(and(eq(schema.projectBoxes.project_id, projectId), eq(schema.projectBoxes.user_id, userId)));
  return box;
}

describe("party", () => {
  it("creates the party with the leader in it when inviting", async () => {
    const leader = await makeUser({ expertise: "Data Expert" });
    const friend = await makeUser({ first_name: "Bo", last_name: "Lee" });
    const res = await call(`/api/users/${friend.tagname}/invite/party`, { method: "POST", token: await tokenFor(leader) });
    expect(res.json.message).toBe("Invitation sent to Bo Lee.");
    expect(res.json.party.members).toEqual([expect.objectContaining({ is_leader: true, expertise: "Data Expert" })]);
    const [inbox] = await db.select().from(schema.inboxes);
    expect(inbox).toMatchObject({ category: "Team Invitation", recipient_id: friend.id });
  });

  it("separates led parties from ones you are a member of", async () => {
    const leader = await makeUser();
    const member = await makeUser();
    const [team] = await db.insert(schema.teams).values({ leader_id: leader.id }).returning();
    await db.insert(schema.teamMembers).values([
      { team_id: team!.id, member_id: leader.id },
      { team_id: team!.id, member_id: member.id },
    ]);
    const res = await call("/api/party", { token: await tokenFor(member) });
    expect(res.json.led).toBeNull();
    expect(res.json.member_of[0].uuid).toBe(team!.id);
  });

  it("guards the edges", async () => {
    const student = await makeUser();
    const token = await tokenFor(student);
    const lecturer = await makeLecturer();
    expect((await call(`/api/users/${student.tagname}/invite/party`, { method: "POST", token: await tokenFor(lecturer) })).json).toEqual({
      message: "Only students form parties.",
    });
    expect((await call(`/api/users/${student.tagname}/invite/party`, { method: "POST", token })).json).toEqual({
      message: "You are already in your own party.",
    });
    const kick = await call(`/api/party/members/${student.tagname}`, { method: "DELETE", token: await tokenFor(await makeUser()) });
    expect(kick.status).toBe(404);
    expect(kick.json.message).toBe("No query results for model [App\\Models\\Team].");
  });

  it("lets a leader kick a member and a member leave, but not the leader", async () => {
    const leader = await makeUser();
    const member = await makeUser({ first_name: "Bo", last_name: "Lee" });
    const [team] = await db.insert(schema.teams).values({ leader_id: leader.id }).returning();
    await db.insert(schema.teamMembers).values([
      { team_id: team!.id, member_id: leader.id },
      { team_id: team!.id, member_id: member.id },
    ]);
    expect((await call(`/api/party/${team!.id}/leave`, { method: "DELETE", token: await tokenFor(leader) })).json).toEqual({
      message: "A leader cannot leave their own party.",
    });
    const kicked = await call(`/api/party/members/${member.tagname}`, { method: "DELETE", token: await tokenFor(leader) });
    expect(kicked.json.message).toBe("Bo Lee has been removed from your party.");
    expect(kicked.json.party.members).toHaveLength(1);
  });
});

describe("applications", () => {
  it("lets a student apply individually, once", async () => {
    const project = await makeProject(await makeLecturer());
    const student = await makeUser();
    const token = await tokenFor(student);
    const path = `/api/projects/${project.project_url}/apply/individual`;
    const res = await call(path, { method: "POST", token, body: { expertise: "Frontend Engineer" } });
    expect(res.status).toBe(201);
    expect(res.json).toEqual({ message: "Application submitted." });
    expect((await boxOf(project.id, student.id))!.status).toBe("Waiting");
    const again = await call(path, { method: "POST", token, body: { expertise: "Frontend Engineer" } });
    expect(again.status).toBe(409);
    expect(again.json.message).toBe("You have already applied to this project.");
  });

  it("refuses lecturers, closed projects and the wrong applicant type", async () => {
    const lecturer = await makeLecturer();
    const closed = await makeProject(lecturer, { is_open_hiring: false });
    const teamOnly = await makeProject(lecturer, { applicant_type: "Team" });
    const token = await tokenFor(await makeUser());
    const body = { expertise: "Data Expert" };
    expect((await call(`/api/projects/${closed.project_url}/apply/individual`, { method: "POST", token: await tokenFor(lecturer), body })).status).toBe(403);
    expect((await call(`/api/projects/${closed.project_url}/apply/individual`, { method: "POST", token, body })).json.message).toBe(
      "This project is not accepting applications.",
    );
    expect((await call(`/api/projects/${teamOnly.project_url}/apply/individual`, { method: "POST", token, body })).json.message).toBe(
      "This project only accepts team applications.",
    );
  });

  it("lets a leader apply with their party, and only their party", async () => {
    const project = await makeProject(await makeLecturer());
    const leader = await makeUser();
    const member = await makeUser();
    const outsider = await makeUser();
    const token = await tokenFor(leader);
    const path = `/api/projects/${project.project_url}/apply/team`;
    expect((await call(path, { method: "POST", token, body: {} })).json.message).toBe("Build a party before applying as a team.");

    const [team] = await db.insert(schema.teams).values({ leader_id: leader.id }).returning();
    await db.insert(schema.teamMembers).values([
      { team_id: team!.id, member_id: leader.id },
      { team_id: team!.id, member_id: member.id },
    ]);
    const invalid = await call(path, { method: "POST", token, body: { members: [{ member_uuid: "x" }] } });
    expect(invalid.json.errors).toEqual({
      "members.0.member_uuid": ["The members.0.member uuid field must be a valid UUID."],
      "members.0.expertise": ["The members.0.expertise field is required."],
    });
    const stranger = await call(path, { method: "POST", token, body: { members: [{ member_uuid: outsider.id, expertise: "Data Expert" }] } });
    expect(stranger.json.message).toBe("Every applicant has to be a member of your party.");

    const res = await call(path, {
      method: "POST",
      token,
      body: { members: [{ member_uuid: leader.id, expertise: "Data Expert" }, { member_uuid: member.id, expertise: "Frontend Engineer" }] },
    });
    expect(res.status).toBe(201);
    expect(await db.select().from(schema.projectBoxes)).toHaveLength(2);
  });

  it("withdraws an application and its waiting box", async () => {
    const project = await makeProject(await makeLecturer());
    const token = await tokenFor(await makeUser());
    const path = `/api/projects/${project.project_url}/apply`;
    expect((await call(path, { method: "DELETE", token })).json).toEqual({ message: "You have not applied to this project." });
    await call(`${path}/individual`, { method: "POST", token, body: { expertise: "Data Expert" } });
    expect((await call(path, { method: "DELETE", token })).json).toEqual({ message: "Application withdrawn." });
    expect(await db.select().from(schema.projectBoxes)).toHaveLength(0);
    expect(await db.select().from(schema.individualApplicants)).toHaveLength(0);
  });
});

describe("project lifecycle", () => {
  it("goes apply → shortlist → confirm → start → review, awarding points", async () => {
    const lecturer = await makeLecturer();
    const lecturerToken = await tokenFor(lecturer);
    const created = await call("/api/my/projects", {
      method: "POST",
      token: lecturerToken,
      body: { publish: true, title: "Kiosk", description: "D", front_end_engineer: true, level_applicant: "Hard" },
    });
    const url = created.json.project.project_url;
    const projectId = created.json.project.uuid;

    const student = await makeUser();
    const bystander = await makeUser();
    const studentToken = await tokenFor(student);
    await call(`/api/projects/${url}/apply/individual`, { method: "POST", token: studentToken, body: { expertise: "Frontend Engineer" } });
    await call(`/api/projects/${url}/apply/individual`, { method: "POST", token: await tokenFor(bystander), body: { expertise: "Data Expert" } });

    const box = await call("/api/project-box", { token: studentToken });
    expect(box.json.boxes[0]).toMatchObject({ status: "Waiting", can_confirm: false, project: { title: "Kiosk" } });

    const shortlist = await call(`/api/my/projects/${url}/shortlist`, { token: lecturerToken });
    expect(shortlist.json.individuals).toHaveLength(2);
    const pick = shortlist.json.individuals.find((i: any) => i.user.uuid === student.id).uuid;

    expect((await call(`/api/my/projects/${url}/start`, { method: "POST", token: lecturerToken })).json.message).toBe(
      "Nobody has confirmed yet, so there is no team to start with.",
    );
    expect((await call(`/api/my/projects/${url}/shortlist`, { method: "POST", token: lecturerToken, body: { individual_uuids: [] } })).json.message).toBe(
      "Pick at least one applicant to shortlist.",
    );
    await call(`/api/my/projects/${url}/shortlist`, { method: "POST", token: lecturerToken, body: { individual_uuids: [pick] } });
    expect((await boxOf(projectId, student.id))!.status).toBe("Accepted");
    expect((await boxOf(projectId, lecturer.id))!.status).toBe("Confirmation");

    const studentBox = (await boxOf(projectId, student.id))!;
    const confirmed = await call(`/api/project-box/${studentBox.id}/confirm`, { method: "POST", token: studentToken, body: { accept: true } });
    expect(confirmed.json.message).toBe("You are on the team, waiting for the lecturer to start.");

    expect((await call(`/api/my/projects/${url}/review`, { method: "POST", token: lecturerToken, body: {} })).json.message).toBe(
      "Only an ongoing project can be reviewed.",
    );
    expect((await call(`/api/my/projects/${url}/start`, { method: "POST", token: lecturerToken })).json).toEqual({ message: "Project started." });
    const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId));
    expect(project).toMatchObject({ status: "Ongoing", is_open_hiring: false });
    expect(project!.start_time).not.toBeNull();
    expect((await boxOf(projectId, bystander.id))!.status).toBe("Rejected");
    expect((await boxOf(projectId, student.id))!.status).toBe("Project Started");

    const form = await call(`/api/my/projects/${url}/review`, { token: lecturerToken });
    expect(form.json.participants).toEqual([expect.objectContaining({ member_uuid: student.id, expertise: "Frontend Engineer" })]);
    expect(form.json.participants[0]).not.toHaveProperty("member_id");

    const tooHigh = await call(`/api/my/projects/${url}/review`, {
      method: "POST",
      token: lecturerToken,
      body: { overall_score: 6, participants: [{ member_uuid: student.id, expertise: "Frontend Engineer", score: 9 }] },
    });
    expect(Object.keys(tooHigh.json.errors)).toEqual(["overall_score", "participants.0.score"]);

    const reviewed = await call(`/api/my/projects/${url}/review`, {
      method: "POST",
      token: lecturerToken,
      body: { overall_score: "5", participants: [{ member_uuid: student.id, expertise: "Frontend Engineer", score: "4" }] },
    });
    expect(reviewed.json).toEqual({ message: "Review posted and points awarded." });
    expect((await boxOf(projectId, student.id))!.status).toBe("Finished");
    const [board] = await db.select().from(schema.leaderboards);
    expect(board).toMatchObject({ user_id: student.id, expertise: "Frontend Engineer", points: 3200 });
    const detail = await call(`/api/projects/${url}`);
    expect(detail.json.team.members[0].score).toBe("4");
    expect(detail.json.review.overall_score).toBe("5");
  });

  it("refuses to confirm someone else's seat or one not offered yet", async () => {
    const project = await makeProject(await makeLecturer());
    const student = await makeUser();
    const [box] = await db.insert(schema.projectBoxes).values({ project_id: project.id, user_id: student.id }).returning();
    const other = await call(`/api/project-box/${box!.id}/confirm`, { method: "POST", token: await tokenFor(await makeUser()), body: { accept: true } });
    expect(other.status).toBe(403);
    const early = await call(`/api/project-box/${box!.id}/confirm`, { method: "POST", token: await tokenFor(student), body: { accept: true } });
    expect(early.json).toEqual({ message: "There is nothing to confirm on this project yet." });
  });

  it("keeps the shortlist to the project's own lecturer", async () => {
    const project = await makeProject(await makeLecturer());
    const res = await call(`/api/my/projects/${project.project_url}/shortlist`, { token: await tokenFor(await makeLecturer()) });
    expect(res.status).toBe(403);
    expect(res.json.message).toBe("This action is unauthorized.");
  });
});

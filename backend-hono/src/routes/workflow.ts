/** The project box and the lecturer's shortlist → start → review flow. */
import { and, asc, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { type Context, Hono } from "hono";

import {
  applicantTeamMembers,
  individualApplicants,
  leaderboards,
  projectBoxes,
  projectReviews,
  projectTeamMembers,
  projectTeams,
  projects,
  teamApplicants,
} from "../db/schema";
import { ApplicationStatus, EXPERTISE, PROJECT_LEVELS, ProjectBoxStatus, ProjectStatus } from "../domain/enums";
import type { AppEnv, Database } from "../env";
import { currentUser, requireUser } from "../lib/auth";
import { abort, HttpError, iso, modelNotFound, readInput } from "../lib/http";
import { isUuid } from "../lib/uuid";
import { array, max, min, numeric, oneOf, required, string, uuid, validate } from "../lib/validator";
import { userSummary } from "../resources";
import { presentProjects, usersById } from "../resources/load";
import { authorize } from "./my-projects";
import { projectBySlug } from "./public";

/** /api/project-box: per-route auth, since this router is mounted at /api. */
export const projectBoxRoutes = new Hono<AppEnv>();
/** /api/my/projects/:project/{shortlist,start,review} */
export const workflowRoutes = new Hono<AppEnv>();
workflowRoutes.use("*", requireUser);

/** PHP's FILTER_VALIDATE_BOOLEAN, as `$request->boolean()` reads it. */
export function phpBoolean(value: unknown): boolean {
  if (value === true || value === 1) return true;
  return typeof value === "string" && ["1", "true", "on", "yes"].includes(value.toLowerCase());
}

const LEVEL_POINTS: Record<string, number> = { Easy: 2000, Medium: 2500, Hard: 4000, Expert: 5000 };

/** ProjectLevel::award, never more than the level's points. */
export const award = (level: string, overall: number, member: number) =>
  Math.round((overall / 5) * (member / 5) * LEVEL_POINTS[level]!);

projectBoxRoutes.get("/project-box", requireUser, async (c) => {
  const db = c.get("db");
  const boxes = await db
    .select()
    .from(projectBoxes)
    .where(eq(projectBoxes.user_id, currentUser(c).id))
    .orderBy(desc(projectBoxes.created_at), desc(projectBoxes.id));
  const rows = boxes.length
    ? await db.select().from(projects).where(inArray(projects.id, boxes.map((b) => b.project_id)))
    : [];
  const presented = await presentProjects(c.env, db, rows);
  const byId = new Map(presented.map((p) => [p.uuid as string, p]));

  return c.json({
    boxes: boxes.map((b) => ({
      uuid: b.id,
      status: b.status,
      can_confirm: b.status === ProjectBoxStatus.Accepted,
      updated_at: iso(b.updated_at),
      project: byId.get(b.project_id),
    })),
  });
});

projectBoxRoutes.post("/project-box/:box/confirm", requireUser, async (c) => {
  const db = c.get("db");
  const id = c.req.param("box");
  if (!isUuid(id)) abort(404, `The route ${c.req.path.replace(/^\//, "")} could not be found.`);
  const [box] = await db.select().from(projectBoxes).where(eq(projectBoxes.id, id)).limit(1);
  if (!box) modelNotFound("ProjectBox", id);
  if (box.user_id !== currentUser(c).id) abort(403);
  if (box.status !== ProjectBoxStatus.Accepted) throw new HttpError(409, "There is nothing to confirm on this project yet.");

  // A missing `accept` reads as false, as $request->boolean() does.
  const accept = phpBoolean((await readInput(c)).accept);
  await db
    .update(projectBoxes)
    .set({ status: accept ? ProjectBoxStatus.WaitingToStart : ProjectBoxStatus.BailOut, updated_at: new Date() })
    .where(eq(projectBoxes.id, box.id));
  return c.json({
    message: accept ? "You are on the team, waiting for the lecturer to start." : "You withdrew from this project.",
  });
});

async function ownedProject(c: Context<AppEnv>) {
  const db = c.get("db");
  const project = await projectBySlug(db, c.req.param("project") ?? "");
  authorize(currentUser(c), "update", project);
  return { db, project };
}

const setBoxes = (db: Database, projectId: string, status: string, ...where: Parameters<typeof and>) =>
  db
    .update(projectBoxes)
    .set({ status, updated_at: new Date() })
    .where(and(eq(projectBoxes.project_id, projectId), ...where));

workflowRoutes.get("/:project/shortlist", async (c) => {
  const { db, project } = await ownedProject(c);
  const [individuals, teams] = await Promise.all([
    db.select().from(individualApplicants).where(eq(individualApplicants.project_id, project.id)).orderBy(asc(individualApplicants.id)),
    db.select().from(teamApplicants).where(eq(teamApplicants.project_id, project.id)).orderBy(asc(teamApplicants.id)),
  ]);
  const members = teams.length
    ? await db
        .select()
        .from(applicantTeamMembers)
        .where(inArray(applicantTeamMembers.team_applicant_id, teams.map((t) => t.id)))
        .orderBy(asc(applicantTeamMembers.id))
    : [];
  const people = await usersById(db, [
    ...individuals.map((i) => i.from_id),
    ...teams.map((t) => t.from_id),
    ...members.map((m) => m.member_id),
  ]);
  const summary = (id: string) => userSummary(c.env, people.get(id)!);

  return c.json({
    individuals: individuals.map((i) => ({
      uuid: i.id,
      status: i.status,
      expertise: i.expertise,
      self_describe: i.self_describe,
      apply_reason: i.apply_reason,
      user: summary(i.from_id),
    })),
    teams: teams.map((t) => ({
      uuid: t.id,
      status: t.status,
      self_describe: t.self_describe,
      apply_reason: t.apply_reason,
      leader: summary(t.from_id),
      members: members
        .filter((m) => m.team_applicant_id === t.id)
        .map((m) => ({ expertise: m.expertise, user: summary(m.member_id) })),
    })),
  });
});

workflowRoutes.post("/:project/shortlist", async (c) => {
  const { db, project } = await ownedProject(c);
  const data = await validate(await readInput(c), {
    individual_uuids: [array()],
    "individual_uuids.*": [uuid()],
    team_uuids: [array()],
    "team_uuids.*": [uuid()],
  });
  const individualIds = (data.individual_uuids as string[] | undefined) ?? [];
  const teamIds = (data.team_uuids as string[] | undefined) ?? [];
  if (!individualIds.length && !teamIds.length) throw new HttpError(422, "Pick at least one applicant to shortlist.");

  const chosen: string[] = [];
  const statements = [];
  if (individualIds.length) {
    const picked = await db
      .select({ id: individualApplicants.id, from: individualApplicants.from_id })
      .from(individualApplicants)
      .where(and(eq(individualApplicants.project_id, project.id), inArray(individualApplicants.id, individualIds)));
    chosen.push(...picked.map((p) => p.from));
    if (picked.length) {
      statements.push(
        db.update(individualApplicants).set({ status: ApplicationStatus.Waiting, updated_at: new Date() }).where(inArray(individualApplicants.id, picked.map((p) => p.id))),
      );
    }
  }
  if (teamIds.length) {
    const picked = await db
      .select({ id: teamApplicants.id, from: teamApplicants.from_id })
      .from(teamApplicants)
      .where(and(eq(teamApplicants.project_id, project.id), inArray(teamApplicants.id, teamIds)));
    if (picked.length) {
      const members = await db
        .select({ member: applicantTeamMembers.member_id })
        .from(applicantTeamMembers)
        .where(inArray(applicantTeamMembers.team_applicant_id, picked.map((p) => p.id)));
      chosen.push(...picked.map((p) => p.from), ...members.map((m) => m.member));
      statements.push(
        db.update(teamApplicants).set({ status: ApplicationStatus.Waiting, updated_at: new Date() }).where(inArray(teamApplicants.id, picked.map((p) => p.id))),
      );
    }
  }
  if (chosen.length) statements.push(setBoxes(db, project.id, ProjectBoxStatus.Accepted, inArray(projectBoxes.user_id, [...new Set(chosen)])));
  statements.push(setBoxes(db, project.id, ProjectBoxStatus.Confirmation, eq(projectBoxes.user_id, project.user_id)));
  await db.batch(statements as [typeof statements[number], ...typeof statements]);

  return c.json({ message: "Applicants shortlisted." });
});

workflowRoutes.post("/:project/start", async (c) => {
  const { db, project } = await ownedProject(c);
  if (project.status === ProjectStatus.Ongoing) throw new HttpError(409, "This project has already started.");

  const confirmed = (
    await db
      .select({ user: projectBoxes.user_id })
      .from(projectBoxes)
      .where(and(eq(projectBoxes.project_id, project.id), eq(projectBoxes.status, ProjectBoxStatus.WaitingToStart)))
  ).map((r) => r.user);
  if (!confirmed.length) throw new HttpError(422, "Nobody has confirmed yet, so there is no team to start with.");

  const team =
    (await db.select().from(projectTeams).where(eq(projectTeams.project_id, project.id)).orderBy(asc(projectTeams.id)).limit(1))[0] ??
    (await db.insert(projectTeams).values({ project_id: project.id }).returning())[0]!;
  const expertise = new Map(
    (
      await db
        .select({ from: individualApplicants.from_id, expertise: individualApplicants.expertise })
        .from(individualApplicants)
        .where(and(eq(individualApplicants.project_id, project.id), inArray(individualApplicants.from_id, confirmed)))
    ).map((r) => [r.from, r.expertise]),
  );

  const now = new Date();
  await db.batch([
    db.update(projects).set({ status: ProjectStatus.Ongoing, is_open_hiring: false, start_time: now, updated_at: now }).where(eq(projects.id, project.id)),
    db
      .insert(projectTeamMembers)
      .values(confirmed.map((member) => ({ project_team_id: team.id, member_id: member, expertise: expertise.get(member) ?? null })))
      .onConflictDoNothing(),
    setBoxes(db, project.id, ProjectBoxStatus.ProjectStarted, inArray(projectBoxes.user_id, confirmed)),
    setBoxes(db, project.id, ProjectBoxStatus.Ongoing, eq(projectBoxes.user_id, project.user_id)),
    setBoxes(db, project.id, ProjectBoxStatus.Rejected, notInArray(projectBoxes.user_id, [...confirmed, project.user_id])),
    db
      .update(individualApplicants)
      .set({ status: ApplicationStatus.Fixed, updated_at: now })
      .where(and(eq(individualApplicants.project_id, project.id), inArray(individualApplicants.from_id, confirmed))),
    db
      .update(teamApplicants)
      .set({ status: ApplicationStatus.Fixed, updated_at: now })
      .where(and(eq(teamApplicants.project_id, project.id), inArray(teamApplicants.from_id, confirmed))),
  ]);

  return c.json({ message: "Project started." });
});

async function teamOf(db: Database, projectId: string) {
  const [team] = await db.select().from(projectTeams).where(eq(projectTeams.project_id, projectId)).orderBy(asc(projectTeams.id)).limit(1);
  return team ?? null;
}

workflowRoutes.get("/:project/review", async (c) => {
  const { db, project } = await ownedProject(c);
  const team = await teamOf(db, project.id);
  const members = team
    ? await db.select().from(projectTeamMembers).where(eq(projectTeamMembers.project_team_id, team.id)).orderBy(asc(projectTeamMembers.id))
    : [];
  const people = await usersById(db, members.map((m) => m.member_id));
  const [review] = await db.select().from(projectReviews).where(eq(projectReviews.project_id, project.id)).limit(1);

  return c.json({
    participants: members.map((m) => ({
      member_uuid: m.member_id,
      expertise: m.expertise,
      score: m.score,
      assessment: m.assessment,
      user: userSummary(c.env, people.get(m.member_id)!),
    })),
    // Laravel returned the raw row with integer ids; those do not exist here.
    review: review
      ? { uuid: review.id, overall_score: review.overall_score, overall_review: review.overall_review, project_result: review.project_result }
      : null,
  });
});

workflowRoutes.post("/:project/review", async (c) => {
  const { db, project } = await ownedProject(c);
  if (project.status !== ProjectStatus.Ongoing) throw new HttpError(409, "Only an ongoing project can be reviewed.");

  const score = () => [required(), numeric(), min(0), max(5)];
  const data = await validate(await readInput(c), {
    overall_score: score(),
    overall_review: ["nullable", string(), max(5000)],
    project_result: ["nullable", string(), max(2000)],
    participants: [required(), array(), min(1)],
    "participants.*.member_uuid": [required(), uuid()],
    "participants.*.expertise": [required(), oneOf(EXPERTISE)],
    "participants.*.score": score(),
    "participants.*.assessment": ["nullable", string(), max(2000)],
  });

  const team = await teamOf(db, project.id);
  if (!team) throw new HttpError(409, "This project has no team to review.");

  const participants = data.participants as Array<{ member_uuid: string; expertise: string; score: string | number; assessment?: string | null }>;
  const onTeam = new Set(
    (
      await db
        .select({ member: projectTeamMembers.member_id })
        .from(projectTeamMembers)
        .where(eq(projectTeamMembers.project_team_id, team.id))
    ).map((r) => r.member),
  );
  if (!participants.every((p) => onTeam.has(p.member_uuid))) {
    throw new HttpError(422, "Everyone scored has to be on this project team.");
  }

  const level = PROJECT_LEVELS.includes(project.level_applicant as never) ? project.level_applicant! : null;
  const overall = Number(data.overall_score);
  const now = new Date();
  const [existing] = await db.select({ id: projectReviews.id }).from(projectReviews).where(eq(projectReviews.project_id, project.id)).limit(1);
  const reviewValues = {
    overall_score: String(data.overall_score),
    overall_review: (data.overall_review as string | null | undefined) ?? null,
    project_result: (data.project_result as string | null | undefined) ?? null,
  };

  const statements = [
    db.update(projects).set({ status: ProjectStatus.Finished, finish_time: now, updated_at: now }).where(eq(projects.id, project.id)),
    setBoxes(db, project.id, ProjectBoxStatus.Finished, inArray(projectBoxes.status, [ProjectBoxStatus.ProjectStarted, ProjectBoxStatus.Ongoing])),
    existing
      ? db.update(projectReviews).set(reviewValues).where(eq(projectReviews.id, existing.id))
      : db.insert(projectReviews).values({ project_id: project.id, ...reviewValues }),
    ...participants.flatMap((p) => [
      db
        .update(projectTeamMembers)
        .set({ expertise: p.expertise, score: String(p.score), assessment: p.assessment ?? null })
        .where(and(eq(projectTeamMembers.project_team_id, team.id), eq(projectTeamMembers.member_id, p.member_uuid))),
      ...(level
        ? [
            db
              .insert(leaderboards)
              .values({ user_id: p.member_uuid, expertise: p.expertise, points: award(level, overall, Number(p.score)) })
              .onConflictDoUpdate({
                target: [leaderboards.user_id, leaderboards.expertise],
                set: { points: sql`${leaderboards.points} + ${award(level, overall, Number(p.score))}` },
              }),
          ]
        : []),
    ]),
  ];
  await db.batch(statements as [typeof statements[number], ...typeof statements]);

  return c.json({ message: "Review posted and points awarded." });
});

/** Parties (a student's standing team) and applying to projects. */
import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { type Context, Hono } from "hono";

import {
  applicantTeamMembers,
  inboxes,
  individualApplicants,
  projectBoxes,
  type Project,
  teamApplicants,
  teamInvitations,
  teamMembers,
  teams,
  type User,
  users,
} from "../db/schema";
import {
  allowsIndividual,
  allowsTeam,
  EXPERTISE,
  InboxCategory,
  ProjectBoxStatus,
  ProjectStatus,
  UserRole,
} from "../domain/enums";
import type { AppEnv, Bindings, Database } from "../env";
import { currentUser, requireUser } from "../lib/auth";
import { abort, HttpError, modelNotFound, readInput } from "../lib/http";
import { isUuid } from "../lib/uuid";
import { array, max, min, oneOf, required, string, uuid, validate } from "../lib/validator";
import { type Json, userSummary } from "../resources";
import { usersById } from "../resources/load";
import { projectBySlug } from "./public";

// Mounted at /api next to public routes, so auth is per route: a `use("*")` here
// would guard every /api path.
export const partyRoutes = new Hono<AppEnv>();

const fullName = (u: User) => `${u.first_name} ${u.last_name}`.trim();

export async function userByTagname(db: Database, tagname: string): Promise<User> {
  const [user] = await db.select().from(users).where(eq(users.tagname, tagname)).limit(1);
  if (!user) modelNotFound("User", tagname);
  return user;
}

async function presentParty(env: Bindings, db: Database, team: typeof teams.$inferSelect): Promise<Json> {
  const members = await db.select().from(teamMembers).where(eq(teamMembers.team_id, team.id)).orderBy(asc(teamMembers.id));
  const people = await usersById(db, [team.leader_id, ...members.map((m) => m.member_id)]);
  return {
    uuid: team.id,
    leader: userSummary(env, people.get(team.leader_id)!),
    members: members.map((m) => ({
      expertise: m.expertise,
      is_leader: m.member_id === team.leader_id,
      user: userSummary(env, people.get(m.member_id)!),
    })),
  };
}

async function ledTeam(db: Database, userId: string) {
  const [team] = await db.select().from(teams).where(eq(teams.leader_id, userId)).orderBy(asc(teams.id)).limit(1);
  return team ?? null;
}

partyRoutes.get("/party", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const led = await ledTeam(db, me.id);
  const memberOf = await db
    .select({ team: teams })
    .from(teams)
    .innerJoin(teamMembers, and(eq(teamMembers.team_id, teams.id), eq(teamMembers.member_id, me.id)))
    .where(ne(teams.leader_id, me.id))
    .orderBy(asc(teams.id));

  return c.json({
    led: led ? await presentParty(c.env, db, led) : null,
    member_of: await Promise.all(memberOf.map((r) => presentParty(c.env, db, r.team))),
  });
});

partyRoutes.post("/users/:tagname/invite/party", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const target = await userByTagname(db, c.req.param("tagname"));

  if (me.role !== UserRole.Student) throw new HttpError(403, "Only students form parties.");
  if (target.id === me.id) throw new HttpError(422, "You are already in your own party.");
  if (target.role !== UserRole.Student) throw new HttpError(422, "Only students can join a party.");

  const team = (await ledTeam(db, me.id)) ?? (await db.insert(teams).values({ leader_id: me.id }).returning())[0]!;
  await db.insert(teamMembers).values({ team_id: team.id, member_id: me.id, expertise: me.expertise }).onConflictDoNothing();

  const already = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(and(eq(teamMembers.team_id, team.id), eq(teamMembers.member_id, target.id)))
    .limit(1);
  if (already.length) throw new HttpError(422, "They are already in your party.");

  // An earlier invitation of any status is reused as it stands.
  await db.insert(teamInvitations).values({ team_id: team.id, from_id: me.id, to_id: target.id }).onConflictDoNothing();
  const [invitation] = await db
    .select()
    .from(teamInvitations)
    .where(and(eq(teamInvitations.team_id, team.id), eq(teamInvitations.from_id, me.id), eq(teamInvitations.to_id, target.id)));
  const inbox = await db.select({ id: inboxes.id }).from(inboxes).where(eq(inboxes.team_invitation_id, invitation!.id)).limit(1);
  if (!inbox.length) {
    await db.insert(inboxes).values({
      recipient_id: target.id,
      sender_id: me.id,
      team_invitation_id: invitation!.id,
      category: InboxCategory.TeamInvitation,
    });
  }

  return c.json({ message: `Invitation sent to ${fullName(target)}.`, party: await presentParty(c.env, db, team) });
});

partyRoutes.delete("/party/members/:tagname", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const target = await userByTagname(db, c.req.param("tagname"));
  const team = await ledTeam(db, me.id);
  if (!team) throw new HttpError(404, "No query results for model [App\\Models\\Team].");
  if (target.id === me.id) throw new HttpError(422, "Disband the party instead of kicking yourself.");

  await db.delete(teamMembers).where(and(eq(teamMembers.team_id, team.id), eq(teamMembers.member_id, target.id)));
  return c.json({ message: `${fullName(target)} has been removed from your party.`, party: await presentParty(c.env, db, team) });
});

partyRoutes.delete("/party/:team/leave", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const id = c.req.param("team");
  if (!isUuid(id)) abort(404, `The route ${c.req.path.replace(/^\//, "")} could not be found.`);
  const [team] = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  if (!team) modelNotFound("Team", id);
  if (team.leader_id === me.id) throw new HttpError(422, "A leader cannot leave their own party.");

  await db.delete(teamMembers).where(and(eq(teamMembers.team_id, team.id), eq(teamMembers.member_id, me.id)));
  return c.json({ message: "You left the party." });
});

/** ApplicationController::assertCanApply. */
async function assertCanApply(db: Database, me: User, project: Project) {
  if (me.role !== UserRole.Student) throw new HttpError(403, "Only students apply to projects.");
  if (project.user_id === me.id) throw new HttpError(422, "You cannot apply to your own project.");
  if (project.status !== ProjectStatus.Hiring || !project.is_open_hiring) {
    throw new HttpError(422, "This project is not accepting applications.");
  }
  const mine = (table: typeof individualApplicants | typeof teamApplicants) =>
    db.select({ id: table.id }).from(table).where(and(eq(table.project_id, project.id), eq(table.from_id, me.id))).limit(1);
  const [solo, team] = await Promise.all([mine(individualApplicants), mine(teamApplicants)]);
  if (solo.length || team.length) throw new HttpError(409, "You have already applied to this project.");
}

/** A Waiting box for a new applicant; an existing box keeps whatever status it has. */
const openProjectBox = (db: Database, projectId: string, userId: string) =>
  db.insert(projectBoxes).values({ project_id: projectId, user_id: userId, status: ProjectBoxStatus.Waiting }).onConflictDoNothing();

async function applyContext(c: Context<AppEnv>) {
  const db = c.get("db");
  const me = currentUser(c);
  const project = await projectBySlug(db, c.req.param("project") ?? "");
  await assertCanApply(db, me, project);
  return { db, me, project };
}

partyRoutes.post("/projects/:project/apply/individual", requireUser, async (c) => {
  const { db, me, project } = await applyContext(c);
  if (!allowsIndividual(project.applicant_type)) throw new HttpError(422, "This project only accepts team applications.");

  const data = await validate(await readInput(c), {
    expertise: [required(), oneOf(EXPERTISE)],
    self_describe: ["nullable", string(), max(2000)],
    apply_reason: ["nullable", string(), max(2000)],
  });

  await db.batch([
    db.insert(individualApplicants).values({
      project_id: project.id,
      from_id: me.id,
      to_id: project.user_id,
      expertise: data.expertise as string,
      self_describe: (data.self_describe as string | null) ?? null,
      apply_reason: (data.apply_reason as string | null) ?? null,
    }),
    openProjectBox(db, project.id, me.id),
  ]);
  return c.json({ message: "Application submitted." }, 201);
});

partyRoutes.post("/projects/:project/apply/team", requireUser, async (c) => {
  const { db, me, project } = await applyContext(c);
  if (!allowsTeam(project.applicant_type)) throw new HttpError(422, "This project only accepts individual applications.");
  const team = await ledTeam(db, me.id);
  if (!team) throw new HttpError(422, "Build a party before applying as a team.");

  const data = await validate(await readInput(c), {
    self_describe: ["nullable", string(), max(2000)],
    apply_reason: ["nullable", string(), max(2000)],
    members: [required(), array(), min(1)],
    "members.*.member_uuid": [required(), uuid()],
    "members.*.expertise": [required(), oneOf(EXPERTISE)],
  });

  const listed = data.members as Array<{ member_uuid: string; expertise: string }>;
  const party = await db
    .select({ id: teamMembers.member_id })
    .from(teamMembers)
    .where(and(eq(teamMembers.team_id, team.id), inArray(teamMembers.member_id, listed.map((m) => m.member_uuid))));
  const inParty = new Set(party.map((p) => p.id));
  if (!listed.every((m) => inParty.has(m.member_uuid))) {
    throw new HttpError(422, "Every applicant has to be a member of your party.");
  }
  // Laravel let a repeated member through to the unique index and failed with a 500.
  const members = [...new Map(listed.map((m) => [m.member_uuid, m])).values()];

  const [application] = await db
    .insert(teamApplicants)
    .values({
      project_id: project.id,
      from_id: me.id,
      to_id: project.user_id,
      self_describe: (data.self_describe as string | null) ?? null,
      apply_reason: (data.apply_reason as string | null) ?? null,
    })
    .returning();
  const statements = members.flatMap((m) => [
    db.insert(applicantTeamMembers).values({ team_applicant_id: application!.id, member_id: m.member_uuid, expertise: m.expertise }),
    openProjectBox(db, project.id, m.member_uuid),
  ]);
  await db.batch(statements as [typeof statements[number], ...typeof statements]);

  return c.json({ message: "Team application submitted." }, 201);
});

partyRoutes.delete("/projects/:project/apply", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const project = await projectBySlug(db, c.req.param("project"));
  const mine = (table: typeof individualApplicants | typeof teamApplicants) =>
    and(eq(table.project_id, project.id), eq(table.from_id, me.id));

  const [solo, team] = await Promise.all([
    db.select({ id: individualApplicants.id }).from(individualApplicants).where(mine(individualApplicants)).limit(1),
    db.select({ id: teamApplicants.id }).from(teamApplicants).where(mine(teamApplicants)).limit(1),
  ]);
  if (!solo.length && !team.length) throw new HttpError(404, "You have not applied to this project.");

  await db.batch([
    db.delete(individualApplicants).where(mine(individualApplicants)),
    db.delete(teamApplicants).where(mine(teamApplicants)),
    db
      .delete(projectBoxes)
      .where(and(eq(projectBoxes.project_id, project.id), eq(projectBoxes.user_id, me.id), eq(projectBoxes.status, ProjectBoxStatus.Waiting))),
  ]);
  return c.json({ message: "Application withdrawn." });
});

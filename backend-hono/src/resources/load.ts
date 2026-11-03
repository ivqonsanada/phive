/**
 * Batch loaders for the relations the resources need — Eloquent's eager loading,
 * done by hand so a page of projects costs a fixed number of queries.
 */
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";

import {
  experiences,
  inboxes,
  leaderboards,
  projectBoxes,
  projectRequirements,
  projectReviews,
  projectSkills,
  projectTeamMembers,
  projectTeams,
  projects,
  type User,
  userSkills,
  users,
  wishlists,
} from "../db/schema";
import { ProjectBoxStatus } from "../domain/enums";
import type { Bindings, Database } from "../env";
import { type Json, projectResource, type UserRelations, userSummary } from "./index";

type ProjectRow = typeof projects.$inferSelect;

/** D1 allows 100 bound parameters per statement. */
export async function chunked<T>(ids: string[], run: (part: string[]) => Promise<T[]>): Promise<T[]> {
  const unique = [...new Set(ids)];
  const out: T[] = [];
  for (let i = 0; i < unique.length; i += 90) out.push(...(await run(unique.slice(i, i + 90))));
  return out;
}

export async function usersById(db: Database, ids: string[]): Promise<Map<string, User>> {
  const rows = await chunked(ids, (part) => db.select().from(users).where(inArray(users.id, part)));
  return new Map(rows.map((u) => [u.id, u]));
}

export async function loadUserRelations(db: Database, userId: string): Promise<Required<Omit<UserRelations, "unread_inbox_count">>> {
  const [skills, exps, boards] = await Promise.all([
    db.select({ name: userSkills.name }).from(userSkills).where(eq(userSkills.user_id, userId)).orderBy(asc(userSkills.id)),
    db.select().from(experiences).where(eq(experiences.user_id, userId)).orderBy(desc(experiences.start_date)),
    db.select().from(leaderboards).where(eq(leaderboards.user_id, userId)).orderBy(desc(leaderboards.points), asc(leaderboards.id)),
  ]);
  return { skills: skills.map((s) => s.name), experiences: exps, leaderboards: boards };
}

export async function unreadInboxCount(db: Database, userId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(inboxes)
    .where(and(eq(inboxes.recipient_id, userId), eq(inboxes.is_read, false)));
  return row?.n ?? 0;
}

/** `withCount('finishedProjects')`: Finished project boxes per user. */
export async function finishedCounts(db: Database, userIds: string[]): Promise<Map<string, number>> {
  const rows = await chunked(userIds, (part) =>
    db
      .select({ user_id: projectBoxes.user_id, n: count() })
      .from(projectBoxes)
      .where(and(inArray(projectBoxes.user_id, part), eq(projectBoxes.status, ProjectBoxStatus.Finished)))
      .groupBy(projectBoxes.user_id),
  );
  return new Map(rows.map((r) => [r.user_id, r.n]));
}

export async function projectTeam(env: Bindings, db: Database, projectId: string): Promise<Json | null> {
  const [team] = await db.select().from(projectTeams).where(eq(projectTeams.project_id, projectId)).orderBy(asc(projectTeams.id)).limit(1);
  if (!team) return null;

  const members = await db
    .select()
    .from(projectTeamMembers)
    .where(eq(projectTeamMembers.project_team_id, team.id))
    .orderBy(asc(projectTeamMembers.id));
  const people = await usersById(db, [...members.map((m) => m.member_id), ...(team.leader_id ? [team.leader_id] : [])]);
  const leader = team.leader_id ? people.get(team.leader_id) : undefined;

  return {
    uuid: team.id,
    leader: leader ? userSummary(env, leader) : null,
    members: members.map((m) => ({
      expertise: m.expertise,
      score: m.score,
      assessment: m.assessment,
      user: userSummary(env, people.get(m.member_id)!),
    })),
  };
}

export interface PresentOptions {
  /** skills and requirements (the management endpoints). */
  withLists?: boolean;
  /** lists plus team and review (the detail endpoint). */
  detail?: boolean;
  /** Adds `is_wished` for this viewer; leave undefined to omit the key. */
  viewerId?: string | null;
}

export async function presentProjects(
  env: Bindings,
  db: Database,
  rows: ProjectRow[],
  options: PresentOptions = {},
): Promise<Json[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((p) => p.id);
  const lists = options.withLists || options.detail;

  const [owners, skills, requirements, wished] = await Promise.all([
    usersById(db, rows.map((p) => p.user_id)),
    lists
      ? chunked(ids, (part) => db.select().from(projectSkills).where(inArray(projectSkills.project_id, part)).orderBy(asc(projectSkills.id)))
      : Promise.resolve([]),
    lists
      ? chunked(ids, (part) => db.select().from(projectRequirements).where(inArray(projectRequirements.project_id, part)).orderBy(asc(projectRequirements.id)))
      : Promise.resolve([]),
    options.viewerId
      ? chunked(ids, (part) =>
          db
            .select({ project_id: wishlists.project_id })
            .from(wishlists)
            .where(and(eq(wishlists.user_id, options.viewerId!), eq(wishlists.status, true), inArray(wishlists.project_id, part))),
        )
      : Promise.resolve([]),
  ]);
  const wishedIds = new Set(wished.map((w) => w.project_id));

  const out: Json[] = [];
  for (const p of rows) {
    const extra = options.detail
      ? {
          team: await projectTeam(env, db, p.id),
          review: (await db.select().from(projectReviews).where(eq(projectReviews.project_id, p.id)).orderBy(asc(projectReviews.id)).limit(1))[0] ?? null,
        }
      : {};
    out.push(
      projectResource(env, p, {
        user: userSummary(env, owners.get(p.user_id)!),
        ...(options.viewerId ? { is_wished: wishedIds.has(p.id) } : {}),
        ...(lists
          ? {
              skills: skills.filter((s) => s.project_id === p.id).map((s) => s.name),
              requirements: requirements.filter((r) => r.project_id === p.id).map((r) => r.requirement),
            }
          : {}),
        ...extra,
      }),
    );
  }
  return out;
}

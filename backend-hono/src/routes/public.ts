/** Public reads (home, explore, detail, similar, leaderboards, profiles) and the wishlist. */
import { and, count, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { Hono } from "hono";

import { leaderboards, projectBoxes, projects, users, wishlists } from "../db/schema";
import {
  EXPERTISE,
  EXPERTISE_COLUMN,
  type Expertise,
  PROJECT_STATUSES,
  ProjectBoxStatus,
  ProjectStatus,
  UserRole,
} from "../domain/enums";
import type { AppEnv, Bindings, Database } from "../env";
import { currentUser, requireUser } from "../lib/auth";
import { abort, HttpError, modelNotFound, readInput } from "../lib/http";
import { boolean, max, oneOf, string, toBool, validate } from "../lib/validator";
import { userResource, userSummary } from "../resources";
import { finishedCounts, loadUserRelations, presentProjects, usersById } from "../resources/load";

export const publicRoutes = new Hono<AppEnv>();

const PER_PAGE = 9;
const published = ne(projects.status, ProjectStatus.Draft);

export async function projectBySlug(db: Database, slug: string) {
  const [project] = await db.select().from(projects).where(eq(projects.project_url, slug)).limit(1);
  if (!project) modelNotFound("Project", slug);
  return project;
}

const boardKey = (e: Expertise) => EXPERTISE_COLUMN[e];

async function leaderboardEntries(env: Bindings, db: Database, rows: (typeof leaderboards.$inferSelect)[]) {
  const ids = rows.map((r) => r.user_id);
  const [people, finished] = await Promise.all([usersById(db, ids), finishedCounts(db, ids)]);
  return rows.map((r) => ({
    uuid: r.id,
    expertise: r.expertise,
    points: r.points,
    user: userSummary(env, people.get(r.user_id)!, finished.get(r.user_id) ?? 0),
  }));
}

function boardQuery(db: Database, expertise: Expertise, limit: number | null) {
  const query = db
    .select()
    .from(leaderboards)
    .where(eq(leaderboards.expertise, expertise))
    .orderBy(desc(leaderboards.points), leaderboards.id);
  return limit === null ? query : query.limit(limit);
}

publicRoutes.get("/home", async (c) => {
  const db = c.get("db");
  const [groups, latest] = await Promise.all([
    db.select({ status: projects.status, n: count() }).from(projects).groupBy(projects.status),
    db
      .select()
      .from(projects)
      .where(and(eq(projects.status, ProjectStatus.Hiring), eq(projects.is_open_hiring, true)))
      .orderBy(desc(projects.created_at), desc(projects.id))
      .limit(6),
  ]);
  const tally = (status: string) => groups.find((g) => g.status === status)?.n ?? 0;

  const topBoards: Record<string, unknown> = {};
  for (const expertise of EXPERTISE) {
    const [top] = await boardQuery(db, expertise, 1);
    topBoards[boardKey(expertise)] = top ? (await leaderboardEntries(c.env, db, [top]))[0] : null;
  }

  return c.json({
    stats: { hiring: tally("Hiring"), ongoing: tally("Ongoing"), finished: tally("Finished") },
    top_boards: topBoards,
    latest_projects: await presentProjects(c.env, db, latest),
  });
});

/** PHP's (int) cast: leading digits, else 0. */
function phpInt(value: unknown, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

publicRoutes.get("/projects", async (c) => {
  const db = c.get("db");
  const input = await readInput(c);
  await validate(input, {
    query: ["nullable", string(), max(255)],
    expertise: ["nullable", oneOf(EXPERTISE)],
    status: ["nullable", oneOf(PROJECT_STATUSES)],
    open_only: ["nullable", boolean()],
  });

  const page = Math.max(1, phpInt(input.page, 1) || 1);
  const filters = [published];
  const term = input.query;
  // PHP truthiness: "0" does not filter.
  if (typeof term === "string" && term !== "0") {
    const pattern = `%${term.toLowerCase()}%`;
    filters.push(or(sql`lower(${projects.title}) LIKE ${pattern}`, sql`lower(${projects.description}) LIKE ${pattern}`)!);
  }
  if (typeof input.expertise === "string") {
    filters.push(eq(projects[EXPERTISE_COLUMN[input.expertise as Expertise]], true));
  }
  if (typeof input.status === "string") filters.push(eq(projects.status, input.status));
  if (input.open_only !== null && input.open_only !== undefined && toBool(input.open_only)) {
    filters.push(eq(projects.is_open_hiring, true));
  }

  const rows = await db
    .select()
    .from(projects)
    .where(and(...filters))
    .orderBy(desc(projects.created_at), desc(projects.id))
    .limit(PER_PAGE + 1)
    .offset((page - 1) * PER_PAGE);
  const hasMore = rows.length > PER_PAGE;
  const items = rows.slice(0, PER_PAGE);

  // simplePaginate's envelope. Links are absolute: the frontend parses them with new URL().
  const url = new URL(c.req.url);
  const base = `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  const kept = [...url.searchParams]
    .filter(([k]) => k !== "page")
    .map(([k, v]) => [k, v.trim()] as const)
    .filter(([, v]) => v !== "");
  const link = (n: number) =>
    `${base}?${[...kept.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`), `page=${n}`].join("&")}`;
  const from = items.length ? (page - 1) * PER_PAGE + 1 : null;

  const viewer = c.get("user");
  return c.json({
    data: await presentProjects(c.env, db, items, { viewerId: viewer?.id ?? null }),
    links: { first: link(1), last: null, prev: page > 1 ? link(page - 1) : null, next: hasMore ? link(page + 1) : null },
    meta: {
      current_page: page,
      current_page_url: link(page),
      from,
      path: base,
      per_page: PER_PAGE,
      to: from === null ? null : from + items.length - 1,
    },
  });
});

publicRoutes.get("/projects/:project", async (c) => {
  const db = c.get("db");
  const project = await projectBySlug(db, c.req.param("project"));
  if (project.status === ProjectStatus.Draft) modelNotFound("Project", project.project_url ?? project.id);

  const viewer = c.get("user");
  const [out] = await presentProjects(c.env, db, [project], { detail: true, viewerId: viewer?.id ?? null });
  return c.json(out);
});

publicRoutes.get("/projects/:project/similar", async (c) => {
  const db = c.get("db");
  const project = await projectBySlug(db, c.req.param("project"));
  const viewer = c.get("user");

  const filters = [published, ne(projects.id, project.id)];
  if (viewer?.expertise && viewer.expertise in EXPERTISE_COLUMN) {
    filters.push(eq(projects[EXPERTISE_COLUMN[viewer.expertise as Expertise]], true));
  }
  const rows = await db.select().from(projects).where(and(...filters)).orderBy(sql`random()`).limit(3);
  return c.json(await presentProjects(c.env, db, rows, { viewerId: viewer?.id ?? null }));
});

publicRoutes.get("/leaderboards", async (c) => {
  const db = c.get("db");
  const requested = phpInt(c.req.query("limit"), 10);
  const limit = requested < 0 ? null : Math.min(requested, 50);

  const boards: Record<string, unknown> = {};
  for (const expertise of EXPERTISE) {
    boards[boardKey(expertise)] = limit === 0 ? [] : await leaderboardEntries(c.env, db, await boardQuery(db, expertise, limit));
  }
  return c.json({ boards });
});

publicRoutes.get("/users/:tagname", async (c) => {
  const db = c.get("db");
  const tagname = c.req.param("tagname");
  const [user] = await db.select().from(users).where(eq(users.tagname, tagname)).limit(1);
  if (!user) modelNotFound("User", tagname);

  const rows =
    user.role === UserRole.Lecturer
      ? await db.select().from(projects).where(and(published, eq(projects.user_id, user.id))).orderBy(desc(projects.created_at), desc(projects.id))
      : await db
          .select()
          .from(projects)
          .where(
            and(
              published,
              inArray(
                projects.id,
                db
                  .select({ id: projectBoxes.project_id })
                  .from(projectBoxes)
                  .where(and(eq(projectBoxes.user_id, user.id), eq(projectBoxes.status, ProjectBoxStatus.Finished))),
              ),
            ),
          )
          .orderBy(desc(projects.created_at), desc(projects.id));

  const isSelf = c.get("user")?.id === user.id;
  return c.json({
    user: userResource(c.env, user, await loadUserRelations(db, user.id), { hidePrivate: !isSelf }),
    projects: await presentProjects(c.env, db, rows),
  });
});

publicRoutes.get("/wishlist", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const rows = await db
    .select({ project: projects })
    .from(projects)
    .innerJoin(wishlists, and(eq(wishlists.project_id, projects.id), eq(wishlists.user_id, me.id), eq(wishlists.status, true)))
    .where(published)
    .orderBy(desc(projects.created_at), desc(projects.id));
  return c.json({ projects: await presentProjects(c.env, db, rows.map((r) => r.project)) });
});

publicRoutes.post("/projects/:project/wishlist", requireUser, async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const project = await projectBySlug(db, c.req.param("project"));
  if (project.status === ProjectStatus.Draft) abort(404);
  if (me.role !== UserRole.Student) throw new HttpError(403, "Only students keep a wishlist.");

  const [row] = await db
    .insert(wishlists)
    .values({ user_id: me.id, project_id: project.id, status: true })
    .onConflictDoUpdate({
      target: [wishlists.user_id, wishlists.project_id],
      set: { status: sql`NOT ${wishlists.status}`, updated_at: new Date() },
    })
    .returning({ status: wishlists.status });
  return c.json({ is_wished: Boolean(row!.status) });
});

/** Lecturer project management under /my/projects, plus direct invitations. */
import { and, desc, eq } from "drizzle-orm";
import { type Context, Hono } from "hono";

import {
  inboxes,
  projectBoxes,
  projectInvitations,
  projectRequirements,
  projectSkills,
  projectTeamMembers,
  projectTeams,
  projects,
  type Project,
  type User,
  users,
} from "../db/schema";
import { APPLICANT_TYPES, EXPERTISE_COLUMN, InboxCategory, PROJECT_LEVELS, ProjectBoxStatus, ProjectStatus, UserRole } from "../domain/enums";
import type { AppEnv, Database } from "../env";
import { currentUser, randomString, requireUser } from "../lib/auth";
import { HttpError, modelNotFound, readInput, validationError } from "../lib/http";
import { deleteUpload, replaceUpload } from "../lib/storage";
import {
  array,
  boolean,
  image,
  max,
  mimes,
  min,
  numeric,
  oneOf,
  required,
  string,
  toBool,
  validate,
} from "../lib/validator";
import { presentProjects } from "../resources/load";
import { projectBySlug } from "./public";
import { uploadLimit } from "./settings";

export const myProjectRoutes = new Hono<AppEnv>();
myProjectRoutes.use("*", requireUser);

const UNAUTHORIZED = "This action is unauthorized.";

/** ProjectPolicy: admins may do anything; otherwise lecturers, and only their own. */
function can(user: User, ability: "create" | "update", project?: Project): boolean {
  if (user.is_admin) return true;
  if (user.role !== UserRole.Lecturer) return false;
  return ability === "create" || project?.user_id === user.id;
}

export function authorize(user: User, ability: "create" | "update", project?: Project) {
  if (!can(user, ability, project)) throw new HttpError(403, UNAUTHORIZED);
}

/** ProjectUrl::generate: slug of the title, cut to 60, plus a random 8-char suffix. */
async function generateProjectUrl(db: Database, title: string | null): Promise<string> {
  const slug = (title ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^\x00-\x7f]/g, "")
    .replace(/_+/g, "-")
    .replace(/@/g, "-at-")
    .toLowerCase()
    .replace(/[^-a-z0-9\s]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = (slug || "project").slice(0, 60).trimEnd();

  for (;;) {
    const candidate = `${base}-${randomString(8).toLowerCase()}`;
    const taken = await db.select({ id: projects.id }).from(projects).where(eq(projects.project_url, candidate)).limit(1);
    if (!taken.length) return candidate;
  }
}

const EXPERTISE_FLAGS = Object.values(EXPERTISE_COLUMN);

/** Laravel turned a null into a 500 on these NOT NULL columns; here it means the default. */
const COLUMN_DEFAULTS: Record<string, unknown> = {
  applicant_type: "Individual & Team",
  max_person: "Not Specified",
  currency: "IDR",
  salary_amount: "0",
  payment_type: "person",
  ui_ux_designer: false,
  front_end_engineer: false,
  back_end_engineer: false,
  data_expert: false,
  certificate: false,
  salary: false,
};
const BOOLEAN_COLUMNS = new Set([...EXPERTISE_FLAGS, "certificate", "salary"]);

/** SaveProjectRequest, including its publish-only after-hook. */
async function validateSave(input: Record<string, unknown>) {
  const publishing = input.publish === true || input.publish === 1 || input.publish === "1";
  const whenPublishing = publishing ? required() : ("nullable" as const);
  const flag = ["nullable" as const, boolean()];

  let data: Record<string, unknown> = {};
  let errors: Record<string, string[]> = {};
  try {
    data = await validate(input, {
      publish: ["nullable", boolean()],
      title: [whenPublishing, string(), max(255)],
      description: [whenPublishing, string(), max(20000)],
      applicant_type: ["nullable", oneOf(APPLICANT_TYPES)],
      max_person: ["nullable", string(), max(50)],
      level_applicant: ["nullable", oneOf(PROJECT_LEVELS)],
      ui_ux_designer: flag,
      front_end_engineer: flag,
      back_end_engineer: flag,
      data_expert: flag,
      certificate: flag,
      salary: flag,
      currency: ["nullable", string(), max(8)],
      salary_amount: ["nullable", numeric(), min(0)],
      payment_type: ["nullable", oneOf(["person", "project"])],
      skills: ["nullable", array(), max(20)],
      "skills.*": [string(), max(50)],
      requirements: ["nullable", array(), max(20)],
      "requirements.*": [string(), max(255)],
    });
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 422) throw error;
    errors = (error.body.errors as Record<string, string[]>) ?? {};
  }

  if (publishing) {
    if (!EXPERTISE_FLAGS.some((f) => toBool(input[f]) || input[f] === "true")) {
      (errors.ui_ux_designer ??= []).push("Choose at least one expertise this project is hiring for.");
    }
    const amount = Number(input.salary_amount);
    if (toBool(input.salary) && !(Number.isFinite(amount) && amount > 0)) {
      (errors.salary_amount ??= []).push("A paid project needs a salary amount above zero.");
    }
  }
  if (Object.keys(errors).length) throw validationError(errors);

  const columns: Record<string, unknown> = {};
  for (const key of ["title", "description", "applicant_type", "max_person", "level_applicant", ...BOOLEAN_COLUMNS, "currency", "salary_amount", "payment_type"]) {
    if (!(key in data)) continue;
    const value = data[key];
    if (value === null && key in COLUMN_DEFAULTS) columns[key] = COLUMN_DEFAULTS[key];
    else if (BOOLEAN_COLUMNS.has(key)) columns[key] = toBool(value);
    else if (key === "salary_amount") columns[key] = String(value);
    else columns[key] = value;
  }

  return {
    publishing,
    columns,
    // `skills: null` was a 500 in Laravel; it clears the list here, as `[]` does.
    skills: "skills" in data ? [...new Set((data.skills as string[] | null) ?? [])] : undefined,
    requirements: "requirements" in data ? ((data.requirements as string[] | null) ?? []) : undefined,
  };
}

function syncLists(db: Database, projectId: string, skills?: string[], requirements?: string[]) {
  const statements = [];
  if (skills) {
    statements.push(db.delete(projectSkills).where(eq(projectSkills.project_id, projectId)));
    if (skills.length) statements.push(db.insert(projectSkills).values(skills.map((name) => ({ project_id: projectId, name }))));
  }
  if (requirements) {
    statements.push(db.delete(projectRequirements).where(eq(projectRequirements.project_id, projectId)));
    if (requirements.length) {
      statements.push(db.insert(projectRequirements).values(requirements.map((requirement) => ({ project_id: projectId, requirement }))));
    }
  }
  return statements;
}

/** The owner's own project box mirrors the project's stage. */
function upsertOwnerBox(db: Database, project: Pick<Project, "id" | "user_id">, status: string) {
  return db
    .insert(projectBoxes)
    .values({ project_id: project.id, user_id: project.user_id, status })
    .onConflictDoUpdate({ target: [projectBoxes.project_id, projectBoxes.user_id], set: { status, updated_at: new Date() } });
}

async function present(c: Context<AppEnv>, project: Project, withLists = true) {
  const db = c.get("db");
  const [fresh] = await db.select().from(projects).where(eq(projects.id, project.id));
  const [out] = await presentProjects(c.env, db, [fresh!], { withLists });
  return out;
}

myProjectRoutes.get("/", async (c) => {
  const db = c.get("db");
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.user_id, currentUser(c).id))
    .orderBy(desc(projects.created_at), desc(projects.id));
  return c.json(await presentProjects(c.env, db, rows, { withLists: true }));
});

myProjectRoutes.post("/", async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const save = await validateSave(await readInput(c));
  authorize(me, "create");

  const status = save.publishing ? ProjectStatus.Hiring : ProjectStatus.Draft;
  const [project] = await db
    .insert(projects)
    .values({
      ...save.columns,
      user_id: me.id,
      status,
      project_url: await generateProjectUrl(db, (save.columns.title as string | null) ?? null),
    })
    .returning();

  const statements = [
    ...syncLists(db, project!.id, save.skills, save.requirements),
    upsertOwnerBox(db, project!, save.publishing ? ProjectBoxStatus.Hiring : ProjectBoxStatus.Draft),
  ];
  await db.batch(statements as [typeof statements[number], ...typeof statements]);

  // Laravel echoed its in-memory model, nulls and all; this is the stored row.
  return c.json({ message: save.publishing ? "Project published." : "Draft saved.", project: await present(c, project!) }, 201);
});

myProjectRoutes.patch("/:project", async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const project = await projectBySlug(db, c.req.param("project"));
  const save = await validateSave(await readInput(c));
  authorize(me, "update", project);

  // Laravel rewrote the status on every save, so "Save draft" on a running or finished
  // project knocked it back to Draft. Here a save only moves a project between Draft
  // and Hiring; Ongoing and Finished are left to start and review.
  const movable = project.status === ProjectStatus.Draft || project.status === ProjectStatus.Hiring;
  const status = movable ? (save.publishing ? ProjectStatus.Hiring : ProjectStatus.Draft) : project.status;

  const statements = [
    db.update(projects).set({ ...save.columns, status, updated_at: new Date() }).where(eq(projects.id, project.id)),
    ...syncLists(db, project.id, save.skills, save.requirements),
    ...(movable ? [upsertOwnerBox(db, project, save.publishing ? ProjectBoxStatus.Hiring : ProjectBoxStatus.Draft)] : []),
  ];
  await db.batch(statements as [typeof statements[number], ...typeof statements]);

  return c.json({ message: save.publishing ? "Project published." : "Changes saved.", project: await present(c, project) });
});

myProjectRoutes.delete("/:project", async (c) => {
  const db = c.get("db");
  const project = await projectBySlug(db, c.req.param("project"));
  authorize(currentUser(c), "update", project);
  if (project.status === ProjectStatus.Ongoing) {
    throw new HttpError(409, "An ongoing project cannot be deleted — terminate it from the project box instead.");
  }
  await db.delete(projects).where(eq(projects.id, project.id));
  // Laravel left the file behind; nothing else points at it.
  await deleteUpload(c.env, project.thumbnail);
  return c.json({ message: "Project withdrawn." });
});

myProjectRoutes.post("/:project/publish", async (c) => {
  const db = c.get("db");
  const project = await projectBySlug(db, c.req.param("project"));
  authorize(currentUser(c), "update", project);
  if (project.status !== ProjectStatus.Draft) throw new HttpError(409, "Only a draft can be published.");
  if (!project.title?.trim() || !project.description?.trim()) {
    throw new HttpError(422, "Give the project a title and description before publishing it.");
  }

  await db.batch([
    db.update(projects).set({ status: ProjectStatus.Hiring, is_open_hiring: true, updated_at: new Date() }).where(eq(projects.id, project.id)),
    upsertOwnerBox(db, project, ProjectBoxStatus.Hiring),
  ]);
  return c.json({ message: "Project published.", project: await present(c, project) });
});

myProjectRoutes.post("/:project/close", async (c) => {
  const db = c.get("db");
  const project = await projectBySlug(db, c.req.param("project"));
  authorize(currentUser(c), "update", project);
  await db.batch([
    db.update(projects).set({ is_open_hiring: false, updated_at: new Date() }).where(eq(projects.id, project.id)),
    db
      .update(projectBoxes)
      .set({ status: ProjectBoxStatus.Confirmation, updated_at: new Date() })
      .where(and(eq(projectBoxes.project_id, project.id), eq(projectBoxes.user_id, project.user_id))),
  ]);
  return c.json({ message: "Applications closed." });
});

myProjectRoutes.post("/:project/thumbnail", async (c) => {
  const db = c.get("db");
  const project = await projectBySlug(db, c.req.param("project"));
  authorize(currentUser(c), "update", project);
  const data = await validate(await readInput(c), {
    file: [required(), image(), mimes("jpeg", "jpg", "png", "webp"), max(uploadLimit(c.env, "thumbnail"))],
  });
  const key = await replaceUpload(c.env, project.thumbnail, "project-thumbnails", data.file as File);
  await db.update(projects).set({ thumbnail: key, updated_at: new Date() }).where(eq(projects.id, project.id));
  return c.json({ message: "Thumbnail updated.", project: await present(c, project, false) });
});

myProjectRoutes.delete("/:project/thumbnail", async (c) => {
  const db = c.get("db");
  const project = await projectBySlug(db, c.req.param("project"));
  authorize(currentUser(c), "update", project);
  await deleteUpload(c.env, project.thumbnail);
  await db.update(projects).set({ thumbnail: null, updated_at: new Date() }).where(eq(projects.id, project.id));
  return c.json({ message: "Thumbnail removed." });
});

myProjectRoutes.post("/:project/invite/:tagname", async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const project = await projectBySlug(db, c.req.param("project"));
  const tagname = c.req.param("tagname");
  const [invitee] = await db.select().from(users).where(eq(users.tagname, tagname)).limit(1);
  if (!invitee) modelNotFound("User", tagname);
  authorize(me, "update", project);

  if (invitee.id === me.id) throw new HttpError(422, "You cannot invite yourself.");
  if (invitee.role !== UserRole.Student) throw new HttpError(422, "Only students can be invited to a project.");

  // As in Laravel, the (leaderless) team exists from the first invitation on.
  let [team] = await db.select().from(projectTeams).where(eq(projectTeams.project_id, project.id)).limit(1);
  team ??= (await db.insert(projectTeams).values({ project_id: project.id }).returning())[0]!;

  const onTeam = await db
    .select({ id: projectTeamMembers.id })
    .from(projectTeamMembers)
    .where(and(eq(projectTeamMembers.project_team_id, team.id), eq(projectTeamMembers.member_id, invitee.id)))
    .limit(1);
  if (onTeam.length) throw new HttpError(422, "They are already on this project team.");

  await db.insert(projectInvitations).values({ project_id: project.id, from_id: me.id, to_id: invitee.id }).onConflictDoNothing();
  const [invitation] = await db
    .select()
    .from(projectInvitations)
    .where(and(eq(projectInvitations.project_id, project.id), eq(projectInvitations.from_id, me.id), eq(projectInvitations.to_id, invitee.id)));
  const existing = await db.select({ id: inboxes.id }).from(inboxes).where(eq(inboxes.project_invitation_id, invitation!.id)).limit(1);
  if (!existing.length) {
    await db.insert(inboxes).values({
      recipient_id: invitee.id,
      sender_id: me.id,
      project_invitation_id: invitation!.id,
      category: InboxCategory.ProjectInvitation,
    });
  }

  return c.json({ message: `Invitation sent to ${`${invitee.first_name} ${invitee.last_name}`.trim()}.` });
});

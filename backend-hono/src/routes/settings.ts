/** Own profile, avatar, CV and experiences. */
import { and, eq, ne } from "drizzle-orm";
import { type Context, Hono } from "hono";

import { experiences, userSkills, users } from "../db/schema";
import { EXPERTISE } from "../domain/enums";
import type { AppEnv, Bindings } from "../env";
import { currentUser, requireUser } from "../lib/auth";
import { abort, modelNotFound, readInput } from "../lib/http";
import { deleteUpload, replaceUpload } from "../lib/storage";
import { isUuid } from "../lib/uuid";
import {
  afterOrEqual,
  array,
  boolean,
  date,
  file,
  image,
  max,
  mimes,
  min,
  oneOf,
  regex,
  required,
  string,
  toBool,
  unique,
  url,
  validate,
} from "../lib/validator";
import { experienceResource, userResource } from "../resources";
import { loadUserRelations } from "../resources/load";

export const settingsRoutes = new Hono<AppEnv>();
settingsRoutes.use("*", requireUser);

/** config/phive.php `uploads`, in kilobytes. */
export function uploadLimit(env: Bindings, kind: "avatar" | "cv" | "thumbnail"): number {
  const vars = env as unknown as Record<string, string | undefined>;
  const fallback = { avatar: 1024, cv: 4096, thumbnail: 2048 }[kind];
  return Number(vars[`UPLOAD_${kind.toUpperCase()}_MAX_KB`] ?? fallback);
}

const text = (limit: number) => ["sometimes", "nullable", string(), max(limit)] as const;

settingsRoutes.patch("/profile", async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const data = await validate(
    await readInput(c),
    {
      first_name: ["sometimes", string(), max(255)],
      last_name: [...text(255)],
      tagname: [
        "sometimes",
        string(),
        min(3),
        max(30),
        regex(/^[a-z0-9_]+$/),
        unique(async (v) =>
          (await db.select({ id: users.id }).from(users).where(and(eq(users.tagname, String(v)), ne(users.id, me.id))).limit(1)).length > 0,
        ),
      ],
      identity_number: [...text(50)],
      expertise: ["sometimes", "nullable", oneOf(EXPERTISE)],
      university: [...text(255)],
      faculty: [...text(255)],
      major: [...text(255)],
      location: [...text(255)],
      biography: [...text(5000)],
      is_open_hired: ["sometimes", boolean()],
      behance: ["sometimes", "nullable", url(), max(255)],
      github: ["sometimes", "nullable", url(), max(255)],
      linkedin: ["sometimes", "nullable", url(), max(255)],
      dribbble: ["sometimes", "nullable", url(), max(255)],
      website: ["sometimes", "nullable", url(), max(255)],
      skills: ["sometimes", array(), max(30)],
      "skills.*": [string(), max(50)],
    },
    { "tagname.regex": "Handles may only contain lowercase letters, numbers and underscores." },
  );

  const { skills, ...fields } = data;
  // Laravel let a cleared last name through to a NOT NULL column and failed with a
  // 500; it is stored as "" instead, as registration does.
  if ("last_name" in fields && fields.last_name === null) fields.last_name = "";
  if ("is_open_hired" in fields) fields.is_open_hired = toBool(fields.is_open_hired);

  const statements = [];
  if (Object.keys(fields).length) {
    statements.push(db.update(users).set({ ...fields, updated_at: new Date() }).where(eq(users.id, me.id)));
  }
  if (skills !== undefined) {
    statements.push(db.delete(userSkills).where(eq(userSkills.user_id, me.id)));
    const names = [...new Set(skills as string[])];
    if (names.length) statements.push(db.insert(userSkills).values(names.map((name) => ({ user_id: me.id, name }))));
  }
  if (statements.length) await db.batch(statements as [typeof statements[number], ...typeof statements]);

  const [fresh] = await db.select().from(users).where(eq(users.id, me.id));
  return c.json({ message: "Profile updated.", user: userResource(c.env, fresh!, await loadUserRelations(db, me.id)) });
});

settingsRoutes.post("/avatar", async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const data = await validate(await readInput(c), {
    file: [required(), image(), mimes("jpeg", "jpg", "png", "webp"), max(uploadLimit(c.env, "avatar"))],
  });
  const key = await replaceUpload(c.env, me.photo_url, "avatars", data.file as File);
  const [fresh] = await db.update(users).set({ photo_url: key, updated_at: new Date() }).where(eq(users.id, me.id)).returning();
  return c.json({ message: "Avatar updated.", user: userResource(c.env, fresh!) });
});

settingsRoutes.delete("/avatar", async (c) => {
  const me = currentUser(c);
  await deleteUpload(c.env, me.photo_url);
  await c.get("db").update(users).set({ photo_url: null, updated_at: new Date() }).where(eq(users.id, me.id));
  return c.json({ message: "Avatar removed." });
});

settingsRoutes.post("/cv", async (c) => {
  const db = c.get("db");
  const me = currentUser(c);
  const data = await validate(await readInput(c), {
    file: [required(), file(), mimes("pdf"), max(uploadLimit(c.env, "cv"))],
  });
  const key = await replaceUpload(c.env, me.cv_url, "cv", data.file as File);
  const [fresh] = await db.update(users).set({ cv_url: key, updated_at: new Date() }).where(eq(users.id, me.id)).returning();
  return c.json({ message: "CV updated.", user: userResource(c.env, fresh!) });
});

settingsRoutes.delete("/cv", async (c) => {
  const me = currentUser(c);
  await deleteUpload(c.env, me.cv_url);
  await c.get("db").update(users).set({ cv_url: null, updated_at: new Date() }).where(eq(users.id, me.id));
  return c.json({ message: "CV removed." });
});

const experienceRules = {
  project_name: [required(), string(), max(255)],
  project_role: [required(), string(), max(255)],
  start_date: [required(), date()],
  end_date: ["nullable" as const, date(), afterOrEqual("start_date")],
};

const day = (value: unknown) => new Date(Date.parse(String(value))).toISOString().slice(0, 10);

settingsRoutes.post("/experiences", async (c) => {
  const me = currentUser(c);
  const data = await validate(await readInput(c), experienceRules);
  const [row] = await c
    .get("db")
    .insert(experiences)
    .values({
      user_id: me.id,
      project_name: data.project_name as string,
      project_role: data.project_role as string,
      start_date: day(data.start_date),
      end_date: data.end_date ? day(data.end_date) : null,
    })
    .returning();
  return c.json({ experience: experienceResource(row!) }, 201);
});

/** whereUuid → 404 route, binding miss → 404 model, then ownership → bare 403. */
async function ownExperience(c: Context<AppEnv>) {
  const id = c.req.param("experience") ?? "";
  if (!isUuid(id)) {
    return abort(404, `The route ${c.req.path.replace(/^\//, "")} could not be found.`);
  }
  const [row] = await c.get("db").select().from(experiences).where(eq(experiences.id, id)).limit(1);
  if (!row) modelNotFound("Experience", id);
  if (row.user_id !== currentUser(c).id) abort(403);
  return row;
}

settingsRoutes.patch("/experiences/:experience", async (c) => {
  const row = await ownExperience(c);
  const data = await validate(await readInput(c), experienceRules);
  const [updated] = await c
    .get("db")
    .update(experiences)
    .set({
      project_name: data.project_name as string,
      project_role: data.project_role as string,
      start_date: day(data.start_date),
      ...("end_date" in data ? { end_date: data.end_date ? day(data.end_date) : null } : {}),
    })
    .where(eq(experiences.id, row.id))
    .returning();
  return c.json({ experience: experienceResource(updated!) });
});

settingsRoutes.delete("/experiences/:experience", async (c) => {
  const row = await ownExperience(c);
  await c.get("db").delete(experiences).where(eq(experiences.id, row.id));
  return c.json({ message: "Experience removed." });
});

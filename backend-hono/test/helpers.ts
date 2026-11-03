import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { env } from "cloudflare:workers";

import { app } from "../src/app";
import { createDb } from "../src/db/client";
import * as schema from "../src/db/schema";
import { issueToken } from "../src/lib/auth";
import { hashPassword } from "../src/lib/crypto";
import { outbox } from "../src/lib/mail";

export { outbox };
export const db = createDb(env.DB);

export interface Call {
  method?: string;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
}

export async function call(path: string, { method = "GET", body, token, headers = {} }: Call = {}) {
  const init: RequestInit = { method, headers: { Accept: "application/json", ...headers } };
  if (token) (init.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const ctx = createExecutionContext();
  const url = path.startsWith("http") ? path : `http://localhost:8787${path}`;
  const response = await app.request(url, init, env, ctx);
  await waitOnExecutionContext(ctx);
  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: response.status, json, headers: response.headers };
}

let passwordHash: Promise<string> | undefined;

type NewUser = Partial<typeof schema.users.$inferInsert>;

let sequence = 0;

export async function makeUser(overrides: NewUser = {}) {
  passwordHash ??= hashPassword("password");
  sequence++;
  const [user] = await db
    .insert(schema.users)
    .values({
      first_name: "Test",
      last_name: `User${sequence}`,
      role: "Student",
      email: `user${sequence}-${crypto.randomUUID().slice(0, 8)}@example.test`,
      tagname: `user${sequence}${crypto.randomUUID().slice(0, 6)}`,
      password: await passwordHash,
      email_verified_at: new Date(),
      ...overrides,
    })
    .returning();
  return user!;
}

export const makeLecturer = (overrides: NewUser = {}) =>
  makeUser({ role: "Lecturer", email: `lect${++sequence}@example.ac.id`, ...overrides });

export async function tokenFor(user: { id: string }, name = "test") {
  return issueToken(db, user.id, name);
}

type NewProject = Partial<typeof schema.projects.$inferInsert>;

export async function makeProject(owner: { id: string }, overrides: NewProject = {}) {
  sequence++;
  const [project] = await db
    .insert(schema.projects)
    .values({
      user_id: owner.id,
      title: `Project ${sequence}`,
      description: "A project.",
      status: "Hiring",
      project_url: `project-${sequence}-${crypto.randomUUID().slice(0, 6)}`,
      created_at: new Date(Date.now() + sequence * 1000),
      ...overrides,
    })
    .returning();
  return project!;
}

/** Smallest valid files for the content-sniffing rules. */
export const files = {
  png: (size = 64) => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), new Uint8Array(size)], "a.png", { type: "image/png" }),
  pdf: () => new File([new TextEncoder().encode("%PDF-1.4\n%%EOF")], "cv.pdf", { type: "application/pdf" }),
  exe: () => new File([new TextEncoder().encode("MZ\x90\x00")], "virus.exe", { type: "application/octet-stream" }),
};

export function form(fields: Record<string, string | File>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.append(k, v);
  return data;
}

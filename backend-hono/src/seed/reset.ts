import type { Bindings } from "../env";
import { demoStatements, RESET_ORDER } from "./demo";

const UPLOAD_PREFIXES = ["avatars/", "cv/", "project-thumbnails/"];

/**
 * phive:demo-reset: wipe every table, reseed, and clear uploads. It refuses unless
 * DEMO_MODE is "true", so a production database can never be emptied by accident.
 */
export async function resetDemo(env: Bindings): Promise<boolean> {
  if (env.DEMO_MODE !== "true") {
    console.error("Refusing to run: DEMO_MODE is not enabled. This command deletes every row.");
    return false;
  }

  const vars = env as unknown as Record<string, string | undefined>;
  const statements = [
    ...RESET_ORDER.map((table) => `DELETE FROM ${table}`),
    ...(await demoStatements({ adminEmail: vars.ADMIN_EMAIL, adminPassword: vars.ADMIN_PASSWORD })),
  ];
  // One batch is one transaction: the demo is never left half-seeded.
  await env.DB.batch(statements.map((sql) => env.DB.prepare(sql)));

  for (const prefix of UPLOAD_PREFIXES) {
    let cursor: string | undefined;
    do {
      const page = await env.UPLOADS.list({ prefix, cursor });
      if (page.objects.length) await env.UPLOADS.delete(page.objects.map((o) => o.key));
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
  }
  console.log('Demo reset. Seeded accounts use the password "password".');
  return true;
}

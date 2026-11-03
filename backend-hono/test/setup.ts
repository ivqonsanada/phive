import { applyD1Migrations } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { beforeEach } from "vitest";

// D1 storage persists across the tests in a file, so each test starts by emptying
// every table (migrations are idempotent and only apply once).
beforeEach(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
  const { results } = await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name != 'd1_migrations'",
  ).all<{ name: string }>();
  await env.DB.batch([
    env.DB.prepare("PRAGMA defer_foreign_keys = on"),
    ...results.map((t) => env.DB.prepare(`DELETE FROM "${t.name}"`)),
  ]);
});

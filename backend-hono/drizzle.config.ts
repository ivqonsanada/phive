import { defineConfig } from "drizzle-kit";

// Only generates SQL into migrations/; wrangler applies it to D1.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./migrations",
});

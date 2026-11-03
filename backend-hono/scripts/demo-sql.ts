/**
 * Writes seed/demo.sql: wipe every table, then the demo dataset. Node runs this file
 * directly (native type stripping), so imports carry their .ts extension.
 *
 *   node scripts/demo-sql.ts && pnpm db:seed:local
 */
import { writeFileSync } from "node:fs";

import { demoStatements, RESET_ORDER } from "../src/seed/demo.ts";

const statements = [
  ...RESET_ORDER.map((table) => `DELETE FROM ${table};`),
  ...(await demoStatements({ adminEmail: process.env.ADMIN_EMAIL, adminPassword: process.env.ADMIN_PASSWORD })),
];
writeFileSync(new URL("../seed/demo.sql", import.meta.url), `${statements.join("\n")}\n`);
console.log(`seed/demo.sql: ${statements.length} statements`);

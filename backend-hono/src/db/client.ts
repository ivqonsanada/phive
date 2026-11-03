import { drizzle } from "drizzle-orm/d1";

import type { Database } from "../env";
import * as schema from "./schema";

export function createDb(d1: D1Database): Database {
  return drizzle(d1, { schema });
}

import type { DrizzleD1Database } from "drizzle-orm/d1";

import type * as schema from "./db/schema";

/** Secrets are not in wrangler.jsonc, so `wrangler types` cannot see them. */
export interface Secrets {
  APP_KEY: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY?: string;
}

export type Bindings = Env & Secrets;

export type Database = DrizzleD1Database<typeof schema>;

export interface AppEnv {
  Bindings: Bindings;
  Variables: {
    db: Database;
    /** Set by the auth middleware when the request carries a valid token. */
    user: schema.User | null;
    tokenId: string | null;
  };
}

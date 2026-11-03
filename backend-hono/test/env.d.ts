import type { D1Migration } from "@cloudflare/vitest-plugin";

import type { Secrets } from "../src/env";

declare global {
  namespace Cloudflare {
    interface Env extends Secrets {
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}

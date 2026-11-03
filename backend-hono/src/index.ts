import { app } from "./app";
import type { Bindings } from "./env";
import { sweepExpired } from "./routes/auth";

export { RealtimeHub } from "./realtime/hub";

export default {
  fetch: app.fetch,

  /** Nightly: sweep expired single-use codes and rate-limit windows. */
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(sweepExpired(env));
  },
} satisfies ExportedHandler<Bindings>;

import { app } from "./app";
import type { Bindings } from "./env";
import { sweepExpired } from "./routes/auth";
import { resetDemo } from "./seed/reset";

export { RealtimeHub } from "./realtime/hub";

export default {
  fetch: app.fetch,

  /** Nightly: sweep expired codes and rate-limit windows; reset the demo if DEMO_MODE. */
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(Promise.all([sweepExpired(env), resetDemo(env)]));
  },
} satisfies ExportedHandler<Bindings>;

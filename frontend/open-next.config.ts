import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Runs the Next.js server on Cloudflare Workers.
//
// For ISR/on-demand revalidation across isolates, add an R2-backed incremental cache:
//
//   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
//   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
//
// and uncomment the r2_buckets + WORKER_SELF_REFERENCE entries in wrangler.jsonc.
// PHive renders per-request against the API, so the default is enough to start.
export default defineCloudflareConfig();

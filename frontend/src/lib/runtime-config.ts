import "server-only";

import { parseDemoMode, type DemoDataMode } from "@/lib/demo-mode";

/**
 * Configuration the browser needs, resolved on the server at request time.
 *
 * Deliberately *not* `NEXT_PUBLIC_`: those are inlined into the JavaScript bundle when
 * `next build` runs and frozen there, so changing the API host would mean rebuilding
 * rather than editing a Worker variable. Reading them here and passing them through the
 * provider keeps one deployed artifact configurable per environment.
 */
export interface RuntimeConfig {
  apiBaseUrl: string;
  demoData: DemoDataMode;
}

export function runtimeConfig(): RuntimeConfig {
  return {
    apiBaseUrl: process.env.API_URL ?? "http://localhost:8000",
    demoData: parseDemoMode(process.env.DEMO_DATA),
  };
}

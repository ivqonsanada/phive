"use client";

import { useIsDemoData } from "@/lib/demo-state";

/**
 * Sample data that is not labelled is just wrong data. This says so plainly the moment
 * anything on the page falls back.
 */
export function DemoDataBanner() {
  const isDemo = useIsDemoData();

  if (!isDemo) {
    return null;
  }

  return (
    <p
      role="status"
      className="bg-navy px-4 py-2 text-center text-xs text-white/90"
      data-testid="demo-data-banner"
    >
      The PHive API is not reachable, so this page is showing sample data.
    </p>
  );
}

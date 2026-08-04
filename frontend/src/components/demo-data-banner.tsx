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
    // Fixed to the bottom of the viewport rather than sitting in the flow under the
    // header. In flow it fell between the layout's 92px header reservation and the
    // page, so the home hero's -92px — which claims that reservation back — dragged
    // <main> up over the banner and left its height as a bare white strip at the top.
    // Out of flow it cannot skew any page's geometry, and it stays visible while you
    // scroll, which a one-line notice at the top of a 100vh hero did not.
    <p
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 bg-navy px-4 py-2 text-center text-xs text-white/90"
      data-testid="demo-data-banner"
    >
      The PHive API is not reachable, so this page is showing sample data.
    </p>
  );
}

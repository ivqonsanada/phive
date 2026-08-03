import { Suspense } from "react";

import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* The header awaits the session; Suspense keeps the page below streaming first. */}
      <Suspense fallback={<div className="h-[65px] border-b border-navy/10" />}>
        <SiteHeader />
      </Suspense>
      {children}
    </>
  );
}

import { Suspense } from "react";

import { DemoDataBanner } from "@/components/demo-data-banner";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoDataBanner />

      {/* The header awaits the session; Suspense keeps the page below streaming first. */}
      <Suspense fallback={<div className="h-[65px] border-b border-navy/10" />}>
        <SiteHeader />
      </Suspense>
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </>
  );
}

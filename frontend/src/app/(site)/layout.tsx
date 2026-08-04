import { Suspense } from "react";

import { DemoDataBanner } from "@/components/demo-data-banner";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* The header awaits the session; Suspense keeps the page below streaming first. */}
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>

      {/* The nav is fixed, so it occupies no space. Reserve its 92px here; the home
          hero claims it back with a negative margin, exactly as the original did. */}
      <div className="flex flex-1 flex-col pt-[92px]">
        <DemoDataBanner />
        <PageTransition>{children}</PageTransition>
      </div>
      <SiteFooter />
    </>
  );
}

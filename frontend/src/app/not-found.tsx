import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TopImage } from "@/components/top-image";
import { btn } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

/**
 * The original's `errors/404.vue`, which was reached both by an explicit route and by
 * the router's catch-all. Next calls this file for any unmatched URL and for any
 * `notFound()` a page throws, so it covers both without a route of its own.
 *
 * It renders the chrome itself: a not-found can be thrown from outside the (site)
 * group — a bad /login/… URL, say — where that layout's header and footer are not in
 * scope, and a bare page with no navigation is a dead end.
 */
export default function NotFound() {
  return (
    <>
      {/* The header awaits the session, so it streams in rather than holding up the
          page — the same treatment the site layout gives it. */}
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>

      <div className="flex flex-1 flex-col pt-[92px]">
        <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-[30px] pb-[30px] pt-[5px]">
          {/* Mobile only, as the original had it: on a phone this band stands in for
              the desktop header's presence at the top of the page. */}
          <div className="xl:hidden">
            <TopImage type={1} />
          </div>

          <div className="mb-5 flex flex-col items-center gap-[30px] text-center xl:m-auto">
            <Image
              src="/images/404.svg"
              alt=""
              width={214}
              height={214}
              className="mx-auto size-[190px] sm:size-[214px]"
              priority
            />
            <h1 className="m-0 text-[30px] font-extrabold">Page Not Found</h1>
            <p className="text-[14px]">
              You are likely visiting a wrong address or the page has been removed.
            </p>
          </div>

          <Link href="/explore" className={`${btn("blue", { size: "large" })} mx-auto mt-auto`}>
            Let&rsquo;s Explore
          </Link>
        </main>
      </div>

      <SiteFooter />
    </>
  );
}

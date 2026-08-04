import type { Metadata } from "next";
import { Suspense } from "react";

import { ExploreFiltersBar } from "@/app/(site)/explore/filters";
import { ExploreResults } from "@/app/(site)/explore/results";

export const metadata: Metadata = { title: "Explore projects" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; expertise?: string; page?: string }>;
}) {
  // Read on the server only to seed the filter bar. The results are fetched in the
  // browser, keyed off the same search params.
  const { query, expertise } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-10">
      {/* The heading lives inside the filter bar — the original pairs the prompt with
          the search field, and "Available Projects" titles the results below it. */}
      <Suspense fallback={<div className="h-[220px]" />}>
        <ExploreFiltersBar query={query} expertise={expertise} />
      </Suspense>

      {/* useSearchParams needs a Suspense boundary above it during prerender. */}
      <Suspense fallback={null}>
        <ExploreResults />
      </Suspense>
    </main>
  );
}

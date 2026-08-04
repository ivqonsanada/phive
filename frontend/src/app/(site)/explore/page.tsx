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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Explore projects</h1>
      <p className="mb-6 text-sm text-ink/70">
        Everything lecturers have published, newest first.
      </p>

      <ExploreFiltersBar query={query} expertise={expertise} />

      {/* useSearchParams needs a Suspense boundary above it during prerender. */}
      <Suspense fallback={null}>
        <ExploreResults />
      </Suspense>
    </main>
  );
}

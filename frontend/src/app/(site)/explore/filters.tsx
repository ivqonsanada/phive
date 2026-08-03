"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { BOARD_LABELS } from "@/lib/board-labels";

const EXPERTISE_OPTIONS = Object.values(BOARD_LABELS);

export function ExploreFiltersBar({
  query,
  expertise,
}: {
  query?: string;
  expertise?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function applyExpertise(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    // Any filter change resets pagination — page 3 of the old result set is meaningless.
    params.delete("page");

    if (next) {
      params.set("expertise", next);
    } else {
      params.delete("expertise");
    }

    router.push(`/explore?${params}`);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <form action="/explore" className="flex flex-1 gap-2">
        <input
          type="search"
          name="query"
          defaultValue={query}
          placeholder="Search projects…"
          className="min-w-0 flex-1 rounded-lg border border-navy/15 px-3.5 py-2 outline-none focus:border-navy"
        />
        {expertise && <input type="hidden" name="expertise" value={expertise} />}
        <button
          type="submit"
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
        >
          Search
        </button>
      </form>

      <select
        value={expertise ?? ""}
        onChange={(event) => applyExpertise(event.target.value)}
        aria-label="Filter by expertise"
        className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-navy"
      >
        <option value="">All expertise</option>
        {EXPERTISE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

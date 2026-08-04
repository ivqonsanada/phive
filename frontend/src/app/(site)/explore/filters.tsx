"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { BOARD_LABELS } from "@/lib/board-labels";
import { Icon } from "@/lib/icons";

const EXPERTISE_OPTIONS = Object.values(BOARD_LABELS);

/**
 * The original's explore header: a centred prompt over a pill search field with its own
 * Explore button, then the "Available Projects" title with a navy Filters toggle that
 * reveals the expertise chips.
 */
export function ExploreFiltersBar({
  query,
  expertise,
}: {
  query?: string;
  expertise?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(Boolean(expertise));

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
    <>
      <h1 className="mb-5 text-center text-[24px] text-ink">Explore for Your Projects</h1>

      <form action="/explore" className="mx-auto mb-14 flex max-w-[790px] items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[10px] bg-mist px-4 py-3">
          <Icon icon="ic:round-search" className="size-5 shrink-0 text-ink/50" aria-hidden />
          <input
            type="search"
            name="query"
            defaultValue={query}
            placeholder="Search by Project Titles"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink/50"
          />
        </div>
        {expertise && <input type="hidden" name="expertise" value={expertise} />}
        <button
          type="submit"
          className="shrink-0 rounded-[10px] bg-mist px-7 py-3 text-[16px] font-bold text-ink/50 transition hover:bg-navy hover:text-white"
        >
          Explore
        </button>
      </form>

      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-[32px] font-bold text-ink xl:text-[40px]">Available Projects</h2>

        <button
          type="button"
          onClick={() => setShowFilters((open) => !open)}
          aria-expanded={showFilters}
          className="flex shrink-0 items-center gap-2 rounded-[10px] bg-navy px-4 py-2.5 text-[16px] font-bold text-white transition hover:bg-navy/90"
        >
          <Icon icon="ic:round-filter-list" className="size-[18px]" aria-hidden />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip active={!expertise} onClick={() => applyExpertise("")}>
            All expertise
          </FilterChip>
          {EXPERTISE_OPTIONS.map((option) => (
            <FilterChip
              key={option}
              active={expertise === option}
              onClick={() => applyExpertise(option)}
            >
              {option}
            </FilterChip>
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-[10px] px-4 py-2 text-[14px] font-bold transition ${
        active ? "bg-navy text-white" : "bg-mist text-navy hover:bg-navy/10"
      }`}
    >
      {children}
    </button>
  );
}



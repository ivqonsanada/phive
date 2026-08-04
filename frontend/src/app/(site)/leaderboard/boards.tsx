"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { CheckCircleIcon } from "@/components/board-icons";
import { LeaderboardCard } from "@/components/leaderboard-card";
import { BOARD_CODENAMES, BOARD_KEYS, BOARD_LABELS } from "@/lib/board-labels";
import { useLeaderboards } from "@/lib/queries";
import type { BoardKey, LeaderboardEntry } from "@/lib/types";

const PAGE_SIZE = 10;

/**
 * The original's leaderboard: the four board cards double as a selector — the chosen
 * one is fully opaque and the rest sit at 25% — and below them the chosen board's
 * ranking, ten rows at a time behind a Load More.
 */
export function LeaderboardBoards() {
  const { data, isPending, isError, error } = useLeaderboards();
  const [board, setBoard] = useState<BoardKey>("ui_ux_designer");
  const [shown, setShown] = useState(PAGE_SIZE);

  if (isPending) {
    return (
      <div className="flex w-full flex-wrap justify-center gap-5">
        {BOARD_KEYS.map((key) => (
          <div key={key} className="h-[350px] w-[250px] animate-pulse rounded-[10px] bg-mist" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
        {error instanceof Error ? error.message : "Could not load the leaderboard."}
      </p>
    );
  }

  const entries = data.boards[board] ?? [];

  function select(key: BoardKey) {
    setBoard(key);
    setShown(PAGE_SIZE);
  }

  return (
    <>
      <div className="mb-16 flex w-full flex-wrap items-stretch justify-center gap-5">
        {BOARD_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => select(key)}
            aria-pressed={key === board}
            className={`flex transition-opacity duration-300 ${
              key === board ? "opacity-100" : "opacity-25 hover:opacity-60"
            }`}
          >
            <LeaderboardCard board={key} entry={data.boards[key]?.[0] ?? null} />
          </button>
        ))}
      </div>

      <h2 className="mb-8 text-center text-[36px] font-bold uppercase text-ink xl:text-[48px]">
        {BOARD_CODENAMES[board]}
      </h2>

      <div className="mx-auto w-full max-w-[1000px] space-y-4 xl:space-y-5">
        {entries.length === 0 ? (
          <p className="rounded-[10px] bg-mist p-10 text-center text-ink/60">
            No ranked students on this board yet.
          </p>
        ) : (
          entries.slice(0, shown).map((entry) => (
            <LeaderboardRow key={entry.uuid} board={board} entry={entry} />
          ))
        )}
      </div>

      {shown < entries.length && (
        <button
          type="button"
          onClick={() => setShown((current) => current + PAGE_SIZE)}
          className="mx-auto mt-8 flex h-[45px] w-[200px] items-center justify-center rounded-[10px] bg-navy text-[18px] font-bold text-white transition hover:bg-navy/90"
        >
          Load More
        </button>
      )}
    </>
  );
}

function LeaderboardRow({ board, entry }: { board: BoardKey; entry: LeaderboardEntry }) {
  // The original rendered every score in thousands, so 7,412 reads as "7K".
  const points = `${(entry.points / 1000).toFixed(0)}K`;

  return (
    <div className="flex flex-row items-center justify-between rounded-[10px] bg-mist px-4 py-3 xl:px-8 xl:py-6">
      <div className="flex flex-row items-center gap-4 xl:gap-7">
        {entry.user ? (
          <Link href={`/u/${entry.user.tagname}`} className="shrink-0">
            <Image
              src={entry.user.photo_url ?? "/images/missing-avatar.svg"}
              alt=""
              width={90}
              height={90}
              className="size-[60px] rounded-full object-cover xl:size-[90px] bg-[url('/images/missing-avatar.svg')] bg-cover bg-center"
              unoptimized
            />
          </Link>
        ) : (
          <div className="size-[60px] shrink-0 rounded-full bg-navy/10 xl:size-[90px]" />
        )}

        <div className="flex flex-col justify-center gap-2 xl:gap-3.5">
          <div>
            <div className="text-[14px] font-extrabold text-navy xl:text-[24px] xl:font-bold">
              {entry.user?.name ?? "Unknown"}
            </div>
            <div className="text-[14px] font-semibold text-ink xl:text-[24px] xl:font-normal">
              {BOARD_LABELS[board]}
            </div>
          </div>

          <div className="flex flex-row items-center gap-1.5 xl:gap-2.5">
            <CheckCircleIcon className="size-5 shrink-0 text-navy xl:size-[30px]" />
            <span className="text-[13px] font-bold text-navy">
              {entry.user?.finished_project_count ?? 0} Project Finished
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center justify-center rounded-[10px] border-2 border-navy bg-white px-4 py-2 text-navy">
        <span className="text-[18px] font-extrabold leading-none xl:text-[24px]">{points}</span>
        <span className="text-[11px] font-bold uppercase xl:text-[14px]">Points</span>
      </div>
    </div>
  );
}

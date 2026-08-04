"use client";

import Link from "next/link";

import { BOARD_CODENAMES, BOARD_KEYS, BOARD_LABELS } from "@/lib/board-labels";
import { useLeaderboards } from "@/lib/queries";
import type { LeaderboardEntry } from "@/lib/types";

export function LeaderboardBoards() {
  const { data, isPending, isError, error } = useLeaderboards();

  if (isPending) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {BOARD_KEYS.map((key) => (
          <div key={key} className="h-64 animate-pulse rounded-xl border border-navy/10 bg-navy/5" />
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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {BOARD_KEYS.map((key) => (
        <Board
          key={key}
          codename={BOARD_CODENAMES[key]}
          title={BOARD_LABELS[key]}
          entries={data.boards[key] ?? []}
        />
      ))}
    </div>
  );
}

function Board({
  codename,
  title,
  entries,
}: {
  codename: string;
  title: string;
  entries: LeaderboardEntry[];
}) {
  return (
    <section className="rounded-xl border border-navy/10 p-5">
      <h2 className="font-bold uppercase tracking-wide text-navy">{codename}</h2>
      <p className="mb-4 text-sm text-ink/60">{title}</p>

      {entries.length === 0 ? (
        <p className="text-sm text-ink/50">No ranked students yet.</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li key={entry.uuid} className="flex items-center gap-3 text-sm">
              <span className="w-5 shrink-0 text-right font-semibold text-ink/40">{index + 1}</span>

              {entry.user ? (
                <Link
                  href={`/u/${entry.user.tagname}`}
                  className="truncate text-navy hover:text-glow"
                >
                  {entry.user.name}
                </Link>
              ) : (
                <span className="truncate text-ink/50">Unknown</span>
              )}

              {entry.user?.finished_project_count !== undefined && (
                <span className="shrink-0 text-xs text-ink/50">
                  {entry.user.finished_project_count} done
                </span>
              )}

              <span className="ml-auto shrink-0 font-semibold text-glow">{entry.points}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { BOARD_CODENAMES, BOARD_KEYS, BOARD_LABELS } from "@/lib/board-labels";
import { getLeaderboards } from "@/lib/projects";
import type { LeaderboardEntry } from "@/lib/types";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const { boards } = await getLeaderboards();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Leaderboard</h1>
      <p className="mb-8 text-sm text-ink/70">
        Points come from finishing projects and the reviews lecturers leave.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {BOARD_KEYS.map((key) => (
          <Board
            key={key}
            codename={BOARD_CODENAMES[key]}
            title={BOARD_LABELS[key]}
            entries={boards[key] ?? []}
          />
        ))}
      </div>
    </main>
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
            <li key={entry.id} className="flex items-center gap-3 text-sm">
              <span className="w-5 shrink-0 text-right font-semibold text-ink/40">{index + 1}</span>

              {entry.user ? (
                <Link href={`/u/${entry.user.tagname}`} className="truncate text-navy hover:text-glow">
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

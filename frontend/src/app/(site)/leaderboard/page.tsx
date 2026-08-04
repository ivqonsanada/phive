import type { Metadata } from "next";

import { LeaderboardBoards } from "@/app/(site)/leaderboard/boards";

export const metadata: Metadata = { title: "Leaderboard" };

/**
 * The shell stays a server component so the heading is in the initial HTML; the boards
 * themselves are fetched from the browser straight against the API.
 */
export default function LeaderboardPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Leaderboard</h1>
      <p className="mb-8 text-sm text-ink/70">
        Points come from finishing projects and the reviews lecturers leave.
      </p>

      <LeaderboardBoards />
    </main>
  );
}

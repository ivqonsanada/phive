import type { Metadata } from "next";

import { LeaderboardBoards } from "@/app/(site)/leaderboard/boards";

export const metadata: Metadata = { title: "Leaderboard" };

/**
 * The shell stays a server component so the heading is in the initial HTML; the boards
 * themselves are fetched from the browser straight against the API.
 */
export default function LeaderboardPage() {
  return (
    <main className="tracked mx-auto w-full max-w-[1280px] flex-1 px-6 py-10">
      {/* `.leaderboard__h1` is 800; the board name below it is `.leaderboard__h2` at
          700. The two are the same size, and the weight is what separates them. */}
      <h1 className="mb-8 text-center text-[36px] font-extrabold uppercase text-ink xl:text-[48px]">
        Leaderboard
      </h1>

      <LeaderboardBoards />
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";

import { BOARD_CODENAMES, BOARD_LABELS } from "@/lib/board-labels";
import type { BoardKey, LeaderboardEntry } from "@/lib/types";

/**
 * The "top of each board" card from the original home page: codename header, the
 * champion's avatar with their rank, points, and how much they've finished.
 */
export function LeaderboardCard({ board, entry }: { board: BoardKey; entry: LeaderboardEntry | null }) {
  return (
    <div className="rounded-xl border border-navy/10 p-4 text-center">
      <p className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">
        {BOARD_CODENAMES[board]}
      </p>

      {entry?.user ? (
        <>
          <div className="relative mx-auto mb-3 w-fit">
            <Image
              src={entry.user.photo_url ?? "/images/missing-avatar.svg"}
              alt=""
              width={72}
              height={72}
              className="size-[72px] rounded-full border-2 border-navy object-cover"
              unoptimized
            />
            <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-navy text-xs font-bold text-white">
              #1
            </span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-glow px-2 py-0.5 text-xs font-bold text-white">
              {entry.points} pts
            </span>
          </div>

          <p className="mt-4 font-bold text-navy">{entry.user.name}</p>
          <p className="mb-3 text-sm text-ink/60">{BOARD_LABELS[board]}</p>
          <p className="mb-3 text-xs text-ink/60">
            ✓ {entry.user.finished_project_count ?? 0} project finished
          </p>

          <Link
            href={`/u/${entry.user.tagname}`}
            className="inline-block rounded-lg bg-navy px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-navy/90"
          >
            View profile
          </Link>
        </>
      ) : (
        <>
          <div className="mx-auto mb-3 grid size-[72px] place-items-center rounded-full bg-navy/10 text-navy/40">
            —
          </div>
          <p className="text-sm text-ink/60">{BOARD_LABELS[board]}</p>
          <p className="mt-2 text-sm text-ink/40">Nobody ranked yet</p>
        </>
      )}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

import { BoardIcon, CheckCircleIcon } from "@/components/board-icons";
import { BOARD_CODENAMES, BOARD_LABELS } from "@/lib/board-labels";
import type { BoardKey, LeaderboardEntry } from "@/lib/types";

/**
 * The original's `topboard-item`, measurement for measurement: a #f2f4f6 card holding a
 * codename header, a 10.8rem avatar ringed in navy with its rank badge overlapping the
 * top-right and a points plate overlapping the bottom, then the name, the finished
 * count and a view button pinned to the base of the card.
 */
export function LeaderboardCard({
  board,
  entry,
}: {
  board: BoardKey;
  entry: LeaderboardEntry | null;
}) {
  return (
    <div className="flex min-h-[350px] w-full max-w-[250px] flex-col justify-between rounded-[10px] bg-mist px-[17px] pb-[25px] pt-3 text-navy">
      <div>
        <div className="flex items-center justify-center gap-3">
          <BoardIcon board={board} className="size-[30px]" />
          <span className="text-[20px] font-extrabold uppercase">{BOARD_CODENAMES[board]}</span>
        </div>

        {entry?.user ? (
          <>
            <div className="-mt-9 flex flex-col items-center justify-center">
              <div className="relative left-[55px] top-[52px] z-10 grid size-[54px] place-items-center rounded-full bg-navy text-[24px] font-extrabold text-white">
                #1
              </div>

              <Image
                src={entry.user.photo_url ?? "/images/missing-avatar.svg"}
                alt=""
                width={108}
                height={108}
                className="size-[108px] rounded-full border-8 border-navy bg-white object-cover"
                unoptimized
              />

              <div className="relative bottom-5 flex h-6 w-[125px] items-center justify-center rounded-[5px] bg-navy text-[12px] font-extrabold text-white shadow-[2px_4px_8px_rgba(0,33,77,0.3)]">
                {entry.points.toLocaleString()} Points
              </div>
            </div>

            <div className="mb-2.5 flex flex-col text-center">
              <div className="text-[18px] font-bold">{entry.user.name}</div>
              <div className="text-[18px] font-semibold">{BOARD_LABELS[board]}</div>
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="grid size-[108px] place-items-center rounded-full border-8 border-navy/20 text-navy/30">
              —
            </div>
            <div className="text-center text-[18px] font-semibold">{BOARD_LABELS[board]}</div>
          </div>
        )}
      </div>

      {entry?.user ? (
        <div>
          <div className="mb-3.5 flex items-center justify-center gap-1.5">
            <CheckCircleIcon className="size-[45px] shrink-0" />
            <span className="w-[72px] text-[13px] font-bold">
              {entry.user.finished_project_count ?? 0} Project Finished
            </span>
          </div>

          <Link
            href={`/u/${entry.user.tagname}`}
            className="mx-auto flex h-[35px] w-[130px] items-center justify-center rounded-[10px] bg-navy text-[16px] font-bold text-white transition hover:bg-navy/90"
          >
            View Profile
          </Link>
        </div>
      ) : (
        <p className="text-center text-[13px] font-bold text-navy/50">Nobody ranked yet</p>
      )}
    </div>
  );
}

"use client";

import { Icon } from "@/lib/icons";
import type { BoardKey } from "@/lib/types";

/**
 * The codename glyphs, using the same Iconify names the original's TopBoardList did.
 */
const BOARD_ICONS: Record<BoardKey, string> = {
  ui_ux_designer: "whh:painting",
  front_end_engineer: "bx:bx-code",
  back_end_engineer: "bx:bx-code-curly",
  data_expert: "bx:bxs-data",
};

export function BoardIcon({ board, className }: { board: BoardKey; className?: string }) {
  return <Icon icon={BOARD_ICONS[board]} className={className} aria-hidden />;
}

export function CheckCircleIcon({ className }: { className?: string }) {
  return <Icon icon="ic:round-check-circle" className={className} aria-hidden />;
}

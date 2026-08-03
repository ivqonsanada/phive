import type { BoardKey, Expertise } from "@/lib/types";

/**
 * Maps the API's column-style board keys to their display names.
 *
 * Kept out of `lib/projects.ts` deliberately: that module is `server-only`, and
 * Client Components need these labels too.
 */
export const BOARD_LABELS: Record<BoardKey, Expertise> = {
  ui_ux_designer: "UI/UX Designer",
  front_end_engineer: "Frontend Engineer",
  back_end_engineer: "Backend Engineer",
  data_expert: "Data Expert",
};

export const BOARD_KEYS = Object.keys(BOARD_LABELS) as BoardKey[];

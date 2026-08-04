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

/**
 * The original PHive gave each leaderboard a codename. They carry the personality of
 * the product, so they are part of the port rather than decoration.
 */
export const BOARD_CODENAMES: Record<BoardKey, string> = {
  ui_ux_designer: "Picasso",
  front_end_engineer: "Front Row",
  back_end_engineer: "Mastermind",
  data_expert: "Snowden",
};

export const BOARD_KEYS = Object.keys(BOARD_LABELS) as BoardKey[];

export const EXPERTISE_TO_BOARD: Record<Expertise, BoardKey> = {
  "UI/UX Designer": "ui_ux_designer",
  "Frontend Engineer": "front_end_engineer",
  "Backend Engineer": "back_end_engineer",
  "Data Expert": "data_expert",
};

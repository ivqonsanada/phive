"use client";

import { Icon } from "@/lib/icons";

/**
 * The glyphs beside each line of the project summary, matching the original's set.
 * "level" stays a text mark because the original used the letters LVL, not an icon.
 */
const ICONS = {
  brush: "fa-solid:paint-brush",
  money: "fa-solid:dollar-sign",
  clock: "ic:round-access-time",
  people: "ri:team-fill",
  work: "ic:baseline-work",
  certificate: "la:certificate-solid",
} as const;

export function SummaryIcon({ name }: { name: keyof typeof ICONS | "level" }) {
  if (name === "level") {
    return <span className="w-6 shrink-0 text-[14px] font-extrabold text-navy">LVL</span>;
  }

  return <Icon icon={ICONS[name]} className="size-6 shrink-0 text-navy" aria-hidden />;
}

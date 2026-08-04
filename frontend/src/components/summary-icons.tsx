/**
 * The small navy glyphs beside each line of the project summary. The original pulled
 * these from Iconify; inlining them avoids a network request for a 24px icon.
 */
const PATHS = {
  brush: "M20.7 3.3a1 1 0 0 0-1.4 0L8 14.6 9.4 16 20.7 4.7a1 1 0 0 0 0-1.4zM7 16a3 3 0 0 0-3 3c0 .6-.4 1.4-1 2 1.6.4 3.3.4 4.4-.4A3 3 0 0 0 7 16z",
  money:
    "M12 2a1 1 0 0 1 1 1v1.1c1.7.3 3 1.5 3 3.1a1 1 0 1 1-2 0c0-.7-.9-1.4-2-1.4s-2 .7-2 1.4.9 1.3 2 1.3c2.2 0 4 1.4 4 3.4 0 1.6-1.3 2.8-3 3.1V16a1 1 0 1 1-2 0v-1c-1.7-.3-3-1.5-3-3.1a1 1 0 1 1 2 0c0 .7.9 1.4 2 1.4s2-.7 2-1.4-.9-1.3-2-1.3c-2.2 0-4-1.4-4-3.4 0-1.6 1.3-2.8 3-3.1V3a1 1 0 0 1 1-1zm-8 18h16v2H4v-2z",
  clock:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.6V6h-2v7.4l5 3 1-1.7-4-2.1z",
  people:
    "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.7 0-8 1.3-8 4v2h10v-2c0-1 .4-1.9 1-2.6-1-.3-2.1-.4-3-.4zm8 0c-.4 0-.9 0-1.4.1A4.5 4.5 0 0 1 16 17v2h8v-2c0-2.7-5.3-4-8-4z",
} as const;

export function SummaryIcon({ name }: { name: keyof typeof PATHS | "level" }) {
  if (name === "level") {
    // The original used a text mark here rather than a glyph.
    return <span className="w-6 shrink-0 text-[14px] font-extrabold text-navy">LVL</span>;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="size-6 shrink-0 text-navy"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

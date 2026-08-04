import type { BoardKey } from "@/lib/types";

/**
 * The original pulled these from Iconify at runtime (whh:painting, bx:bx-code,
 * bx:bx-code-curly, bx:bxs-data). Inlining equivalents keeps the look without shipping
 * an icon library or making a network request for a 30px glyph.
 */
export function BoardIcon({ board, className }: { board: BoardKey; className?: string }) {
  const paths: Record<BoardKey, React.ReactNode> = {
    ui_ux_designer: (
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.7 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-4.4-4.5-8.4-10-8.4zM6.5 12c-.8 0-1.5-.7-1.5-1.5S5.7 9 6.5 9 8 9.7 8 10.5 7.3 12 6.5 12zm3-4C8.7 8 8 7.3 8 6.5S8.7 5 9.5 5s1.5.7 1.5 1.5S10.3 8 9.5 8zm5 0c-.8 0-1.5-.7-1.5-1.5S13.7 5 14.5 5s1.5.7 1.5 1.5S15.3 8 14.5 8zm3 4c-.8 0-1.5-.7-1.5-1.5S16.7 9 17.5 9s1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" />
    ),
    front_end_engineer: (
      <path d="M8.7 15.9 4.8 12l3.9-3.9a1 1 0 1 0-1.4-1.4l-4.6 4.6a1 1 0 0 0 0 1.4l4.6 4.6a1 1 0 0 0 1.4-1.4zm6.6 0 3.9-3.9-3.9-3.9a1 1 0 1 1 1.4-1.4l4.6 4.6a1 1 0 0 1 0 1.4l-4.6 4.6a1 1 0 0 1-1.4-1.4z" />
    ),
    back_end_engineer: (
      <path d="M9 4c-2 0-3 1-3 3v2c0 1.1-.9 2-2 2v2c1.1 0 2 .9 2 2v2c0 2 1 3 3 3h1v-2H9c-.6 0-1-.4-1-1v-2c0-1.2-.5-2.2-1.4-3 .9-.8 1.4-1.8 1.4-3V7c0-.6.4-1 1-1h1V4H9zm6 0v2h1c.6 0 1 .4 1 1v2c0 1.2.5 2.2 1.4 3-.9.8-1.4 1.8-1.4 3v2c0 .6-.4 1-1 1h-1v2h1c2 0 3-1 3-3v-2c0-1.1.9-2 2-2v-2c-1.1 0-2-.9-2-2V7c0-2-1-3-3-3h-1z" />
    ),
    data_expert: (
      <path d="M12 2c-4.4 0-8 1.3-8 3v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5c0-1.7-3.6-3-8-3zm0 2c3.9 0 6 1.1 6 1s-2.1 1-6 1-6-1.1-6-1 2.1-1 6-1zm6 15c0 .1-2.1 1-6 1s-6-.9-6-1v-2.3c1.5.8 3.7 1.3 6 1.3s4.5-.5 6-1.3V19zm0-5c0 .1-2.1 1-6 1s-6-.9-6-1v-2.3c1.5.8 3.7 1.3 6 1.3s4.5-.5 6-1.3V14zm0-5c0 .1-2.1 1-6 1s-6-.9-6-1V6.7C7.5 7.5 9.7 8 12 8s4.5-.5 6-1.3V9z" />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      {paths[board]}
    </svg>
  );
}

export function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.6-5.6L17.8 9l-7 7.2z" />
    </svg>
  );
}

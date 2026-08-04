/**
 * The three home-page fact icons. The original pulled bx:bxs-brain, entypo:paper-plane
 * and ant-design:check-circle-outlined from Iconify at 7.2rem; these are inlined so the
 * page does not wait on an icon CDN to render its own hero statistics.
 */
const SIZE = "size-[50px] xl:size-[72px]";

export function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={SIZE}>
      <path d="M12 3.5c-1 0-1.9.5-2.4 1.3A2.8 2.8 0 0 0 6 7.4c-1.1.5-1.8 1.6-1.8 2.8 0 .5.1 1 .3 1.4-.6.6-.9 1.3-.9 2.1 0 1.3.9 2.5 2.1 2.9.2 1.4 1.4 2.4 2.8 2.4.6 0 1.2-.2 1.7-.6.4.4 1 .6 1.6.6h.2V3.5H12zm.9 0v15.1h.2c.6 0 1.2-.2 1.6-.6.5.4 1.1.6 1.7.6 1.4 0 2.6-1 2.8-2.4a3 3 0 0 0 2.1-2.9c0-.8-.3-1.5-.9-2.1.2-.4.3-.9.3-1.4 0-1.2-.7-2.3-1.8-2.8a2.8 2.8 0 0 0-3.6-2.6 2.9 2.9 0 0 0-2.4-1.3v.1zM10.5 20.5h3v.5a1.5 1.5 0 0 1-3 0v-.5z" />
    </svg>
  );
}

export function PaperPlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={SIZE}>
      <path d="M21.7 2.3a1 1 0 0 0-1.1-.2l-18 8a1 1 0 0 0 .1 1.9l4.6 1.3 1.3 4.6a1 1 0 0 0 1.8.2l2.2-3.7 4.2 3.2a1 1 0 0 0 1.6-.6l3.5-14.6a1 1 0 0 0-.2-1.1z" />
    </svg>
  );
}

export function CheckOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={SIZE}>
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m8 12.3 2.8 2.8L16.4 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

"use client";

import { usePathname } from "next/navigation";

/**
 * The original's route transition — a 0.2s fade as each page arrives.
 *
 * Keyed on the pathname so React remounts the subtree on navigation, which is what
 * restarts the animation; without the key the class is already applied and nothing
 * replays.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter flex flex-1 flex-col">
      {children}
    </div>
  );
}

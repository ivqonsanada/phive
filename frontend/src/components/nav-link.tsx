"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

/**
 * The original marked the current section with a filled navy pill rather than a colour
 * change, which is most of how the nav reads as "you are here".
 */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 whitespace-nowrap rounded-[10px] px-4 py-2.5 text-[18px] transition ${
        active ? "bg-navy font-bold text-white" : "font-semibold text-navy hover:bg-mist"
      }`}
    >
      {children}
      <NavProgress />
    </Link>
  );
}

/**
 * The navy bar the original ran across the top of the viewport with NProgress while a
 * route loaded. `useLinkStatus` only reports the pending state of the Link it sits
 * inside, so this rides along in the nav links — the same places the original's bar was
 * most visible — and positions itself fixed regardless of where it is rendered.
 */
function NavProgress() {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return <span aria-hidden className="nav-progress" />;
}

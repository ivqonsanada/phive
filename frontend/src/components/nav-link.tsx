"use client";

import Link from "next/link";
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
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";

import { getCurrentUser } from "@/lib/dal";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-navy/10">
      {/* Wraps to a second row on narrow screens rather than squeezing labels until
          they break mid-word. */}
      <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4">
        <Link href="/" aria-label="PHive home" className="shrink-0">
          {/* logo.svg is white-filled and only works on the dark footer. */}
          <Image src="/images/logo-blue.svg" alt="PHive" width={72} height={28} priority />
        </Link>

        <NavLink href="/explore">Explore</NavLink>
        <NavLink href="/leaderboard">Leaderboard</NavLink>
        {user?.role === "Lecturer" && <NavLink href="/my/projects">My projects</NavLink>}
        {user?.role === "Student" && <NavLink href="/wishlist">Wishlist</NavLink>}
        {user?.role === "Student" && <NavLink href="/party">Party</NavLink>}
        {user && <NavLink href="/project-box">Project box</NavLink>}
        {user && <NavLink href="/messages">Messages</NavLink>}
        {user && (
          <Link
            href="/inbox"
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-ink/70 hover:text-glow"
          >
            Inbox
            {(user.unread_inbox_count ?? 0) > 0 && (
              <span className="rounded-full bg-glow px-1.5 py-0.5 text-xs font-semibold text-white">
                {user.unread_inbox_count}
              </span>
            )}
          </Link>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {user ? (
            <>
              <NavLink href={`/u/${user.tagname}`}>@{user.tagname}</NavLink>
              <CtaLink href="/dashboard">Dashboard</CtaLink>
            </>
          ) : (
            <>
              <NavLink href="/login">Sign in</NavLink>
              <CtaLink href="/register">Join</CtaLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="shrink-0 whitespace-nowrap text-sm text-ink/70 transition hover:text-glow"
    >
      {children}
    </Link>
  );
}

function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="shrink-0 whitespace-nowrap rounded-lg bg-navy px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-navy/90"
    >
      {children}
    </Link>
  );
}

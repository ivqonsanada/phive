import Image from "next/image";
import Link from "next/link";

import { HeaderShell } from "@/components/header-shell";
import { NavLink } from "@/components/nav-link";
import { getCurrentUser } from "@/lib/dal";

/**
 * The original's desktop nav: 9.2rem tall over a 128rem container, 1.8rem links with a
 * #f2f4f6 hover chip, and a guest pairing of an underlined "Create an Account" text
 * link beside an outlined "Sign In" button.
 */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <HeaderShell>
      <nav className="mx-auto flex h-[92px] w-full max-w-[1280px] items-center px-6">
        <Link href="/" aria-label="PHive home" className="shrink-0">
          {/* logo.svg is white-filled and only works on the dark footer. */}
          <Image src="/images/logo-blue.svg" alt="PHive" width={95} height={42} priority />
        </Link>

        <div className="ml-6 hidden items-center gap-1 lg:ml-14 lg:flex lg:gap-3">
          <NavLink href="/explore">Explore</NavLink>
          <NavLink href="/leaderboard">Leaderboard</NavLink>
          {user?.role === "Lecturer" && <NavLink href="/my/projects">My projects</NavLink>}
          {user?.role === "Student" && <NavLink href="/wishlist">Wishlist</NavLink>}
          {user?.role === "Student" && <NavLink href="/party">Party</NavLink>}
          {user && <NavLink href="/project-box">Project box</NavLink>}
          {user && <NavLink href="/messages">Messages</NavLink>}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-5">
          {user ? (
            <>
              <Link
                href="/inbox"
                className="flex items-center gap-1.5 whitespace-nowrap text-[18px] font-semibold text-navy hover:text-glow"
              >
                Inbox
                {(user.unread_inbox_count ?? 0) > 0 && (
                  <span className="rounded-full bg-glow px-2 py-0.5 text-[12px] font-bold text-white">
                    {user.unread_inbox_count}
                  </span>
                )}
              </Link>
              <NavLink href={`/u/${user.tagname}`}>@{user.tagname}</NavLink>
              <SolidButton href="/dashboard">Dashboard</SolidButton>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden whitespace-nowrap text-[18px] font-semibold text-navy underline underline-offset-4 hover:text-glow sm:block"
              >
                Create an Account
              </Link>
              <OutlineButton href="/login">Sign In</OutlineButton>
            </>
          )}
        </div>
      </nav>
    </HeaderShell>
  );
}

function OutlineButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-10 w-[110px] shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] border border-navy bg-white text-[16px] font-bold text-navy transition hover:bg-mist"
    >
      {children}
    </Link>
  );
}

function SolidButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] bg-navy px-5 text-[16px] font-bold text-white transition hover:bg-navy/90"
    >
      {children}
    </Link>
  );
}

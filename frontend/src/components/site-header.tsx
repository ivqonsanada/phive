import Link from "next/link";

import { getCurrentUser } from "@/lib/dal";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-navy/10">
      <nav className="mx-auto flex w-full max-w-5xl items-center gap-6 px-4 py-4">
        <Link href="/" className="text-lg font-bold text-navy">
          PH<span className="text-glow">ive</span>
        </Link>

        <Link href="/explore" className="text-sm text-ink/70 hover:text-glow">
          Explore
        </Link>
        <Link href="/leaderboard" className="text-sm text-ink/70 hover:text-glow">
          Leaderboard
        </Link>

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <Link href={`/u/${user.tagname}`} className="text-sm text-ink/70 hover:text-glow">
                @{user.tagname}
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg bg-navy px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-navy/90"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink/70 hover:text-glow">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-navy px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-navy/90"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

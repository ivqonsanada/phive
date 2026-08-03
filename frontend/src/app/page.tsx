import Link from "next/link";

import { getCurrentUser } from "@/lib/dal";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-glow">
        Freelancing, for college
      </p>
      <h1 className="mb-4 text-4xl font-bold leading-tight text-navy sm:text-5xl">
        Lecturers publish projects.
        <br />
        Students get hired.
      </h1>
      <p className="mb-8 max-w-xl text-ink/70">
        PHive is where lecturers post real work and students apply — on their own or with a
        party they recruit. Finish a project, earn a salary and a certificate, climb the
        leaderboard.
      </p>

      <div className="flex flex-wrap gap-3">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-navy px-5 py-2.5 font-semibold text-white transition hover:bg-navy/90"
          >
            Go to your dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/register"
              className="rounded-lg bg-navy px-5 py-2.5 font-semibold text-white transition hover:bg-navy/90"
            >
              Create an account
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-navy/15 px-5 py-2.5 font-semibold text-navy transition hover:border-navy"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

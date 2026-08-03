import type { Metadata } from "next";
import Link from "next/link";

import { ResendVerification } from "@/app/(site)/dashboard/resend-verification";
import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink/60">Signed in as @{user.tagname}</p>
          <h1 className="text-2xl font-bold text-navy">{user.name}</h1>
          <p className="text-sm text-ink/70">
            {user.role}
            {user.expertise ? ` · ${user.expertise}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="rounded-lg border border-navy/15 px-3.5 py-2 text-sm font-semibold text-navy transition hover:border-navy"
          >
            Settings
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-navy/15 px-3.5 py-2 text-sm font-semibold text-navy transition hover:border-glow hover:text-glow"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {!user.email_verified && <ResendVerification email={user.email} />}

      <section className="rounded-xl border border-navy/10 p-5">
        <h2 className="mb-3 font-semibold text-navy">Session check</h2>
        <p className="text-sm text-ink/70">
          This page was rendered on the server using your Sanctum token, read from an
          httpOnly cookie. The token itself never reaches the browser.
        </p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <Detail label="Email" value={user.email} />
          <Detail label="Verified" value={user.email_verified ? "Yes" : "Not yet"} />
          <Detail label="University" value={user.university ?? "—"} />
          <Detail label="Location" value={user.location ?? "—"} />
        </dl>
      </section>

      <p className="mt-8 text-sm text-ink/50">
        Projects, party, inbox and the project box are ported next — see the roadmap in the
        repository README.
      </p>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-navy/5 px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-ink/50">{label}</dt>
      <dd className="text-navy">{value}</dd>
    </div>
  );
}

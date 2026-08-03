import Link from "next/link";
import { Suspense } from "react";

import { ProjectCard } from "@/components/project-card";
import { BOARD_KEYS, BOARD_LABELS } from "@/lib/board-labels";
import { getCurrentUser } from "@/lib/dal";
import { getHome } from "@/lib/projects";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14">
      <section className="mb-14 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-glow">
          Freelancing, for college
        </p>
        <h1 className="mb-4 text-4xl font-bold leading-tight text-navy sm:text-5xl">
          Lecturers publish projects.
          <br />
          Students get hired.
        </h1>
        <p className="mb-8 text-ink/70">
          PHive is where lecturers post real work and students apply — on their own or with
          a party they recruit. Finish a project, earn a salary and a certificate, climb the
          leaderboard.
        </p>

        <Suspense fallback={<div className="h-11" />}>
          <PrimaryActions />
        </Suspense>
      </section>

      {/* The API call is isolated so a slow or cold backend cannot block the hero. */}
      <Suspense fallback={<p className="text-sm text-ink/50">Loading the latest…</p>}>
        <Highlights />
      </Suspense>
    </main>
  );
}

async function PrimaryActions() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/explore"
        className="rounded-lg bg-navy px-5 py-2.5 font-semibold text-white transition hover:bg-navy/90"
      >
        Explore projects
      </Link>
      {!user && (
        <Link
          href="/register"
          className="rounded-lg border border-navy/15 px-5 py-2.5 font-semibold text-navy transition hover:border-navy"
        >
          Create an account
        </Link>
      )}
    </div>
  );
}

async function Highlights() {
  const { stats, top_boards, latest_projects } = await getHome();

  return (
    <>
      <section className="mb-14 grid gap-4 sm:grid-cols-3">
        <Stat label="Hiring now" value={stats.hiring} />
        <Stat label="In progress" value={stats.ongoing} />
        <Stat label="Finished" value={stats.finished} />
      </section>

      {latest_projects.length > 0 && (
        <section className="mb-14">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-navy">Open for applications</h2>
            <Link href="/explore" className="text-sm font-semibold text-navy hover:text-glow">
              See all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest_projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-navy">Top of each board</h2>
          <Link href="/leaderboard" className="text-sm font-semibold text-navy hover:text-glow">
            Full leaderboard →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BOARD_KEYS.map((key) => {
            const entry = top_boards[key];

            return (
              <div key={key} className="rounded-xl border border-navy/10 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {BOARD_LABELS[key]}
                </p>
                {entry?.user ? (
                  <>
                    <Link
                      href={`/u/${entry.user.tagname}`}
                      className="font-semibold text-navy hover:text-glow"
                    >
                      {entry.user.name}
                    </Link>
                    <p className="text-sm text-glow">{entry.points} pts</p>
                  </>
                ) : (
                  <p className="text-sm text-ink/40">Nobody yet</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-navy/5 p-5">
      <p className="text-3xl font-bold text-navy">{value}</p>
      <p className="text-sm text-ink/60">{label}</p>
    </div>
  );
}

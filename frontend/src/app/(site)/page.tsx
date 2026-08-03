import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { LeaderboardCard } from "@/components/leaderboard-card";
import { ProjectCard } from "@/components/project-card";
import { BOARD_KEYS } from "@/lib/board-labels";
import { getCurrentUser } from "@/lib/dal";
import { getHome } from "@/lib/projects";

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="bg-navy/5">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-8 px-4 py-16 md:grid-cols-2">
          <div>
            <h1 className="mb-4 text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-navy sm:text-5xl">
              Expand your career by doing projects.
            </h1>
            <p className="mb-8 text-ink/70">Fill up your college life with expectation.</p>

            <Suspense fallback={<div className="h-11" />}>
              <PrimaryActions />
            </Suspense>
          </div>

          <Image
            src="/images/smiling-woman-looking-desktop.png"
            alt=""
            width={560}
            height={440}
            className="mx-auto h-auto w-full max-w-md"
            priority
          />
        </div>
      </section>

      {/* The API call is isolated so a slow or cold backend cannot block the hero. */}
      <Suspense
        fallback={<p className="mx-auto max-w-5xl px-4 py-14 text-sm text-ink/50">Loading…</p>}
      >
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
        className="rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90"
      >
        Get started →
      </Link>
      {!user && (
        <Link
          href="/register"
          className="rounded-lg border border-navy/20 px-6 py-3 font-semibold text-navy transition hover:border-navy"
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
      <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <Image
          src="/images/slide-2.png"
          alt=""
          width={520}
          height={420}
          className="mx-auto h-auto w-full max-w-sm"
        />

        <div>
          <h2 className="mb-3 text-3xl font-extrabold uppercase leading-tight tracking-tight text-navy">
            See the available projects on the platform
          </h2>
          <p className="mb-6 text-sm text-ink/70">
            Knowing which projects are posted right now — and which are already finished —
            will determine your spirit.
          </p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat icon="◆" label="Active projects" value={stats.hiring} />
            <Stat icon="➤" label="Ongoing projects" value={stats.ongoing} />
            <Stat icon="✓" label="Finished projects" value={stats.finished} />
          </div>
        </div>
      </section>

      {latest_projects.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-4 pb-16">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-navy">
              Open for applications
            </h2>
            <Link href="/explore" className="text-sm font-semibold text-navy hover:text-glow">
              See all →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest_projects.map((project) => (
              <ProjectCard key={project.uuid} project={project} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-5xl px-4 pb-16 text-center">
        <h2 className="mb-2 text-3xl font-extrabold uppercase tracking-tight text-navy">
          Leaderboard
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-sm text-ink/70">
          These are the highest achievers. Set them as examples, or beat their records — the
          choice is yours.
        </p>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BOARD_KEYS.map((key) => (
            <LeaderboardCard key={key} board={key} entry={top_boards[key]} />
          ))}
        </div>

        <Link
          href="/leaderboard"
          className="inline-block rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90"
        >
          See all leaderboard
        </Link>
      </section>
    </>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div>
      <p className="mb-1 text-xl text-navy" aria-hidden>
        {icon}
      </p>
      <p className="text-3xl font-extrabold text-navy">{value}</p>
      <p className="text-sm font-semibold leading-tight text-navy/70">{label}</p>
    </div>
  );
}

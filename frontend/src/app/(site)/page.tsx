import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { BrainIcon, CheckOutlineIcon, PaperPlaneIcon } from "@/components/stat-icons";
import { LeaderboardCard } from "@/components/leaderboard-card";
import { BOARD_KEYS } from "@/lib/board-labels";
import { getHome } from "@/lib/projects";

/**
 * A port of the original three-slide home page. The line breaks in both display
 * headings are deliberate — the source set them by hand so each stack reads as a block,
 * and letting them wrap naturally is most of why this page stopped looking like PHive.
 */
export default function HomePage() {
  return (
    <main className="tracked flex-1">
      <section className="relative overflow-hidden bg-mist">
        {/* Ornaments. Decorative only, and hidden on small screens exactly as the
            original did — there is no room for them beside the heading. */}
        <Image
          src="/images/left-dashed-desktop.svg"
          alt=""
          width={200}
          height={200}
          className="moveInRightDash duration--2 pointer-events-none absolute bottom-[-40px] left-0 hidden select-none xl:block"
        />
        <Image
          src="/images/right-dashed-desktop.svg"
          alt=""
          width={200}
          height={200}
          className="moveInBottomLeft duration--2 pointer-events-none absolute right-0 top-[24vh] hidden select-none xl:block"
        />

        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-evenly gap-8 px-6 py-16 xl:min-h-[640px] xl:flex-row xl:justify-start xl:gap-0 xl:py-0 xl:pl-[95px]">
          <div className="relative z-[3] flex w-full flex-col items-center xl:mr-[-100px] xl:items-start xl:pt-10">
            <h1 className="moveInTop duration--1 display-heading mb-3 text-center text-[36px] sm:text-[48px] xl:mb-5 xl:text-left xl:text-[80px]">
              Expand <br />
              Your Career <br />
              by Doing <br />
              Project.
            </h1>

            <div className="pointer-events-none absolute select-none">
              <Image
                src="/images/triangle.svg"
                alt=""
                width={183}
                height={166}
                className="fadeIn duration--2 hidden translate-x-[312%] translate-y-[-194%] xl:block"
              />
            </div>

            <p className="moveInTop duration--1_5 mb-6 text-[14px] xl:ml-1.5 xl:text-[18px]">
              Fill up your college life with expectation
            </p>

            <Link
              href="/explore"
              className="moveInTop duration--2 flex flex-row items-center gap-2.5 rounded-[40px] bg-navy px-[35px] py-[15px] text-[18px] font-bold text-white transition hover:bg-navy/90 xl:ml-1.5"
            >
              <span>Get Started</span>
              <ArrowRight />
            </Link>
          </div>

          <div className="moveInTop duration--2 relative flex w-full flex-col items-center justify-center xl:z-[4] xl:h-full">
            <Image
              src="/images/dot-blue.svg"
              alt=""
              width={120}
              height={120}
              className="pointer-events-none absolute z-[1] translate-x-[-9rem] translate-y-[10rem] select-none xl:translate-x-[-20.6rem] xl:translate-y-[8rem]"
            />
            <Image
              src="/images/smiling-woman-looking-desktop.png"
              alt=""
              width={624}
              height={520}
              className="z-[3] h-auto w-full max-w-[420px] xl:w-[624px] xl:max-w-none"
              priority
            />
          </div>
        </div>
      </section>

      {/* The API call is isolated so a slow or cold backend cannot block the hero. */}
      <Suspense
        fallback={<p className="mx-auto max-w-[1280px] px-6 py-14 text-sm text-ink/50">Loading…</p>}
      >
        <Highlights />
      </Suspense>
    </main>
  );
}

async function Highlights() {
  const { stats, top_boards } = await getHome();

  return (
    <>
      <section className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center px-3 py-16 xl:flex-row xl:gap-[50px] xl:py-24">
        <Image
          src="/images/slide-2.png"
          alt=""
          width={450}
          height={420}
          className="h-auto w-full max-w-[360px] xl:w-[450px] xl:max-w-none"
        />

        <div className="xl:w-[664px]">
          <h2 className="display-heading mb-5 text-center text-[32px] leading-[3.6rem] sm:text-[36px] xl:text-left xl:text-[80px] xl:leading-[0.96]">
            See The <br />
            Available <br />
            Project on <br />
            The Platform
          </h2>

          <p className="mx-auto mb-10 max-w-[282px] text-center text-[18px] leading-[2.35rem] xl:mx-0 xl:max-w-none xl:text-left">
            Knowing the available project that currently posted on the website and the
            finished project will determine your spirit!
          </p>

          <div className="flex flex-row justify-center gap-6 sm:gap-10 xl:mx-auto xl:w-[492px] xl:gap-20">
            <Stat icon={<BrainIcon />} label="Active Projects" value={stats.hiring} />
            <Stat icon={<PaperPlaneIcon />} label="Ongoing Projects" value={stats.ongoing} />
            <Stat icon={<CheckOutlineIcon />} label="Finished Projects" value={stats.finished} />
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-4 pb-24 pt-8 text-center">
        <h2 className="mb-2 text-[36px] font-bold uppercase text-ink xl:mb-6 xl:text-[48px]">
          Leaderboard
        </h2>
        <p className="mb-6 max-w-[340px] text-[18px] leading-[2.35rem] xl:mb-8 xl:max-w-none">
          These are the highest achievers. Set them as examples, or beat their records. The
          choice is yours!
        </p>

        {/* w-full matters: without it this sits in a centred column and shrinks to fit,
            which wraps the fourth board onto its own row. */}
        <div className="mb-8 flex w-full flex-wrap items-stretch justify-center gap-5">
          {BOARD_KEYS.map((key) => (
            <LeaderboardCard key={key} board={key} entry={top_boards[key]} />
          ))}
        </div>

        <Link
          href="/leaderboard"
          className="flex h-[60px] w-[300px] items-center justify-center rounded-[15px] bg-navy text-[18px] font-bold text-white transition hover:bg-navy/90"
        >
          See All Leaderboard
        </Link>
      </section>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex w-[7.8em] flex-col items-center justify-center gap-[0.72rem] text-navy xl:w-[10.8em]">
      {icon}
      <div className="text-[24px] font-extrabold xl:text-[48px]">{value}</div>
      <div className="text-center text-[18px] font-bold xl:text-[24px]">{label}</div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-[1.5em]">
      <path
        d="M4 12h15m0 0-6-6m6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { BrainIcon, CheckOutlineIcon, PaperPlaneIcon } from "@/components/stat-icons";
import { LeaderboardCard } from "@/components/leaderboard-card";
import { Icon } from "@/lib/icons";
import { BOARD_KEYS } from "@/lib/board-labels";
import { getHome } from "@/lib/projects";

/**
 * A port of the original three-slide home page. The line breaks in both display
 * headings are deliberate — the source set them by hand so each stack reads as a block,
 * and letting them wrap naturally is most of why this page stopped looking like PHive.
 */
export default function HomePage() {
  return (
    <main className="tracked -mt-[92px] flex-1">
      {/* The hero is exactly one viewport tall, with a 640px floor — `.slide-1__container`
          set `height: 100vh` and the fixed header overlays it rather than pushing it
          down. Sizing this by its content instead put every absolutely-placed ornament
          at the wrong height, because they are all measured from its edges. */}
      <section className="relative h-screen min-h-[640px] overflow-hidden bg-mist">
        {/* Ornaments. Decorative, and each rendered at the SVG's own size: forcing a
            square box on them letterboxed the artwork, which is what clipped the dot
            off the end of the left-hand path. */}
        <Image
          src="/images/left-dashed-desktop.svg"
          alt=""
          width={178}
          height={429}
          // [transform:...] rather than -translate-y-1/4: Tailwind 4 compiles translate
          // utilities to the standalone `translate` property, which composes *with* the
          // keyframes' `transform` instead of being overridden by it. The path animated
          // in at -50% and then dropped 107px to -25% the moment the animation ended.
          className="moveInRightDash duration--2 pointer-events-none absolute bottom-[-40px] left-0 hidden select-none [transform:translateY(-25%)] xl:block"
        />
        <Image
          src="/images/right-dashed-desktop.svg"
          alt=""
          width={148}
          height={149}
          className="moveInBottomLeft duration--2 pointer-events-none absolute right-0 top-[24vh] hidden select-none xl:block"
        />

        <div className="mx-auto flex h-full w-full max-w-[1280px] flex-col items-center justify-evenly overflow-hidden px-6 xl:flex-row xl:justify-start xl:px-0 xl:pl-[95px]">
          <div className="relative top-[70px] z-[3] flex w-full flex-col items-center pt-[2vh] xl:top-0 xl:mr-[-100px] xl:items-start xl:pt-10">
            <h1 className="moveInTop duration--1 display-heading mb-3 text-center text-[36px] sm:text-[48px] xl:mb-5 xl:text-left xl:text-[80px]">
              Expand <br />
              Your Career <br />
              by Doing <br />
              Project.
            </h1>

            {/* `.slide-1__ornament`. The wrapper has to stay in flow and the image
                has to be the absolute one: an absolutely-positioned *flex item* is
                placed by the container's alignment rather than by its position among
                its siblings, which floated the triangle up to the top of the column.
                In flow, the triangle's offsets are measured from just below the
                heading, which is where the original measured them from. */}
            <div className="overflow-hidden">
              <Image
                src="/images/triangle.svg"
                alt=""
                width={183}
                height={166}
                className="fadeIn duration--2 pointer-events-none absolute h-[69px] w-[76px] translate-x-[150%] translate-y-[-100%] select-none xl:h-[166px] xl:w-[183px] xl:translate-x-[312%] xl:translate-y-[-194%]"
              />

              {/* The phone-sized paths. The desktop pair live on the section, because
                  there they are measured from the viewport's edges, not the heading's. */}
              <Image
                src="/images/left-dashed.svg"
                alt=""
                width={75}
                height={180}
                className="moveInRightDash duration--2 pointer-events-none absolute left-0 w-[20vmin] max-w-[75px] select-none [transform:translateY(-25%)] xl:hidden"
              />
              <Image
                src="/images/right-dashed.svg"
                alt=""
                width={80}
                height={80}
                className="moveInBottomLeft duration--2 pointer-events-none absolute right-0 top-[-10%] max-w-[80px] select-none xl:hidden"
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
              <Icon icon="ion:arrow-forward-outline" className="size-[1.5em]" aria-hidden />
            </Link>
          </div>

          <div className="moveInTop duration--2 relative flex w-full flex-col items-center justify-center xl:z-[4] xl:h-full">
            {/* 120x100 is the artwork's own size — a 5x4 grid of dots. Forcing it
                square letterboxed it, so the spacing came out wrong. */}
            <Image
              src="/images/dot-blue.svg"
              alt=""
              width={120}
              height={100}
              className="pointer-events-none absolute z-[1] translate-x-[-9rem] translate-y-[10rem] select-none xl:translate-x-[-20.6rem] xl:translate-y-[8rem]"
            />
            <Image
              src="/images/dot-blue.svg"
              alt=""
              width={120}
              height={100}
              className="pointer-events-none absolute z-[1] translate-x-[8rem] select-none xl:hidden"
            />
            <Image
              src="/images/smiling-woman-looking-desktop.png"
              alt=""
              width={624}
              height={520}
              className="z-[3] h-auto max-h-[45vh] w-auto object-contain xl:max-h-none xl:w-[624px]"
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


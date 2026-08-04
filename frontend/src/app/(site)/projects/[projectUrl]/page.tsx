import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProjectCard } from "@/components/project-card";
import { ShareRow } from "@/components/share-row";
import { SummaryIcon } from "@/components/summary-icons";
import { WishlistButton } from "@/components/wishlist-button";
import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/dal";
import { formatMoney, timeAgo } from "@/lib/format";
import { getProject, getSimilarProjects } from "@/lib/projects";
import type { Project } from "@/lib/types";

type Params = {
  params: Promise<{ projectUrl: string }>;
  searchParams: Promise<{ applied?: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { projectUrl } = await params;
  const project = await load(projectUrl);

  return {
    title: project.title ?? "Project",
    description: project.description?.slice(0, 160),
  };
}

/**
 * The original's project page: the title set at 9.6rem beside a thumbnail cut to an
 * organic shape by mask-image.png, the actions under it, then the written detail on the
 * left with the lecturer, share row and summary stacked on the right.
 */
export default async function ProjectPage({ params, searchParams }: Params) {
  const { projectUrl } = await params;
  const { applied } = await searchParams;
  const project = await load(projectUrl);

  return (
    <main className="mx-auto w-full max-w-[1090px] flex-1 px-6 py-8">
      <div className="flex flex-col justify-between xl:flex-row-reverse xl:items-center">
        <div
          className="mx-auto my-2 h-[220px] w-full max-w-[510px] bg-mist bg-cover bg-center sm:h-[260px] xl:h-[374px]"
          style={{
            backgroundImage: `url(${project.thumbnail ?? "/images/img-placeholder.png"})`,
            maskImage: "url(/images/mask-image.png)",
            maskSize: "100%",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
          role="img"
          aria-label=""
        />

        <div className="flex flex-col justify-end xl:w-[580px]">
          {/* The negative right margin and z-index are both the original's: long
              titles are meant to run across the thumbnail, drawn over it rather than
              under it. The white halo is what keeps them readable there.
              pointer-events-none so the text lying over the image does not swallow
              clicks meant for it — at the cost of the title no longer being
              selectable, which is the trade the overlap forces. */}
          <h1 className="text-outline pointer-events-none relative z-[1] text-center text-[28px] font-extrabold uppercase text-ink [text-wrap:balance] sm:text-[36px] xl:mr-[-140px] xl:text-left xl:text-[96px] xl:leading-[0.83]">
            {project.title}
          </h1>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row xl:mt-11">
            <Suspense fallback={<div className="h-[60px]" />}>
              <ApplyCallToAction project={project} justApplied={applied === "1"} />
            </Suspense>

            {project.is_wished !== undefined && project.project_url && (
              <WishlistButton
                projectUrl={project.project_url}
                initial={project.is_wished}
                variant="button"
              />
            )}
          </div>
        </div>
      </div>

      <hr className="my-8 border-t border-navy/20" />

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <Block title="Description">
            <p className="whitespace-pre-line leading-relaxed text-ink">
              {project.description || "-"}
            </p>
          </Block>

          <Block title="Requirements">
            {project.requirements && project.requirements.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-ink">
                {project.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            ) : (
              <p className="text-ink">-</p>
            )}
          </Block>

          <Block title="Skills">
            {project.skills && project.skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-[10px] bg-navy px-4 py-2.5 text-[16px] font-bold text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-ink">-</p>
            )}
          </Block>
        </div>

        <div>
          {project.user && (
            <section className="mb-6">
              <div className="flex flex-row items-start gap-4">
                <Image
                  src={project.user.photo_url ?? "/images/missing-avatar.svg"}
                  alt=""
                  width={90}
                  height={90}
                  className="size-[90px] shrink-0 rounded-full object-cover bg-[url('/images/missing-avatar.svg')] bg-cover bg-center"
                  unoptimized
                />
                <div>
                  <p className="text-[18px] font-bold text-ink">Posted By</p>
                  <Link
                    href={`/u/${project.user.tagname}`}
                    className="block text-ink hover:text-glow"
                  >
                    {project.user.name}
                  </Link>
                  {project.user.expertise && (
                    <p className="text-ink">{project.user.expertise} Specialist</p>
                  )}
                </div>
              </div>

              <Link
                href={`/messages/${project.user.tagname}`}
                className="mt-5 flex h-[55px] w-full items-center justify-center rounded-[10px] bg-navy text-[20px] font-bold text-white transition hover:bg-navy/90"
              >
                Contact Lecturer
              </Link>
            </section>
          )}

          <section className="mb-6">
            <h2 className="mb-3 text-[24px] font-bold text-ink">Share</h2>
            <ShareRow title={project.title ?? "PHive project"} />
          </section>

          <section>
            <h2 className="mb-3 text-[24px] font-bold text-ink">Summary Project</h2>
            <ul className="space-y-2.5 text-ink">
              {project.looking_for.length > 0 && (
                <SummaryRow icon="brush">
                  Expertise in {project.looking_for.join(", ")}
                </SummaryRow>
              )}
              <SummaryRow icon="money">
                {project.reward.salary
                  ? `${formatMoney(project.reward.currency, project.reward.amount)} for ${project.reward.payment_type}`
                  : "Unpaid"}
                {project.reward.certificate && " + Certificate"}
              </SummaryRow>
              <SummaryRow icon="clock">Posted {timeAgo(project.created_at)}</SummaryRow>
              <SummaryRow icon="people">
                Max. {project.max_person} Persons ({project.applicant_type})
              </SummaryRow>
              {project.level_applicant && (
                <SummaryRow icon="level">{project.level_applicant}</SummaryRow>
              )}
            </ul>
          </section>
        </div>
      </div>

      <Suspense fallback={null}>
        <SimilarProjects projectUrl={projectUrl} />
      </Suspense>
    </main>
  );
}

/**
 * Rendered separately so the session lookup does not hold up the project itself.
 * Guests get a prompt to sign in; lecturers get the disabled state the original showed.
 */
async function ApplyCallToAction({
  project,
  justApplied,
}: {
  project: Project;
  justApplied: boolean;
}) {
  const user = await getCurrentUser();
  const open = project.is_open_hiring && project.status === "Hiring";

  if (justApplied) {
    return (
      <p className="rounded-[10px] bg-mist px-4 py-3 text-[16px] text-navy">
        Application sent. You&apos;ll hear back through your{" "}
        <Link href="/inbox" className="font-bold hover:text-glow">
          inbox
        </Link>
        .
      </p>
    );
  }

  const base =
    "flex h-[60px] w-full items-center justify-center rounded-[10px] text-[18px] font-bold sm:w-[280px]";

  if (!open || user?.role === "Lecturer") {
    return <span className={`${base} bg-[#f1f1f1] text-ink/40`}>Apply Project</span>;
  }

  return user ? (
    <Link
      href={`/projects/${project.project_url}/apply`}
      className={`${base} bg-navy text-white transition hover:bg-navy/90`}
    >
      Apply Project
    </Link>
  ) : (
    <Link
      href="/login"
      className={`${base} border-2 border-navy bg-white text-navy transition hover:bg-mist`}
    >
      Sign in to apply
    </Link>
  );
}

async function SimilarProjects({ projectUrl }: { projectUrl: string }) {
  const projects = await getSimilarProjects(projectUrl);

  if (projects.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-center text-[28px] font-bold text-ink xl:text-[36px]">
        Other Projects You Might Like
      </h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.uuid} project={project} />
        ))}
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-[24px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function SummaryRow({
  icon,
  children,
}: {
  icon: React.ComponentProps<typeof SummaryIcon>["name"];
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-row items-center gap-3">
      <SummaryIcon name={icon} />
      <span>{children}</span>
    </li>
  );
}

async function load(projectUrl: string): Promise<Project> {
  try {
    return await getProject(projectUrl);
  } catch (error) {
    // Drafts and unknown slugs both 404 from the API.
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

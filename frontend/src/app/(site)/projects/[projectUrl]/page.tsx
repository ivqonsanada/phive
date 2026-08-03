import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProjectCard } from "@/components/project-card";
import { WishlistButton } from "@/components/wishlist-button";
import { ApiError } from "@/lib/api";
import { getProject, getSimilarProjects } from "@/lib/projects";
import type { Project } from "@/lib/types";

type Params = { params: Promise<{ projectUrl: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { projectUrl } = await params;
  const project = await load(projectUrl);

  return {
    title: project.title ?? "Project",
    description: project.description?.slice(0, 160),
  };
}

export default async function ProjectPage({ params }: Params) {
  const { projectUrl } = await params;
  const project = await load(projectUrl);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      {project.thumbnail && (
        <Image
          src={project.thumbnail}
          alt=""
          width={960}
          height={360}
          className="mb-6 h-56 w-full rounded-xl object-cover"
          priority
          unoptimized
        />
      )}

      <header className="mb-6">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-navy">{project.title}</h1>
          {project.is_wished !== undefined && project.project_url && (
            <WishlistButton projectUrl={project.project_url} initial={project.is_wished} />
          )}
        </div>

        <p className="text-sm text-ink/70">
          {project.user && (
            <>
              Published by{" "}
              <Link href={`/u/${project.user.tagname}`} className="font-semibold text-navy hover:text-glow">
                {project.user.name}
              </Link>{" "}
              ·{" "}
            </>
          )}
          <span className="font-semibold">{project.status}</span>
          {!project.is_open_hiring && " · applications closed"}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {project.looking_for.map((expertise) => (
          <span
            key={expertise}
            className="rounded-full bg-navy/5 px-3 py-1 text-sm font-medium text-navy"
          >
            {expertise}
          </span>
        ))}
      </div>

      <section className="mb-8 whitespace-pre-line text-ink/80">{project.description}</section>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Panel title="Reward">
          <ul className="space-y-1 text-sm text-ink/70">
            <li>{project.reward.certificate ? "Certificate on completion" : "No certificate"}</li>
            <li>
              {project.reward.salary
                ? `${project.reward.currency} ${Number(project.reward.amount).toLocaleString()} per ${project.reward.payment_type}`
                : "Unpaid"}
            </li>
          </ul>
        </Panel>

        <Panel title="Applying">
          <ul className="space-y-1 text-sm text-ink/70">
            <li>Accepts: {project.applicant_type}</li>
            <li>Team size: {project.max_person}</li>
            {project.level_applicant && <li>Level: {project.level_applicant}</li>}
          </ul>
        </Panel>

        {project.skills && project.skills.length > 0 && (
          <Panel title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {project.skills.map((skill) => (
                <span key={skill} className="rounded bg-navy/5 px-2 py-1 text-xs text-navy">
                  {skill}
                </span>
              ))}
            </div>
          </Panel>
        )}

        {project.requirements && project.requirements.length > 0 && (
          <Panel title="Requirements">
            <ul className="list-disc space-y-1 pl-4 text-sm text-ink/70">
              {project.requirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      <Suspense fallback={null}>
        <SimilarProjects projectUrl={projectUrl} />
      </Suspense>
    </main>
  );
}

async function SimilarProjects({ projectUrl }: { projectUrl: string }) {
  const projects = await getSimilarProjects(projectUrl);

  if (projects.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 font-semibold text-navy">You might also like</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">{title}</h2>
      {children}
    </section>
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

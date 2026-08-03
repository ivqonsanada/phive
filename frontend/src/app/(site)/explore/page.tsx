import type { Metadata } from "next";
import Link from "next/link";

import { ExploreFiltersBar } from "@/app/(site)/explore/filters";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/lib/projects";
import type { Expertise } from "@/lib/types";

export const metadata: Metadata = { title: "Explore projects" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; expertise?: string; page?: string }>;
}) {
  const { query, expertise, page } = await searchParams;

  const projects = await getProjects({
    query,
    expertise: expertise as Expertise | undefined,
    page: page ? Number(page) : undefined,
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Explore projects</h1>
      <p className="mb-6 text-sm text-ink/70">
        Everything lecturers have published, newest first.
      </p>

      <ExploreFiltersBar query={query} expertise={expertise} />

      {projects.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
          Nothing matches that yet. Try a broader search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.data.map((project) => (
            <ProjectCard key={project.uuid} project={project} />
          ))}
        </div>
      )}

      <nav className="mt-8 flex justify-between text-sm">
        <PageLink href={projects.links.prev} label="← Previous" current={query} expertise={expertise} />
        <PageLink href={projects.links.next} label="Next →" current={query} expertise={expertise} />
      </nav>
    </main>
  );
}

/**
 * The API returns absolute pagination URLs; turn them back into local hrefs so the
 * browser stays on the frontend.
 */
function PageLink({
  href,
  label,
  current,
  expertise,
}: {
  href: string | null;
  label: string;
  current?: string;
  expertise?: string;
}) {
  if (!href) {
    return <span className="text-ink/30">{label}</span>;
  }

  const page = new URL(href).searchParams.get("page");
  const params = new URLSearchParams();
  if (current) params.set("query", current);
  if (expertise) params.set("expertise", expertise);
  if (page) params.set("page", page);

  return (
    <Link href={`/explore?${params}`} className="font-semibold text-navy hover:text-glow">
      {label}
    </Link>
  );
}

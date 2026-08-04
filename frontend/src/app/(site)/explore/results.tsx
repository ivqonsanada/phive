"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ProjectCard } from "@/components/project-card";
import { useProjects } from "@/lib/queries";
import type { Expertise } from "@/lib/types";

export function ExploreResults() {
  const searchParams = useSearchParams();

  const query = searchParams.get("query") ?? undefined;
  const expertise = (searchParams.get("expertise") as Expertise | null) ?? undefined;
  const page = searchParams.get("page");

  const { data, isPending, isError, error } = useProjects({
    query,
    expertise,
    page: page ? Number(page) : undefined,
  });

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-56 animate-pulse rounded-xl border border-navy/10 bg-navy/5" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
        {error instanceof Error ? error.message : "Could not load projects."}
      </p>
    );
  }

  return (
    <>
      {data.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
          Nothing matches that yet. Try a broader search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((project) => (
            <ProjectCard key={project.uuid} project={project} />
          ))}
        </div>
      )}

      <nav className="mt-8 flex justify-between text-sm">
        <PageLink href={data.links.prev} label="← Previous" query={query} expertise={expertise} />
        <PageLink href={data.links.next} label="Next →" query={query} expertise={expertise} />
      </nav>
    </>
  );
}

/**
 * The API returns absolute pagination URLs; turn them back into local hrefs so the
 * browser stays on the frontend.
 */
function PageLink({
  href,
  label,
  query,
  expertise,
}: {
  href: string | null;
  label: string;
  query?: string;
  expertise?: string;
}) {
  if (!href) {
    return <span className="text-ink/30">{label}</span>;
  }

  const page = new URL(href).searchParams.get("page");
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (expertise) params.set("expertise", expertise);
  if (page) params.set("page", page);

  return (
    <Link href={`/explore?${params}`} className="font-semibold text-navy hover:text-glow">
      {label}
    </Link>
  );
}

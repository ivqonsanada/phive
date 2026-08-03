import Link from "next/link";

import { WishlistButton } from "@/components/wishlist-button";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col rounded-xl border border-navy/10 p-5 transition hover:border-navy/30">
      <div className="mb-2 flex items-start justify-between gap-3">
        <Link
          href={`/projects/${project.project_url}`}
          className="font-semibold text-navy hover:text-glow"
        >
          {project.title}
        </Link>
        {project.is_wished !== undefined && project.project_url && (
          <WishlistButton projectUrl={project.project_url} initial={project.is_wished} />
        )}
      </div>

      {project.user && (
        <Link href={`/u/${project.user.tagname}`} className="mb-3 text-sm text-ink/60 hover:text-glow">
          by {project.user.name}
        </Link>
      )}

      <p className="mb-4 line-clamp-3 text-sm text-ink/70">{project.description}</p>

      <div className="mt-auto flex flex-wrap gap-1.5">
        {project.looking_for.map((expertise) => (
          <span
            key={expertise}
            className="rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy"
          >
            {expertise}
          </span>
        ))}
        <span className="ml-auto self-center text-xs font-semibold uppercase tracking-wide text-ink/50">
          {project.status}
        </span>
      </div>
    </article>
  );
}

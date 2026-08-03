import Image from "next/image";
import Link from "next/link";

import { WishlistButton } from "@/components/wishlist-button";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-navy/10 transition hover:border-navy/30">
      {project.thumbnail && (
        <Image
          src={project.thumbnail}
          alt=""
          width={480}
          height={200}
          className="h-32 w-full object-cover"
          unoptimized
        />
      )}

      <div className="flex flex-1 flex-col p-5">
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
          <Link
            href={`/u/${project.user.tagname}`}
            className="mb-3 text-sm text-ink/60 hover:text-glow"
          >
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
      </div>
    </article>
  );
}

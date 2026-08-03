import Link from "next/link";

import { closeApplications, publishProject, withdrawProject } from "@/app/actions/manage-projects";
import { startProject } from "@/app/actions/project-box";
import type { Project } from "@/lib/types";

export function ProjectRow({ project }: { project: Project }) {
  const url = project.project_url ?? "";
  const isDraft = project.status === "Draft";
  const isHiring = project.status === "Hiring";
  const isOngoing = project.status === "Ongoing";
  const isFinished = project.status === "Finished";

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-navy/10 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-navy">{project.title ?? "Untitled draft"}</p>
        <p className="text-xs uppercase tracking-wide text-ink/50">
          {project.status}
          {isHiring && !project.is_open_hiring && " · applications closed"}
        </p>
      </div>

      <Link
        href={`/my/projects/${url}/edit`}
        className="rounded-lg border border-navy/15 px-3 py-1.5 text-sm font-semibold text-navy hover:border-navy"
      >
        Edit
      </Link>

      {!isDraft && (
        <Link
          href={`/my/projects/${url}/shortlist`}
          className="rounded-lg border border-navy/15 px-3 py-1.5 text-sm font-semibold text-navy hover:border-navy"
        >
          Applicants
        </Link>
      )}

      {isDraft && (
        <form action={publishProject.bind(null, url)}>
          <button
            type="submit"
            className="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy/90"
          >
            Publish
          </button>
        </form>
      )}

      {isHiring && project.is_open_hiring && (
        <form action={closeApplications.bind(null, url)}>
          <button type="submit" className="text-sm font-semibold text-navy hover:text-glow">
            Close applications
          </button>
        </form>
      )}

      {isHiring && (
        <form action={startProject.bind(null, url)}>
          <button
            type="submit"
            className="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy/90"
          >
            Start
          </button>
        </form>
      )}

      {isOngoing && (
        <Link
          href={`/my/projects/${url}/review`}
          className="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          Review &amp; finish
        </Link>
      )}

      {!isDraft && (
        <Link
          href={`/projects/${url}`}
          className="text-sm font-semibold text-navy hover:text-glow"
        >
          View
        </Link>
      )}

      {!isOngoing && !isFinished && (
        <form action={withdrawProject.bind(null, url)}>
          <button type="submit" className="text-sm font-semibold text-glow hover:underline">
            Withdraw
          </button>
        </form>
      )}
    </li>
  );
}

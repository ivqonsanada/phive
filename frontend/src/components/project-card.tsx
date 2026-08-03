import Image from "next/image";
import Link from "next/link";

import { WishlistButton } from "@/components/wishlist-button";
import { formatMoney, timeAgo } from "@/lib/format";
import type { Project } from "@/lib/types";

/**
 * Mirrors the original card: cover image with the reward overlaid, then the facts a
 * student actually decides on — who posted it, what expertise it wants, level, whether
 * it pays, whether it certifies, team size, and how old the posting is.
 */
export function ProjectCard({ project }: { project: Project }) {
  const reward = formatMoney(project.reward.currency, project.reward.amount);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-navy/10 transition hover:border-navy/30">
      <div className="relative">
        <Image
          src={project.thumbnail ?? "/images/post-placeholder-img.png"}
          alt=""
          width={480}
          height={220}
          className="h-36 w-full object-cover"
          unoptimized
        />
        <span className="absolute -bottom-3 left-4 rounded-lg bg-navy px-3 py-1.5 text-sm font-bold text-white">
          {project.reward.salary ? reward : "Unpaid"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <Link
            href={`/projects/${project.project_url}`}
            className="font-bold text-navy hover:text-glow"
          >
            {project.title}
          </Link>
          {project.is_wished !== undefined && project.project_url && (
            <WishlistButton projectUrl={project.project_url} initial={project.is_wished} />
          )}
        </div>

        <dl className="mb-3 space-y-0.5 text-sm text-ink/70">
          {project.looking_for.length > 0 && (
            <div>
              <dt className="inline font-medium">Expertise in: </dt>
              <dd className="inline">{project.looking_for.join(", ")}</dd>
            </div>
          )}
          {project.user && (
            <div>
              <dt className="inline font-medium">Posted by: </dt>
              <dd className="inline">
                <Link href={`/u/${project.user.tagname}`} className="hover:text-glow">
                  {project.user.name}
                </Link>
              </dd>
            </div>
          )}
          <div>
            <dt className="inline font-medium">Applicant: </dt>
            <dd className="inline">{project.applicant_type}</dd>
          </div>
        </dl>

        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {project.level_applicant && (
            <span className="text-ink/70">
              <span className="font-bold text-navy">LVL</span> {project.level_applicant}
            </span>
          )}
          {project.reward.salary && <span className="text-ink/70">$ Salary</span>}
          {project.reward.certificate && <span className="text-ink/70">✓ Certificate</span>}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 text-xs text-ink/50">
          <span>Posted {timeAgo(project.created_at)}</span>
          {project.max_person !== "Not Specified" && <span>· Max. {project.max_person} person</span>}
          <span className="ml-auto font-semibold uppercase tracking-wide">{project.status}</span>
        </div>
      </div>
    </article>
  );
}

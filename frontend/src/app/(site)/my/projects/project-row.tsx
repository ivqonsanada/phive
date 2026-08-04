import Link from "next/link";

import { closeApplications, publishProject, withdrawProject } from "@/app/actions/manage-projects";
import { startProject } from "@/app/actions/project-box";
import { Thumbnail } from "@/components/avatar";
import { ProjectBox, ProjectBoxActions, ProjectBoxRow } from "@/components/project-box";
import { btn } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import type { Project } from "@/lib/types";

/**
 * Built from the same `.project-box__*` parts as the project box, because to a lecturer
 * these are the same objects seen from a different angle — a row that looked unrelated
 * would read as a different kind of thing.
 */
export function ProjectRow({ project }: { project: Project }) {
  const url = project.project_url ?? "";
  const isDraft = project.status === "Draft";
  const isHiring = project.status === "Hiring";
  const isOngoing = project.status === "Ongoing";
  const isFinished = project.status === "Finished";

  return (
    <li>
      <ProjectBox>
        <ProjectBoxRow>
          {isDraft ? (
            <Thumbnail
              src={project.thumbnail}
              width={100}
              height={100}
              className="h-[100px] w-[90px] shrink-0 rounded-[5px] sm:w-[100px]"
            />
          ) : (
            <Link href={`/projects/${url}`} className="shrink-0">
              <Thumbnail
                src={project.thumbnail}
                width={100}
                height={100}
                className="h-[100px] w-[90px] rounded-[5px] sm:w-[100px]"
              />
            </Link>
          )}

          <div className="flex w-full min-w-0 flex-col gap-2">
            <div className="line-clamp-2 break-words text-[18px] font-bold leading-[1.25] text-[#020201] xl:text-[24px]">
              {project.title ?? "Untitled draft"}
            </div>

            {/* The pitch and the two facts an applicant sees, as the original's
                lecturer rows had. Without them the column is empty and the meta line
                strands itself at the bottom of a row the button stack has made tall. */}
            {project.description && (
              <p className="line-clamp-2 text-[12px] leading-[1.65]">{project.description}</p>
            )}

            <div className="flex flex-col gap-1 xl:flex-row xl:gap-5">
              <div className="flex flex-row items-center gap-[5px] whitespace-nowrap text-[11px]">
                <Icon icon="ic:round-access-time" className="size-3" aria-hidden />
                <span className="hidden sm:inline">Posted on</span>{" "}
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex flex-row items-center gap-[5px] whitespace-nowrap text-[11px]">
                <b className="ml-[2px] w-2.5">{project.status.charAt(0)}</b>
                <span>{project.status}</span>
                {isHiring && !project.is_open_hiring && <span>· applications closed</span>}
              </div>
              <div className="flex flex-row items-center gap-[5px] whitespace-nowrap text-[11px]">
                <Icon icon="ri:team-fill" className="size-3" aria-hidden />
                {/* max_person is a string that can literally be "Not Specified", and
                    the original's `Max. {{ max_person }} Person` rendered that as
                    "Max. Not Specified Person". */}
                <span>
                  {project.max_person === "Not Specified"
                    ? "Team size not specified"
                    : `Max. ${project.max_person} Person`}
                </span>
              </div>
            </div>
          </div>

          <ProjectBoxActions className="hidden shrink-0 xl:block">
            <Actions project={project} />
          </ProjectBoxActions>
        </ProjectBoxRow>

        {/* The same buttons, stacked under the row on a phone where there is no third
            column to put them in. */}
        <div className="mt-5 xl:hidden">
          <Actions project={project} />
        </div>
      </ProjectBox>
    </li>
  );

  function Actions({ project }: { project: Project }) {
    return (
      <div className="flex flex-col gap-2.5">
        <Link href={`/my/projects/${url}/edit`} className={btn("blue", { size: "small" })}>
          Edit Project
        </Link>

        {isDraft && (
          <form action={publishProject.bind(null, url)}>
            <button
              type="submit"
              disabled={!project.title}
              className={btn("grey2", { size: "small" })}
            >
              Publish
            </button>
          </form>
        )}

        {!isDraft && (
          <Link
            href={`/my/projects/${url}/shortlist`}
            className={btn("grey2", { size: "small" })}
          >
            Applicants
          </Link>
        )}

        {isHiring && project.is_open_hiring && (
          <form action={closeApplications.bind(null, url)}>
            <button type="submit" className={btn("grey", { size: "small" })}>
              End Application
            </button>
          </form>
        )}

        {isHiring && (
          <form action={startProject.bind(null, url)}>
            <button type="submit" className={btn("green", { size: "small" })}>
              Start Project
            </button>
          </form>
        )}

        {isOngoing && (
          <Link href={`/my/projects/${url}/review`} className={btn("blue", { size: "small" })}>
            Review &amp; Finish
          </Link>
        )}

        {!isOngoing && !isFinished && (
          <form action={withdrawProject.bind(null, url)}>
            <button type="submit" className={btn("decline", { size: "small" })}>
              Withdraw
            </button>
          </form>
        )}
      </div>
    );
  }
}

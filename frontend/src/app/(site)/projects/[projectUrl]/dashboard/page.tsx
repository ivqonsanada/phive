import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Avatar, Thumbnail } from "@/components/avatar";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import { getProject } from "@/lib/projects";
import type { Project } from "@/lib/types";

type Params = { params: Promise<{ projectUrl: string }> };

export const metadata: Metadata = { title: "Project" };

/**
 * The original's `/project/:id/dashboard`: what a participant sees once the project is
 * running. It is the detail page's material plus the people you are working with, and
 * the reminder that the lecturer — not this page — is where questions go.
 *
 * Reachable only by someone on the team or the lecturer who owns it. The API already
 * returns the roster on the detail payload, so there is nothing extra to fetch; the
 * check here is about who may see this view, not about hiding data the API would hand
 * over anyway.
 */
export default async function ProjectDashboardPage({ params }: Params) {
  const user = await requireUser();
  const { projectUrl } = await params;

  let project: Project;

  try {
    project = await getProject(projectUrl);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const members = project.team?.members ?? [];
  const isParticipant = members.some((member) => member.user?.uuid === user.uuid);
  const isOwner = project.user?.uuid === user.uuid;

  // A project nobody has started has no dashboard to show, and a stranger has no
  // business on one that has.
  if (project.status !== "Ongoing" || !(isParticipant || isOwner)) {
    redirect(`/projects/${projectUrl}`);
  }

  const startedOn = project.start_time
    ? new Date(project.start_time).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="mx-auto w-full max-w-[1090px] flex-1 px-[30px] pb-[30px] pt-[5px]">
      <div className="flex flex-col xl:mb-10 xl:flex-row-reverse">
        <div className="mt-[25px] xl:w-[509px]">
          <Thumbnail
            src={project.thumbnail}
            width={509}
            height={374}
            className="h-[220px] w-full rounded-[10px] sm:h-[260px] xl:h-[374px]"
            priority
          />
        </div>

        <div className="flex flex-col xl:justify-end">
          <h1 className="text-outline mb-[15px] mt-0 text-center text-[28px] font-extrabold uppercase sm:text-[36px] md:mt-5 xl:z-[1] xl:m-0 xl:mr-[-140px] xl:max-w-[768px] xl:text-left xl:text-[96px] xl:leading-[80px]">
            {project.title}
          </h1>

          {startedOn && (
            <p className="mt-4 text-center text-[14px] font-bold italic xl:text-left xl:text-[18px]">
              On Going Project Since {startedOn}
            </p>
          )}

          <p className="mt-2 text-center text-[14px] xl:text-left xl:text-[18px]">
            Please contact your lecturer for your further information about the project.
          </p>
        </div>
      </div>

      <hr className="my-[30px] border-[#b0aeae]" />

      <section className="mb-[30px]">
        <h2 className="mb-[15px] text-center text-[18px] font-bold sm:text-[24px] xl:text-left">
          Project Participants
        </h2>

        {members.length === 0 ? (
          <p className="text-center text-[14px] xl:text-left">
            Nobody has been added to this project yet.
          </p>
        ) : (
          <div className="-m-3 flex flex-row flex-wrap justify-center xl:-m-4 xl:justify-start">
            {members.map((member) => (
              <div
                key={member.user?.uuid ?? member.expertise}
                className="m-3 flex max-w-[109px] flex-col items-center justify-start xl:m-4 xl:max-w-[140px]"
              >
                {member.user ? (
                  <Link href={`/u/${member.user.tagname}`}>
                    <Avatar
                      src={member.user.photo_url}
                      size={90}
                      sizeClassName="size-[65px] xl:size-[90px]"
                      className="mb-[7px]"
                    />
                  </Link>
                ) : (
                  <Avatar
                    src={null}
                    size={90}
                    sizeClassName="size-[65px] xl:size-[90px]"
                    className="mb-[7px]"
                  />
                )}

                <p className="text-center text-[14px] font-bold leading-[1.15] xl:text-[18px] xl:font-semibold">
                  {member.user?.name ?? "Unknown"}
                </p>
                <p className="mt-1 text-center text-[12px] leading-[1.15] xl:text-[16px]">
                  {member.expertise ?? member.user?.expertise ?? "No expertise set"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-[30px]">
        <h3 className="mb-2.5 text-[14px] font-bold xl:text-[24px]">Description</h3>
        <p className="whitespace-pre-line text-[12px] leading-[1.65] xl:text-[14px]">
          {project.description}
        </p>
      </section>

      {project.requirements && project.requirements.length > 0 && (
        <section className="mb-[30px]">
          <h3 className="mb-2.5 text-[14px] font-bold xl:text-[24px]">Requirements</h3>
          <ul className="list-disc pl-5 text-[12px] leading-[1.65] xl:text-[14px]">
            {project.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </section>
      )}

      {project.skills && project.skills.length > 0 && (
        <section className="mb-[30px]">
          <h3 className="mb-2.5 text-[14px] font-bold xl:text-[24px]">Skills</h3>
          <div className="flex flex-wrap gap-2.5">
            {project.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-[10px] bg-mist px-4 py-2 text-[12px] font-semibold text-navy xl:text-[14px]"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      <Link
        href={`/projects/${projectUrl}`}
        className="text-[14px] font-bold text-navy underline hover:text-glow"
      >
        See the full project page
      </Link>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

import { confirmSeat } from "@/app/actions/project-box";
import {
  closeApplications,
  publishProject,
  withdrawProject,
} from "@/app/actions/manage-projects";
import { Thumbnail } from "@/components/avatar";
import { ProjectBox, ProjectBoxActions, ProjectBoxRow } from "@/components/project-box";
import { btn } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { Icon } from "@/lib/icons";
import type { Project, UserRole } from "@/lib/types";

export interface Box {
  uuid: string;
  status: string;
  can_confirm: boolean;
  updated_at: string;
  project: Project;
}

/**
 * The original had eleven components here — one per (role, status) pair — that shared a
 * layout and differed in an icon, a sentence and a row of buttons. This is one
 * component and three tables, because eleven files that agree on their markup drift:
 * two of the originals had already picked different icons for "Bail Out".
 */
const STUDENT_STATUS: Record<string, { icon: string; red?: boolean; blurb: string }> = {
  Waiting: {
    icon: "ant-design:field-time-outlined",
    blurb: "Your proposal sent. Lets wait the lecturer decide.",
  },
  Accepted: {
    icon: "bi:shield-fill-check",
    blurb:
      "You’re Accepted to join this project. Please send the confirmation message to PIC of the project if you’re agree on joining the project by clicking the “Agree to Join” button, you have 24 hours to make an agreement to the PIC. It will be change to rejected automatically within 24 hours if you don’t make a confirmation.",
  },
  Rejected: {
    icon: "ic:round-block",
    red: true,
    blurb: "You are rejected. Don't lose your hope, try another one!",
  },
  "Waiting to Start": {
    icon: "ant-design:field-time-outlined",
    blurb:
      "You have been shortlisted, the system will automatically accept you once the lecturer agree to start the project.",
  },
  "Project Started": {
    icon: "mdi:alpha-s-circle-outline",
    blurb: "The project has started. Open the dashboard to see what is happening.",
  },
  "Bail Out": {
    icon: "bx:bx-log-out-circle",
    blurb: "You were chose to Bail Out the project invitation.",
  },
  Finished: {
    icon: "el:flag",
    blurb: "Project Finished. You can see the project on your biography for more details.",
  },
};

/** The lecturer's statuses are drawn as a letter, not an icon, in the original. */
const LECTURER_STATUS: Record<string, { letter: string; label: string }> = {
  Draft: { letter: "D", label: "Draft" },
  Hiring: { letter: "H", label: "Hiring" },
  Ongoing: { letter: "O", label: "Ongoing" },
  Confirmation: { letter: "C", label: "Confirmation" },
  Finished: { letter: "F", label: "Finished" },
};

export function BoxItem({ box, role }: { box: Box; role: UserRole }) {
  const [showDetails, setShowDetails] = useState(false);
  const project = box.project;
  const isLecturer = role === "Lecturer";
  const student = STUDENT_STATUS[box.status];

  const body = isLecturer ? (
    <LecturerBody box={box} />
  ) : (
    <p className="mb-5 text-[12px] leading-[1.65]">{student?.blurb}</p>
  );

  const actions = isLecturer ? <LecturerActions box={box} /> : <StudentActions box={box} />;

  return (
    <ProjectBox>
      <ProjectBoxRow>
        <Link href={`/projects/${project.project_url}`} className="shrink-0">
          <Thumbnail
            src={project.thumbnail}
            width={100}
            height={100}
            className="h-[100px] w-[90px] rounded-[5px] sm:w-[100px]"
          />
        </Link>

        <div className="flex w-full min-w-0 flex-col justify-between xl:gap-3">
          <div className="line-clamp-2 break-words text-[18px] font-bold leading-[1.25] text-[#020201] xl:text-[24px]">
            {project.title}
          </div>

          {isLecturer ? (
            <div className="flex flex-col gap-1 xl:flex-row xl:gap-5">
              <div className="flex flex-row items-center gap-[5px] text-[11px]">
                <Icon icon="ic:round-access-time" className="size-3" aria-hidden />
                <span className="hidden sm:inline">Posted on</span>{" "}
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex flex-row items-center gap-[5px] text-[11px]">
                <b className="ml-[2px] w-2.5">
                  {LECTURER_STATUS[box.status]?.letter ?? box.status.charAt(0)}
                </b>
                <span>{LECTURER_STATUS[box.status]?.label ?? box.status}</span>
                {box.status === "Draft" && <span className="ml-2">Not posted yet</span>}
              </div>
            </div>
          ) : (
            <div
              className={`mb-1 mt-2 flex flex-row items-center gap-[5px] text-[13.6px] font-bold sm:text-[14px] ${
                student?.red ? "text-[#eb2d2d]" : "text-navy"
              }`}
            >
              <Icon
                icon={student?.icon ?? "ant-design:field-time-outlined"}
                className="size-[18px] sm:size-5 xl:size-3"
                aria-hidden
              />
              <span>{box.status}</span>
            </div>
          )}

          <div className="hidden xl:block">{body}</div>

          <button
            type="button"
            onClick={() => setShowDetails((open) => !open)}
            aria-expanded={showDetails}
            className="flex cursor-pointer select-none flex-row items-center justify-between border-none bg-transparent p-0 xl:hidden"
          >
            <span className="text-[14px] font-bold underline">Details</span>
            {showDetails && (
              <Icon icon="ion:close" className="size-[14px] text-[#9d9d9d]" aria-hidden />
            )}
          </button>
        </div>

        <ProjectBoxActions className="hidden shrink-0 xl:block">{actions}</ProjectBoxActions>
      </ProjectBoxRow>

      {showDetails && (
        <div className="mt-5 xl:hidden">
          {body}
          {actions}
        </div>
      )}
    </ProjectBox>
  );
}

/** The lecturer's desktop body: the pitch, then the three facts an applicant sees. */
function LecturerBody({ box }: { box: Box }) {
  const project = box.project;

  const rewards = project.reward.salary
    ? project.reward.certificate
      ? "Earn Salary & Certificate"
      : "Earn Salary"
    : project.reward.certificate
      ? "Earn Certificate"
      : "Not Specified";

  return (
    <>
      <p className="mb-[15px] line-clamp-3 text-[12px] leading-[1.65]">{project.description}</p>

      <div className="mb-[15px] flex flex-col gap-[5px] xl:flex-row xl:gap-5">
        <Summary icon="fa-solid:dollar-sign">
          {rewards}
          {project.reward.salary &&
            ` · ${formatMoney(project.reward.currency, project.reward.amount)}`}
        </Summary>
        {/* "Not Specified" is a real value here, and the original's
            `Max. {{ max_person }} Person` rendered it as "Max. Not Specified Person". */}
        <Summary icon="ri:team-fill">
          {project.max_person === "Not Specified"
            ? "Team size not specified"
            : `Max. ${project.max_person} Person`}
        </Summary>
      </div>
    </>
  );
}

function Summary({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <Icon icon={icon} className="size-[18px] shrink-0 sm:size-5 xl:size-3" aria-hidden />
      <span className="text-[12px] xl:text-[11px]">{children}</span>
    </div>
  );
}

function StudentActions({ box }: { box: Box }) {
  if (box.can_confirm) {
    return (
      <div className="flex flex-col">
        <form action={confirmSeat.bind(null, box.uuid, true)}>
          <button type="submit" className={btn("blue", { size: "small" })}>
            Agree to Join
          </button>
        </form>
        <form action={confirmSeat.bind(null, box.uuid, false)} className="mt-2.5">
          <button type="submit" className={btn("decline", { size: "small" })}>
            Bail Out
          </button>
        </form>
      </div>
    );
  }

  if (box.status === "Project Started") {
    return (
      <Link href={`/projects/${box.project.project_url}/dashboard`} className={btn("blue")}>
        Project Dashboard
      </Link>
    );
  }

  return null;
}

function LecturerActions({ box }: { box: Box }) {
  const url = box.project.project_url;

  if (!url) {
    return null;
  }

  const editHref = `/my/projects/${url}/edit`;

  if (box.status === "Draft") {
    return (
      <div className="flex flex-col gap-2.5">
        <form action={publishProject.bind(null, url)}>
          <button
            type="submit"
            // The original disabled this while the draft had no title. A draft with
            // nothing in it is not a project anyone can apply to.
            disabled={!box.project.title}
            className={btn("blue", { size: "small" })}
          >
            Publish Project
          </button>
        </form>
        <Link href={editHref} className={btn("grey2", { size: "small" })}>
          Edit Project
        </Link>
        <form action={withdrawProject.bind(null, url)}>
          <button type="submit" className={btn("decline", { size: "small" })}>
            Cancel Project
          </button>
        </form>
      </div>
    );
  }

  if (box.status === "Hiring") {
    return (
      <div className="flex flex-col gap-2.5">
        <Link href={editHref} className={btn("blue", { size: "small" })}>
          Edit Project
        </Link>
        <form action={closeApplications.bind(null, url)}>
          <button type="submit" className={btn("decline", { size: "small" })}>
            End Application
          </button>
        </form>
        <div className="my-1 h-px bg-[#b0aeae]" />
        <Link href={`/my/projects/${url}/shortlist`} className={btn("grey2", { size: "small" })}>
          Shortlist Students
        </Link>
      </div>
    );
  }

  if (box.status === "Ongoing") {
    return (
      <Link href={`/my/projects/${url}/review`} className={btn("blue", { size: "small" })}>
        Review Project
      </Link>
    );
  }

  return null;
}

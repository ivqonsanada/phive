import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ApplyForms } from "@/app/(site)/projects/[projectUrl]/apply/apply-forms";
import { TopImage } from "@/components/top-image";
import { api, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import { getProject } from "@/lib/projects";
import type { PartyPayload, Project } from "@/lib/types";

type Params = { params: Promise<{ projectUrl: string }> };

export const metadata: Metadata = { title: "Apply" };

export default async function ApplyPage({ params }: Params) {
  const user = await requireUser();
  const { projectUrl } = await params;

  if (user.role !== "Student") {
    redirect(`/projects/${projectUrl}`);
  }

  const project = await load(projectUrl);

  if (!project.is_open_hiring || project.status !== "Hiring") {
    redirect(`/projects/${projectUrl}`);
  }

  // Only the party you lead can be put forward, so a member-only student sees the
  // individual form alone.
  const { led } = await api<PartyPayload>("/party");

  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-[30px] pb-[30px] pt-[5px] xl:pb-[60px] xl:pt-5">
      <div className="mb-[25px]">
        <TopImage type={1} />

        <h1 className="mt-0 text-center text-[30px] font-extrabold">You Almost There!</h1>
        <p className="text-center text-[18px] leading-[1.65]">
          You need to fill up the form below about yourself / team who wants to applied to{" "}
          <strong>{project.title}.</strong>
        </p>
      </div>

      <ApplyForms
        projectUrl={projectUrl}
        applicantType={project.applicant_type}
        lookingFor={project.looking_for}
        party={led}
        tagname={user.tagname}
        defaultExpertise={user.expertise}
      />
    </main>
  );
}

async function load(projectUrl: string): Promise<Project> {
  try {
    return await getProject(projectUrl);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

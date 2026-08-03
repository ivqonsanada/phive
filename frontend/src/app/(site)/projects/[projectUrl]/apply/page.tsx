import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ApplyForms } from "@/app/(site)/projects/[projectUrl]/apply/apply-forms";
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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link
        href={`/projects/${projectUrl}`}
        className="mb-4 inline-block text-sm font-semibold text-navy hover:text-glow"
      >
        ← Back to the project
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-navy">Apply to {project.title}</h1>
      <p className="mb-8 text-sm text-ink/70">
        This project accepts <span className="font-semibold">{project.applicant_type}</span>{" "}
        applications.
      </p>

      <ApplyForms
        projectUrl={projectUrl}
        applicantType={project.applicant_type}
        lookingFor={project.looking_for}
        party={led}
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

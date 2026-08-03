import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateProject } from "@/app/actions/manage-projects";
import { ProjectForm } from "@/components/project-form";
import { api, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { Project } from "@/lib/types";

type Params = { params: Promise<{ projectUrl: string }> };

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: Params) {
  const user = await requireUser();

  if (user.role !== "Lecturer") {
    redirect("/dashboard");
  }

  const { projectUrl } = await params;
  const project = await load(projectUrl);

  // The action needs the slug; bind it so the form stays a plain (state, formData) shape.
  const action = updateProject.bind(null, projectUrl);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Edit project</h1>
          <p className="text-sm text-ink/70">
            Currently <span className="font-semibold">{project.status}</span>
          </p>
        </div>
        <Link href="/my/projects" className="text-sm font-semibold text-navy hover:text-glow">
          ← All projects
        </Link>
      </div>

      <ProjectForm action={action} project={project} />
    </main>
  );
}

/**
 * Read through the lecturer's own list rather than the public endpoint, which hides
 * drafts — the whole point of this page is editing them.
 */
async function load(projectUrl: string): Promise<Project> {
  try {
    const projects = await api<Project[]>("/my/projects");
    const project = projects.find((candidate) => candidate.project_url === projectUrl);

    if (!project) {
      notFound();
    }

    return project;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

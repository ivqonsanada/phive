import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createProject } from "@/app/actions/manage-projects";
import { ProjectForm } from "@/components/project-form";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const user = await requireUser();

  if (user.role !== "Lecturer") {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">New project</h1>
      <p className="mb-6 text-sm text-ink/70">
        Save it as a draft while you work on it — students only see it once you publish.
      </p>

      <ProjectForm action={createProject} />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProjectRow } from "@/app/(site)/my/projects/project-row";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { Project } from "@/lib/types";

export const metadata: Metadata = { title: "My projects" };

export default async function MyProjectsPage() {
  const user = await requireUser();

  if (user.role !== "Lecturer") {
    redirect("/dashboard");
  }

  const projects = await api<Project[]>("/my/projects");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">My projects</h1>
          <p className="text-sm text-ink/70">Drafts included — only you can see these.</p>
        </div>
        <Link
          href="/my/projects/new"
          className="rounded-lg bg-navy px-4 py-2.5 font-semibold text-white transition hover:bg-navy/90"
        >
          New project
        </Link>
      </header>

      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
          Nothing yet. Publish your first project and students can start applying.
        </p>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </ul>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProjectCard } from "@/components/project-card";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { Project } from "@/lib/types";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser();

  // Only students keep a wishlist; the API refuses the toggle for anyone else.
  if (user.role !== "Student") {
    redirect("/dashboard");
  }

  const { projects } = await api<{ projects: Project[] }>("/wishlist");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Wishlist</h1>
      <p className="mb-8 text-sm text-ink/70">
        Projects you starred. Unstarring one here removes it from the list.
      </p>

      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
          Nothing starred yet. Tap the ☆ on any project in{" "}
          <Link href="/explore" className="font-semibold text-navy hover:text-glow">
            explore
          </Link>{" "}
          to keep it here.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  );
}

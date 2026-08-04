import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProjectCard } from "@/components/project-card";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import { Icon } from "@/lib/icons";
import type { Project } from "@/lib/types";

export const metadata: Metadata = { title: "Wishlist" };

/**
 * The original showed this as a tab on your own profile rather than as its own page,
 * with the same card grid explore uses.
 */
export default async function WishlistPage() {
  const user = await requireUser();

  // Only students keep a wishlist; the API refuses the toggle for anyone else.
  if (user.role !== "Student") {
    redirect("/dashboard");
  }

  const { projects } = await api<{ projects: Project[] }>("/wishlist");

  return (
    <main className="mx-auto w-full max-w-[1090px] flex-1 px-[30px] pb-[30px] pt-[5px]">
      <div className="mb-7 flex flex-row items-center">
        <Icon icon="ant-design:star-filled" className="mr-2.5 size-[30px]" aria-hidden />
        <h1 className="text-[20px] font-extrabold uppercase xl:text-[36px]">Wishlist</h1>
      </div>

      {projects.length === 0 ? (
        <p className="text-[12px] leading-[1.65] xl:text-[14px]">
          Show your interest towards some projects :)
        </p>
      ) : (
        // The original's `.project--container`: the same responsive card grid explore
        // uses, so a starred project looks identical to where you starred it.
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
          {projects.map((project) => (
            <ProjectCard key={project.uuid} project={project} />
          ))}
        </div>
      )}
    </main>
  );
}

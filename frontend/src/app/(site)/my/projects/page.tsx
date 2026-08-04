import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProjectRow } from "@/app/(site)/my/projects/project-row";
import { btn } from "@/components/ui/button";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import { Icon } from "@/lib/icons";
import type { Project } from "@/lib/types";

export const metadata: Metadata = { title: "My Projects" };

export default async function MyProjectsPage() {
  const user = await requireUser();

  if (user.role !== "Lecturer") {
    redirect("/dashboard");
  }

  const projects = await api<Project[]>("/my/projects");

  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-[30px] pb-[30px] pt-[5px] xl:max-w-[820px]">
      <div className="mb-7 flex flex-row items-center justify-between gap-4">
        <div className="flex min-w-0 flex-row items-center">
          <Icon icon="simple-icons:polymerproject" className="mr-2.5 size-[30px]" aria-hidden />
          <h1 className="text-[20px] font-extrabold uppercase xl:text-[36px]">My Projects</h1>
        </div>

        <Link
          href="/my/projects/new"
          className={btn("blue", {
            size: "small",
            width: "w-auto shrink-0",
            extra: "px-4",
          })}
        >
          <Icon icon="ic:baseline-post-add" className="size-[18px]" aria-hidden />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-[12px] leading-[1.65] xl:text-[14px]">
          Nothing yet. Publish your first project and students can start applying.
        </p>
      ) : (
        <ul className="flex flex-col gap-[15px]">
          {projects.map((project) => (
            <ProjectRow key={project.uuid} project={project} />
          ))}
        </ul>
      )}
    </main>
  );
}

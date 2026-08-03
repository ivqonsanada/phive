"use client";

import { useActionState } from "react";

import { inviteToProject } from "@/app/actions/messages";
import { FormMessage } from "@/components/form";
import type { Project } from "@/lib/types";

export function InviteToProject({
  tagname,
  projects,
}: {
  tagname: string;
  projects: Project[];
}) {
  const [state, action, pending] = useActionState(
    inviteToProject.bind(null, tagname),
    undefined,
  );

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <select
        name="project_url"
        aria-label="Project to invite them to"
        className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-navy"
      >
        {projects.map((project) => (
          <option key={project.id} value={project.project_url ?? ""}>
            {project.title ?? "Untitled draft"}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:opacity-60"
      >
        {pending ? "Inviting…" : "Invite to project"}
      </button>

      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}
    </form>
  );
}

import Link from "next/link";

import { InviteToProject } from "@/app/(site)/u/[tagname]/invite-to-project";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/dal";
import type { Project, User } from "@/lib/types";

/**
 * What the signed-in viewer can do with this profile. Guests and people looking at
 * their own profile get nothing.
 */
export async function ProfileActions({ profile }: { profile: User }) {
  const viewer = await getCurrentUser();

  if (!viewer || viewer.id === profile.id) {
    return null;
  }

  const canInvite = viewer.role === "Lecturer" && profile.role === "Student";
  const projects = canInvite ? await invitableProjects() : [];

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Link
        href={`/messages/${profile.tagname}`}
        className="rounded-lg border border-navy/15 px-4 py-2 text-sm font-semibold text-navy transition hover:border-navy"
      >
        Message
      </Link>

      {canInvite && projects.length > 0 && (
        <InviteToProject tagname={profile.tagname} projects={projects} />
      )}
    </div>
  );
}

/**
 * Only projects still open can take a new person.
 */
async function invitableProjects(): Promise<Project[]> {
  const projects = await api<Project[]>("/my/projects");

  return projects.filter(
    (project) => project.status === "Hiring" || project.status === "Draft",
  );
}

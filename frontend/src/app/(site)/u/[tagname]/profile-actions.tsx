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

  if (!viewer || viewer.uuid === profile.uuid) {
    return null;
  }

  const canInvite = viewer.role === "Lecturer" && profile.role === "Student";
  const projects = canInvite ? await invitableProjects() : [];

  return (
    <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <Link
        href={`/messages/${profile.tagname}`}
        className="flex h-[45px] w-[150px] items-center justify-center rounded-[10px] border-[1.5px] border-navy bg-white text-[14px] font-bold text-navy transition hover:bg-mist xl:w-[185px] xl:text-[18px]"
      >
        Direct Message
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

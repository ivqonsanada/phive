import type { Metadata } from "next";

import { ExperienceManager } from "@/app/(site)/settings/experience-manager";
import { MediaManager } from "@/app/(site)/settings/media-manager";
import { ProfileForm } from "@/app/(site)/settings/profile-form";
import { TopImage } from "@/components/top-image";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { User } from "@/lib/types";

export const metadata: Metadata = { title: "Settings" };

/**
 * The original split this in two: `/profile/edit` held everything about you across a
 * two-step wizard, and `/settings` held only a password change. They are one page here.
 * A wizard is worth its cost when it gates something — this one only hid half a form
 * behind a Next button, and neither step could be saved without the other loading first.
 */
export default async function SettingsPage() {
  await requireUser();

  // Re-read with relations: the DAL's cached user is the lightweight session copy.
  const user = await api<User>("/user");

  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-[30px] pb-[30px] pt-[5px]">
      <TopImage type={1} />

      <section className="mb-10">
        <MediaManager user={user} />
      </section>

      <section className="mb-10">
        <h2 className="mb-[25px] text-[24px] font-extrabold xl:mb-10">Edit Profile</h2>
        <ProfileForm user={user} />
      </section>

      {user.role === "Student" && (
        <section>
          <h2 className="mb-[25px] text-[24px] font-extrabold xl:mb-10">Experience</h2>
          <ExperienceManager experiences={user.experiences ?? []} />
        </section>
      )}
    </main>
  );
}

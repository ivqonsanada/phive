import type { Metadata } from "next";

import { ExperienceManager } from "@/app/(site)/settings/experience-manager";
import { MediaManager } from "@/app/(site)/settings/media-manager";
import { ProfileForm } from "@/app/(site)/settings/profile-form";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { User } from "@/lib/types";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireUser();

  // Re-read with relations: the DAL's cached user is the lightweight session copy.
  const user = await api<User>("/user");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Settings</h1>
      <p className="mb-8 text-sm text-ink/70">
        This is what other people see on your public profile.
      </p>

      <section className="mb-10">
        <h2 className="mb-4 font-semibold text-navy">Photo and CV</h2>
        <MediaManager user={user} />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-semibold text-navy">Profile</h2>
        <ProfileForm user={user} />
      </section>

      {user.role === "Student" && (
        <section>
          <h2 className="mb-4 font-semibold text-navy">Experience</h2>
          <ExperienceManager experiences={user.experiences ?? []} />
        </section>
      )}
    </main>
  );
}

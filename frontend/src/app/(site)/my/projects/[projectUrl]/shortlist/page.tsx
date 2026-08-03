import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ShortlistForm } from "@/app/(site)/my/projects/[projectUrl]/shortlist/shortlist-form";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { Expertise, UserSummary } from "@/lib/types";

type Params = { params: Promise<{ projectUrl: string }> };

export const metadata: Metadata = { title: "Applicants" };

export interface IndividualApplication {
  uuid: string;
  status: string;
  expertise: Expertise;
  self_describe: string | null;
  apply_reason: string | null;
  user: UserSummary;
}

export interface TeamApplication {
  uuid: string;
  status: string;
  self_describe: string | null;
  apply_reason: string | null;
  leader: UserSummary;
  members: { expertise: Expertise | null; user: UserSummary }[];
}

export default async function ShortlistPage({ params }: Params) {
  const user = await requireUser();
  const { projectUrl } = await params;

  if (user.role !== "Lecturer") {
    redirect("/dashboard");
  }

  const { individuals, teams } = await api<{
    individuals: IndividualApplication[];
    teams: TeamApplication[];
  }>(`/my/projects/${encodeURIComponent(projectUrl)}/shortlist`);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/my/projects" className="mb-4 inline-block text-sm font-semibold text-navy hover:text-glow">
        ← All projects
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-navy">Applicants</h1>
      <p className="mb-8 text-sm text-ink/70">
        Pick who goes through. They&apos;ll be asked to confirm before you can start.
      </p>

      {individuals.length === 0 && teams.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
          Nobody has applied yet.
        </p>
      ) : (
        <ShortlistForm projectUrl={projectUrl} individuals={individuals} teams={teams} />
      )}
    </main>
  );
}

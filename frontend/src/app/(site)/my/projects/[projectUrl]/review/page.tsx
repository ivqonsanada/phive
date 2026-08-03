import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ReviewForm } from "@/app/(site)/my/projects/[projectUrl]/review/review-form";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { Expertise, ProjectReview, UserSummary } from "@/lib/types";

type Params = { params: Promise<{ projectUrl: string }> };

export const metadata: Metadata = { title: "Review project" };

export interface Participant {
  member_id: number;
  expertise: Expertise | null;
  score: string | null;
  assessment: string | null;
  user: UserSummary;
}

export default async function ReviewPage({ params }: Params) {
  const user = await requireUser();
  const { projectUrl } = await params;

  if (user.role !== "Lecturer") {
    redirect("/dashboard");
  }

  const { participants } = await api<{
    participants: Participant[];
    review: ProjectReview | null;
  }>(`/my/projects/${encodeURIComponent(projectUrl)}/review`);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/my/projects" className="mb-4 inline-block text-sm font-semibold text-navy hover:text-glow">
        ← All projects
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-navy">Review and close out</h1>
      <p className="mb-8 text-sm text-ink/70">
        Scores are out of five. Leaderboard points come from the overall score, each
        person&apos;s score, and the project&apos;s difficulty — so this is what decides
        what everyone earns.
      </p>

      {participants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
          This project has no team yet, so there is nothing to review.
        </p>
      ) : (
        <ReviewForm projectUrl={projectUrl} participants={participants} />
      )}
    </main>
  );
}

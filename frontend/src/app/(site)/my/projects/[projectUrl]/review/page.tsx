import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReviewForm } from "@/app/(site)/my/projects/[projectUrl]/review/review-form";
import { Thumbnail } from "@/components/avatar";
import { TopImage } from "@/components/top-image";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import { getProject } from "@/lib/projects";
import type { Expertise, ProjectReview, UserSummary } from "@/lib/types";

type Params = { params: Promise<{ projectUrl: string }> };

export const metadata: Metadata = { title: "Review Project" };

export interface Participant {
  member_uuid: string;
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

  const [project, { participants }] = await Promise.all([
    getProject(projectUrl),
    api<{ participants: Participant[]; review: ProjectReview | null }>(
      `/my/projects/${encodeURIComponent(projectUrl)}/review`,
    ),
  ]);

  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-[30px] pb-[30px] pt-[5px] xl:mt-[30px]">
      <TopImage type={2} />

      <h2 className="text-center text-[30px] font-extrabold xl:text-[36px]">Review Project</h2>

      <div className="mb-[30px] flex flex-col items-center gap-5">
        {/* The thumbnail is a circle here, and only here — the original cropped it to
            a portrait for the review page. */}
        <Thumbnail
          src={project.thumbnail}
          width={200}
          height={200}
          className="mx-auto mb-[30px] block size-[125px] rounded-full xl:mb-0 xl:size-[200px]"
          priority
        />
        <h3 className="max-w-[250px] text-center text-[24px] font-bold xl:max-w-none xl:text-[64px] xl:font-extrabold">
          {project.title}
        </h3>
      </div>

      {participants.length === 0 ? (
        <p className="text-[12px] leading-[1.65] xl:text-[14px]">
          This project has no team yet, so there is nothing to review.
        </p>
      ) : (
        <>
          {/* Not in the original, and worth saying plainly: this form is what decides
              the points everyone walks away with. */}
          <p className="mb-6 text-[12px] leading-[1.65] xl:text-[14px]">
            Scores are out of five. Leaderboard points come from the overall score, each
            person&rsquo;s score and the project&rsquo;s difficulty.
          </p>
          <ReviewForm projectUrl={projectUrl} participants={participants} />
        </>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ShortlistForm } from "@/app/(site)/my/projects/[projectUrl]/shortlist/shortlist-form";
import { Thumbnail } from "@/components/avatar";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import { getProject } from "@/lib/projects";
import type { Expertise, UserSummary } from "@/lib/types";

type Params = { params: Promise<{ projectUrl: string }> };

export const metadata: Metadata = { title: "Shortlist" };

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

  const [project, { individuals, teams }] = await Promise.all([
    getProject(projectUrl),
    api<{ individuals: IndividualApplication[]; teams: TeamApplication[] }>(
      `/my/projects/${encodeURIComponent(projectUrl)}/shortlist`,
    ),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1070px] flex-1 px-[30px] pb-[30px] pt-[5px]">
      {/* `.shorlisted-top__container`: on desktop the image comes first in the source
          and is reversed to the right, so the outlined title can overlap it. */}
      <div className="flex flex-col xl:mb-[58px] xl:flex-row-reverse">
        <div className="mt-[25px] xl:w-[509px]">
          <Thumbnail
            src={project.thumbnail}
            width={509}
            height={374}
            className="h-[220px] w-full rounded-[10px] sm:h-[260px] xl:h-[374px]"
            priority
          />
        </div>

        <div className="flex flex-col xl:justify-end">
          <h1 className="text-outline mb-[15px] mt-0 text-center text-[28px] font-extrabold uppercase sm:text-[36px] md:mt-5 xl:z-[1] xl:m-0 xl:max-w-[768px] xl:mr-[-140px] xl:text-left xl:text-[96px] xl:leading-[80px]">
            {project.title}
          </h1>

          <hr className="mb-2.5 border-navy xl:hidden" />

          <h3 className="mt-[30px] text-center text-[24px] font-extrabold xl:text-left xl:text-[36px]">
            Shortlisted Student
          </h3>
        </div>
      </div>

      <hr className="hidden border-navy xl:block" />

      <ShortlistForm projectUrl={projectUrl} individuals={individuals} teams={teams} />
    </main>
  );
}

import type { Metadata } from "next";

import type { Box } from "@/app/(site)/project-box/box-item";
import { BoxList } from "@/app/(site)/project-box/box-list";
import { UserInfoCard } from "@/components/user-info-card";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Project Box" };

export default async function ProjectBoxPage() {
  const user = await requireUser();
  const { boxes } = await api<{ boxes: Box[] }>("/project-box");

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-[30px] pb-[30px] pt-[5px] xl:mb-5 xl:max-w-[1125px]">
      <h2 className="mb-4 hidden text-[36px] font-extrabold uppercase xl:block">Project Box</h2>

      <div className="flex w-full max-w-[720px] flex-col xl:max-w-[1125px] xl:flex-row xl:justify-center xl:gap-6">
        <UserInfoCard user={user} />
        <BoxList boxes={boxes} role={user.role} />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PartyPanel } from "@/app/(site)/party/party-panel";
import { UserInfoCard } from "@/components/user-info-card";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { PartyPayload } from "@/lib/types";

export const metadata: Metadata = { title: "Party" };

export default async function PartyPage() {
  const user = await requireUser();

  // A lecturer posts projects and hires; they have no party. The original gated this
  // route the same way, with a `student` middleware.
  if (user.role !== "Student") {
    redirect("/dashboard");
  }

  const party = await api<PartyPayload>("/party");

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-[30px] pb-[30px] pt-[5px] xl:mb-5 xl:max-w-[1125px]">
      <h2 className="mb-4 hidden text-[36px] font-extrabold uppercase xl:block">Party</h2>

      <div className="flex w-full max-w-[720px] flex-1 flex-col xl:max-w-[1125px] xl:flex-row xl:justify-start xl:gap-6">
        <UserInfoCard user={user} />
        <PartyPanel party={party} />
      </div>
    </main>
  );
}

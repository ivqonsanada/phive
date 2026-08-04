import type { Metadata } from "next";

import { InboxList } from "@/app/(site)/inbox/inbox-list";
import { UserInfoCard } from "@/components/user-info-card";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { InboxPayload } from "@/lib/types";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage() {
  const user = await requireUser();

  const { items } = await api<InboxPayload>("/inbox");

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-[30px] pb-[30px] pt-[5px] xl:mb-5 xl:max-w-[1125px]">
      {/* The desktop-only page title. On a phone the "Inbox" heading over the list is
          the only one, which is why that one is not hidden here. */}
      <h2 className="mb-4 hidden text-[36px] font-extrabold uppercase xl:block">Inbox</h2>

      <div className="flex w-full max-w-[720px] flex-col xl:max-w-[1125px] xl:flex-row xl:justify-center xl:gap-6">
        <UserInfoCard user={user} />
        <InboxList items={items} role={user.role} />
      </div>
    </main>
  );
}

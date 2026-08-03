"use server";

import { revalidatePath } from "next/cache";

import { api } from "@/lib/api";

export async function respondToInvitation(uuid: string, accept: boolean): Promise<void> {
  await api(`/inbox/${uuid}/respond`, { method: "POST", body: { accept } });

  revalidatePath("/inbox");
  revalidatePath("/party");
  // The header shows an unread badge.
  revalidatePath("/", "layout");
}

export async function markInboxRead(uuid: string): Promise<void> {
  await api(`/inbox/${uuid}/read`, { method: "POST" });

  revalidatePath("/inbox");
  revalidatePath("/", "layout");
}

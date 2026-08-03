"use server";

import { revalidatePath } from "next/cache";

import { api } from "@/lib/api";

export async function respondToInvitation(id: number, accept: boolean): Promise<void> {
  await api(`/inbox/${id}/respond`, { method: "POST", body: { accept } });

  revalidatePath("/inbox");
  revalidatePath("/party");
  // The header shows an unread badge.
  revalidatePath("/", "layout");
}

export async function markInboxRead(id: number): Promise<void> {
  await api(`/inbox/${id}/read`, { method: "POST" });

  revalidatePath("/inbox");
  revalidatePath("/", "layout");
}

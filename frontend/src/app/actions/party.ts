"use server";

import { revalidatePath } from "next/cache";

import { api, toFormState } from "@/lib/api";
import type { FormState } from "@/lib/types";

export async function inviteToParty(
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const tagname = String(formData.get("tagname") ?? "")
    .trim()
    .replace(/^@/, "");

  if (!tagname) {
    return { message: "Enter the handle of the student you want to invite." };
  }

  try {
    const { message } = await api<{ message: string }>(
      `/users/${encodeURIComponent(tagname)}/invite/party`,
      { method: "POST" },
    );

    revalidatePath("/party");

    return { success: message };
  } catch (error) {
    return toFormState(error);
  }
}

export async function kickFromParty(tagname: string): Promise<void> {
  await api(`/party/members/${encodeURIComponent(tagname)}`, { method: "DELETE" });

  revalidatePath("/party");
}

export async function leaveParty(teamUuid: string): Promise<void> {
  await api(`/party/${teamUuid}/leave`, { method: "DELETE" });

  revalidatePath("/party");
}

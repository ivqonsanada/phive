"use server";

import { revalidatePath } from "next/cache";

import { api, toFormState } from "@/lib/api";
import type { FormState } from "@/lib/types";

export async function sendMessage(
  tagname: string,
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const message = String(formData.get("message") ?? "").trim();

  if (!message) {
    return { message: "Write something first." };
  }

  try {
    await api(`/messages/${encodeURIComponent(tagname)}`, {
      method: "POST",
      body: { message },
    });
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath(`/messages/${tagname}`);
  revalidatePath("/messages");
  // The header badge counts unread messages too.
  revalidatePath("/", "layout");

  return { success: "Sent." };
}

export async function inviteToProject(
  tagname: string,
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const projectUrl = String(formData.get("project_url") ?? "");

  if (!projectUrl) {
    return { message: "Pick a project first." };
  }

  try {
    const { message } = await api<{ message: string }>(
      `/my/projects/${encodeURIComponent(projectUrl)}/invite/${encodeURIComponent(tagname)}`,
      { method: "POST" },
    );

    revalidatePath(`/u/${tagname}`);

    return { success: message };
  } catch (error) {
    return toFormState(error);
  }
}

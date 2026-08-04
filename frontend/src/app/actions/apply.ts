"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, toFormState } from "@/lib/api";
import { parseTeamApplicants } from "@/lib/form-parsing";
import type { FormState } from "@/lib/types";

export async function applyAsIndividual(
  projectUrl: string,
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  try {
    await api(`/projects/${encodeURIComponent(projectUrl)}/apply/individual`, {
      method: "POST",
      body: {
        expertise: formData.get("expertise"),
        self_describe: formData.get("self_describe") || null,
        apply_reason: formData.get("apply_reason") || null,
      },
    });
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath(`/projects/${projectUrl}`);
  redirect(`/projects/${projectUrl}?applied=1`);
}

/**
 * The team form posts one `expertise[<member id>]` field per party member; whoever
 * has an expertise selected is included in the application.
 */
export async function applyAsTeam(
  projectUrl: string,
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const members = parseTeamApplicants(formData);

  if (members.length === 0) {
    return { message: "Pick an expertise for at least one party member." };
  }

  try {
    await api(`/projects/${encodeURIComponent(projectUrl)}/apply/team`, {
      method: "POST",
      body: {
        members,
        self_describe: formData.get("self_describe") || null,
        apply_reason: formData.get("apply_reason") || null,
      },
    });
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath(`/projects/${projectUrl}`);
  redirect(`/projects/${projectUrl}?applied=1`);
}

export async function withdrawApplication(projectUrl: string): Promise<void> {
  await api(`/projects/${encodeURIComponent(projectUrl)}/apply`, { method: "DELETE" });

  revalidatePath(`/projects/${projectUrl}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, toFormState } from "@/lib/api";
import { parseReviewParticipants } from "@/lib/form-parsing";
import type { FormState } from "@/lib/types";

export async function confirmSeat(boxUuid: string, accept: boolean): Promise<void> {
  await api(`/project-box/${boxUuid}/confirm`, { method: "POST", body: { accept } });

  revalidatePath("/project-box");
}

export async function shortlistApplicants(
  projectUrl: string,
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const individual_uuids = formData.getAll("individual_uuids").map(String).filter(Boolean);
  const team_uuids = formData.getAll("team_uuids").map(String).filter(Boolean);

  try {
    await api(`/my/projects/${encodeURIComponent(projectUrl)}/shortlist`, {
      method: "POST",
      body: { individual_uuids, team_uuids },
    });
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath(`/my/projects/${projectUrl}/shortlist`);
  revalidatePath("/my/projects");

  return { success: "Applicants shortlisted. They now need to confirm." };
}

export async function startProject(projectUrl: string): Promise<void> {
  await api(`/my/projects/${encodeURIComponent(projectUrl)}/start`, { method: "POST" });

  revalidatePath("/my/projects");
  revalidatePath(`/projects/${projectUrl}`);
}

export async function submitReview(
  projectUrl: string,
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const participants = parseReviewParticipants(formData);

  try {
    await api(`/my/projects/${encodeURIComponent(projectUrl)}/review`, {
      method: "POST",
      body: {
        overall_score: formData.get("overall_score"),
        overall_review: formData.get("overall_review") || null,
        project_result: formData.get("project_result") || null,
        participants,
      },
    });
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath("/my/projects");
  redirect("/my/projects");
}

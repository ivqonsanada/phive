"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, toFormState } from "@/lib/api";
import type { FormState } from "@/lib/types";

export async function confirmSeat(boxId: number, accept: boolean): Promise<void> {
  await api(`/project-box/${boxId}/confirm`, { method: "POST", body: { accept } });

  revalidatePath("/project-box");
}

export async function shortlistApplicants(
  projectUrl: string,
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const individual_ids = formData.getAll("individual_ids").map(Number).filter(Boolean);
  const team_ids = formData.getAll("team_ids").map(Number).filter(Boolean);

  try {
    await api(`/my/projects/${encodeURIComponent(projectUrl)}/shortlist`, {
      method: "POST",
      body: { individual_ids, team_ids },
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
  // One score/assessment field per participant, keyed by member id.
  const participants: Record<number, Record<string, string>> = {};

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^participants\[(\d+)]\[(\w+)]$/);

    if (match && typeof value === "string") {
      const id = Number(match[1]);
      participants[id] ??= {};
      participants[id][match[2]] = value;
    }
  }

  try {
    await api(`/my/projects/${encodeURIComponent(projectUrl)}/review`, {
      method: "POST",
      body: {
        overall_score: formData.get("overall_score"),
        overall_review: formData.get("overall_review") || null,
        project_result: formData.get("project_result") || null,
        participants: Object.entries(participants).map(([id, fields]) => ({
          member_id: Number(id),
          expertise: fields.expertise,
          score: fields.score,
          assessment: fields.assessment || null,
        })),
      },
    });
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath("/my/projects");
  redirect("/my/projects");
}

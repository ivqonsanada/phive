"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, toFormState } from "@/lib/api";
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
  // One score/assessment field per participant, keyed by member id.
  const participants: Record<string, Record<string, string>> = {};

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^participants\[([\w-]+)]\[(\w+)]$/);

    if (match && typeof value === "string") {
      const id = match[1];
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
          member_uuid: id,
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

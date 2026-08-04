"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, toFormState } from "@/lib/api";
import { parseLines } from "@/lib/form-parsing";
import type { FormState, Project } from "@/lib/types";

/**
 * The create and edit forms post the same fields, so they share one payload
 * builder. Checkboxes are absent from FormData when unticked, hence the coercion.
 */
function payload(formData: FormData, publish: boolean) {
  const list = (name: string) => parseLines(formData.get(name));

  return {
    publish,
    title: formData.get("title"),
    description: formData.get("description"),
    applicant_type: formData.get("applicant_type"),
    max_person: formData.get("max_person"),
    level_applicant: formData.get("level_applicant"),
    ui_ux_designer: formData.get("ui_ux_designer") === "on",
    front_end_engineer: formData.get("front_end_engineer") === "on",
    back_end_engineer: formData.get("back_end_engineer") === "on",
    data_expert: formData.get("data_expert") === "on",
    certificate: formData.get("certificate") === "on",
    salary: formData.get("salary") === "on",
    currency: formData.get("currency") || "IDR",
    salary_amount: formData.get("salary_amount") || 0,
    payment_type: formData.get("payment_type") || "person",
    skills: list("skills"),
    requirements: list("requirements"),
  };
}

export async function createProject(
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const publish = formData.get("intent") === "publish";
  let project: Project;

  try {
    ({ project } = await api<{ project: Project }>("/my/projects", {
      method: "POST",
      body: payload(formData, publish),
    }));
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath("/my/projects");
  redirect(`/my/projects/${project.project_url}/edit`);
}

export async function updateProject(
  projectUrl: string,
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const publish = formData.get("intent") === "publish";

  try {
    await api(`/my/projects/${encodeURIComponent(projectUrl)}`, {
      method: "PATCH",
      body: payload(formData, publish),
    });
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath("/my/projects");
  revalidatePath(`/my/projects/${projectUrl}/edit`);
  revalidatePath(`/projects/${projectUrl}`);

  return { success: publish ? "Project published." : "Changes saved." };
}

export async function publishProject(projectUrl: string): Promise<void> {
  await api(`/my/projects/${encodeURIComponent(projectUrl)}/publish`, { method: "POST" });

  revalidatePath("/my/projects");
}

export async function closeApplications(projectUrl: string): Promise<void> {
  await api(`/my/projects/${encodeURIComponent(projectUrl)}/close`, { method: "POST" });

  revalidatePath("/my/projects");
}

export async function uploadThumbnail(
  projectUrl: string,
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { message: "Choose an image first." };
  }

  const body = new FormData();
  body.set("file", file);

  try {
    await api(`/my/projects/${encodeURIComponent(projectUrl)}/thumbnail`, {
      method: "POST",
      body,
      multipart: true,
    });
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath(`/my/projects/${projectUrl}/edit`);
  revalidatePath(`/projects/${projectUrl}`);

  return { success: "Thumbnail updated." };
}

export async function removeThumbnail(projectUrl: string): Promise<void> {
  await api(`/my/projects/${encodeURIComponent(projectUrl)}/thumbnail`, { method: "DELETE" });

  revalidatePath(`/my/projects/${projectUrl}/edit`);
  revalidatePath(`/projects/${projectUrl}`);
}

export async function withdrawProject(projectUrl: string): Promise<void> {
  await api(`/my/projects/${encodeURIComponent(projectUrl)}`, { method: "DELETE" });

  revalidatePath("/my/projects");
  redirect("/my/projects");
}

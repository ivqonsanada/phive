"use server";

import { revalidatePath } from "next/cache";

import { api, toFormState } from "@/lib/api";
import type { FormState, User } from "@/lib/types";

function revalidateProfile(tagname?: string) {
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  if (tagname) revalidatePath(`/u/${tagname}`);
}

export async function updateProfile(
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };

  try {
    const { user } = await api<{ user: User }>("/settings/profile", {
      method: "PATCH",
      body: {
        first_name: text("first_name"),
        last_name: text("last_name"),
        tagname: text("tagname"),
        identity_number: text("identity_number") || null,
        // The API treats "" as an explicit clear for nullable text fields.
        expertise: text("expertise") || null,
        university: text("university") || null,
        faculty: text("faculty") || null,
        major: text("major") || null,
        location: text("location") || null,
        biography: text("biography") || null,
        is_open_hired: formData.get("is_open_hired") === "on",
        behance: text("behance") || null,
        github: text("github") || null,
        linkedin: text("linkedin") || null,
        dribbble: text("dribbble") || null,
        website: text("website") || null,
        skills: text("skills")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      },
    });

    revalidateProfile(user.tagname);

    return { success: "Profile saved." };
  } catch (error) {
    return toFormState(error);
  }
}

/**
 * Avatar and CV share one action; `field` picks the endpoint. The file is forwarded
 * as multipart rather than JSON, so this bypasses the JSON body helper.
 */
export async function uploadMedia(
  field: "avatar" | "cv",
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { message: "Choose a file first." };
  }

  const body = new FormData();
  body.set("file", file);

  try {
    await api(`/settings/${field}`, { method: "POST", body, multipart: true });
  } catch (error) {
    return toFormState(error);
  }

  revalidateProfile();

  return { success: field === "avatar" ? "Avatar updated." : "CV updated." };
}

export async function removeMedia(field: "avatar" | "cv"): Promise<void> {
  await api(`/settings/${field}`, { method: "DELETE" });

  revalidateProfile();
}

export async function addExperience(
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  try {
    await api("/settings/experiences", {
      method: "POST",
      body: {
        project_name: formData.get("project_name"),
        project_role: formData.get("project_role"),
        start_date: formData.get("start_date"),
        end_date: formData.get("end_date") || null,
      },
    });
  } catch (error) {
    return toFormState(error);
  }

  revalidateProfile();

  return { success: "Experience added." };
}

export async function removeExperience(id: number): Promise<void> {
  await api(`/settings/experiences/${id}`, { method: "DELETE" });

  revalidateProfile();
}

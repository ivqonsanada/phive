"use server";

import { revalidatePath } from "next/cache";

import { api, toFormState } from "@/lib/api";
import { parseLines } from "@/lib/form-parsing";
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

  /**
   * Only send what the form actually rendered.
   *
   * The endpoint is a partial update — every rule is `sometimes` — but this action
   * used to send all eighteen keys regardless, so any form showing a subset would
   * send `null` for the rest and clear them. The newcomer flow submits three or four
   * fields at a time, which would have wiped a profile on step one.
   */
  const body: Record<string, unknown> = {};

  const include = (name: string, value: unknown) => {
    if (formData.has(name)) {
      body[name] = value;
    }
  };

  const required = (name: string) => include(name, text(name));
  // The API treats "" as an explicit clear for nullable text fields.
  const nullable = (name: string) => include(name, text(name) || null);

  required("first_name");
  required("last_name");
  required("tagname");

  for (const name of [
    "identity_number",
    "expertise",
    "university",
    "faculty",
    "major",
    "location",
    "biography",
    "behance",
    "github",
    "linkedin",
    "dribbble",
    "website",
  ]) {
    nullable(name);
  }

  // An unchecked checkbox submits nothing at all, so a form that offers this pairs it
  // with a hidden "off" under the same name. Presence therefore means the form owns
  // the field; the checkbox itself only adds a second value when it is ticked.
  include("is_open_hired", formData.getAll("is_open_hired").includes("on"));
  include("skills", parseLines(text("skills")));

  try {
    const { user } = await api<{ user: User }>("/settings/profile", {
      method: "PATCH",
      body,
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

export async function removeExperience(uuid: string): Promise<void> {
  await api(`/settings/experiences/${uuid}`, { method: "DELETE" });

  revalidateProfile();
}

/**
 * Change the password of the signed-in user.
 *
 * The API drops every other token on success, so anyone who had this account open
 * elsewhere is signed out — which is the point of changing a password. The device
 * doing the changing keeps its session.
 */
export async function changePassword(
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  try {
    await api("/settings/password", {
      method: "PATCH",
      body: {
        current_password: formData.get("current_password"),
        password: formData.get("password"),
        password_confirmation: formData.get("password_confirmation"),
      },
    });
  } catch (error) {
    return toFormState(error);
  }

  return { success: "Password updated. Any other devices have been signed out." };
}

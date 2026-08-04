"use server";

import { redirect } from "next/navigation";

import { api, toFormState } from "@/lib/api";
import { createSession, deleteSession } from "@/lib/session";
import type { AuthPayload, FormState } from "@/lib/types";

export async function login(_state: FormState | undefined, formData: FormData): Promise<FormState> {
  try {
    const { token } = await api<AuthPayload>("/login", {
      method: "POST",
      anonymous: true,
      body: {
        email: formData.get("email"),
        password: formData.get("password"),
        device_name: "phive-web",
      },
    });

    await createSession(token);
  } catch (error) {
    return toFormState(error);
  }

  // redirect() throws, so it has to sit outside the try block.
  redirect("/dashboard");
}

export async function register(
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  try {
    const { token } = await api<AuthPayload>("/register", {
      method: "POST",
      anonymous: true,
      body: {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        role: formData.get("role"),
        email: formData.get("email"),
        password: formData.get("password"),
        password_confirmation: formData.get("password_confirmation"),
      },
    });

    await createSession(token);
  } catch (error) {
    return toFormState(error);
  }

  // Straight into the walkthrough, as the original did. A brand-new account has a
  // name and nothing else, and /dashboard would show a profile card with four blank
  // lines in it and no hint that filling them in is what happens next.
  redirect("/newcomer/1");
}

export async function logout(): Promise<void> {
  // Revoke server-side first; if that fails the local cookie still has to go.
  await api("/logout", { method: "POST" }).catch(() => undefined);
  await deleteSession();

  redirect("/login");
}

export async function requestPasswordReset(
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  try {
    const { message } = await api<{ message: string }>("/password/email", {
      method: "POST",
      anonymous: true,
      body: { email: formData.get("email") },
    });

    return { success: message };
  } catch (error) {
    return toFormState(error);
  }
}

export async function resetPassword(
  _state: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  try {
    await api("/password/reset", {
      method: "POST",
      anonymous: true,
      body: {
        token: formData.get("token"),
        email: formData.get("email"),
        password: formData.get("password"),
        password_confirmation: formData.get("password_confirmation"),
      },
    });
  } catch (error) {
    return toFormState(error);
  }

  redirect("/login?reset=1");
}

export async function resendVerificationEmail(_state?: FormState): Promise<FormState> {
  try {
    const { message } = await api<{ message: string }>("/email/resend", { method: "POST" });

    return { success: message };
  } catch (error) {
    return toFormState(error);
  }
}

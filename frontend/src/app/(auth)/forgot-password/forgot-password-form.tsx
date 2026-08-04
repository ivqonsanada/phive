"use client";

import { useActionState } from "react";

import { requestPasswordReset } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        errors={state?.errors}
      />

      <SubmitButton>Send reset link</SubmitButton>
    </form>
  );
}

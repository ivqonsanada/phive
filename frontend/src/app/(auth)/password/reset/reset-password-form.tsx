"use client";

import { useActionState } from "react";

import { resetPassword } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [state, action] = useActionState(resetPassword, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />

      <Field label="Email" name="email_display" type="email" value={email} disabled readOnly />
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.errors}
      />
      <Field
        label="Confirm new password"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.errors}
      />

      <SubmitButton>Set new password</SubmitButton>
    </form>
  );
}

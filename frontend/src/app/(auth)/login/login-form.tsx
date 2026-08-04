"use client";

import { useActionState } from "react";

import { login } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function LoginForm({ justResetPassword }: { justResetPassword: boolean }) {
  const [state, action] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      {justResetPassword && (
        <FormMessage tone="success">Password updated — sign in with your new one.</FormMessage>
      )}
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <Field
        label="Email"
        name="email"
        variant="accent"
        type="email"
        autoComplete="email"
        required
        errors={state?.errors}
      />
      <Field
        label="Password"
        name="password"
        variant="accent"
        type="password"
        autoComplete="current-password"
        required
        errors={state?.errors}
      />

      {/* The original kept a Remember Me next to the fields; the forgot-password
          link lives below the form rather than beside it. */}
      <label className="flex items-center gap-2 text-[13px] font-bold text-ink">
        <input
          type="checkbox"
          name="remember"
          className="size-[18px] rounded border-2 border-navy accent-navy"
        />
        Remember Me
      </label>

      <SubmitButton>Sign In</SubmitButton>
    </form>
  );
}

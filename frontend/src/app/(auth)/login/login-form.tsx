"use client";

import Link from "next/link";
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
        type="email"
        autoComplete="email"
        required
        errors={state?.errors}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        errors={state?.errors}
      />

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm text-ink/70 hover:text-glow">
          Forgot your password?
        </Link>
      </div>

      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}

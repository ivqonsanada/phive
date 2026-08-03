"use client";

import { useActionState, useState } from "react";

import { register } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import type { UserRole } from "@/lib/types";

const ROLES: { value: UserRole; label: string; hint: string }[] = [
  { value: "Student", label: "Student", hint: "Apply to projects, alone or with a party." },
  { value: "Lecturer", label: "Lecturer", hint: "Publish projects and hire students." },
];

export function RegisterForm() {
  const [state, action] = useActionState(register, undefined);
  const [role, setRole] = useState<UserRole>("Student");

  return (
    <form action={action} className="space-y-4">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-navy">I am a…</legend>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                role === option.value
                  ? "border-navy bg-navy/5"
                  : "border-navy/15 hover:border-navy/40"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                className="sr-only"
              />
              <span className="block font-semibold text-navy">{option.label}</span>
              <span className="mt-0.5 block text-xs text-ink/60">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" name="first_name" autoComplete="given-name" required errors={state?.errors} />
        <Field label="Last name" name="last_name" autoComplete="family-name" errors={state?.errors} />
      </div>

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
        autoComplete="new-password"
        required
        errors={state?.errors}
      />
      <Field
        label="Confirm password"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.errors}
      />

      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

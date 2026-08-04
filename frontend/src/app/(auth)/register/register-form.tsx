"use client";

import { useActionState } from "react";

import { register } from "@/app/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import type { UserRole } from "@/lib/types";

/**
 * The role lives in the surrounding view because it also drives the collage, so it
 * arrives here as a prop and rides along as a hidden field.
 */
export function RegisterForm({ role }: { role: UserRole }) {
  const [state, action] = useActionState(register, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <input type="hidden" name="role" value={role} />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="First Name"
          name="first_name"
          placeholder="e.g., John"
          autoComplete="given-name"
          required
          errors={state?.errors}
        />
        <Field
          label="Last Name"
          name="last_name"
          placeholder="e.g., Doe"
          autoComplete="family-name"
          errors={state?.errors}
        />
      </div>

      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="e.g., johndoe@example.ac.id"
        autoComplete="email"
        required
        errors={state?.errors}
        hint={
          role === "Lecturer"
            ? "Academic email address only."
            : "You can use letters, numbers & periods."
        }
      />
      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="e.g., th!51sjh0nD03N0tj@n3D03"
        autoComplete="new-password"
        required
        errors={state?.errors}
        hint="Min. 8 characters with mix of letters, numbers & symbols"
      />
      <Field
        label="Confirm Password"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.errors}
      />

      <SubmitButton>Sign Up</SubmitButton>
    </form>
  );
}

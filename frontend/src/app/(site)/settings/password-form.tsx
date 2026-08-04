"use client";

import { useActionState, useEffect, useRef } from "react";

import { changePassword } from "@/app/actions/settings";
import { Field, FormMessage, SubmitButton } from "@/components/form";

/**
 * The original's `/settings` page was this form and nothing else — "Change Password"
 * over two fields. It came back to sit alongside the profile editor rather than on its
 * own route, since one page called Settings that holds only a password box, while
 * everything else about you lives somewhere called "Edit Profile", is a split nobody
 * would design on purpose.
 */
export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Never leave a password sitting in the DOM after it has been accepted.
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-5">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}

      <Field
        label="Current Password"
        name="current_password"
        type="password"
        autoComplete="current-password"
        required
        errors={state?.errors}
      />

      <Field
        label="New Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.errors}
      />

      <Field
        label="Re-Type New Password"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        required
        errors={state?.errors}
      />

      <div className="xl:flex xl:justify-end">
        <SubmitButton>Save Changes</SubmitButton>
      </div>
    </form>
  );
}

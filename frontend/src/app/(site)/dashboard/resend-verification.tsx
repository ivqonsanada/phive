"use client";

import { useActionState } from "react";

import { resendVerificationEmail } from "@/app/actions/auth";

export function ResendVerification({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendVerificationEmail, undefined);

  return (
    <form
      action={action}
      className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-glow/10 px-4 py-3"
    >
      <p className="text-sm text-navy">
        {state?.success ?? state?.message ?? (
          <>
            Confirm <strong>{email}</strong> to unlock everything.
          </>
        )}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold text-glow hover:underline disabled:opacity-60"
      >
        {pending ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}

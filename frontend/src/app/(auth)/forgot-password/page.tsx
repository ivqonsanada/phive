import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-xl font-bold text-navy">Reset your password</h1>
      <p className="mb-6 text-sm text-ink/70">
        Tell us your email and we&apos;ll send a link to set a new password.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-ink/70">
        <Link href="/login" className="font-semibold text-navy hover:text-glow">
          Back to sign in
        </Link>
      </p>
    </>
  );
}

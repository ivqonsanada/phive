import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/app/(auth)/password/reset/reset-password-form";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
      <>
        <h1 className="mb-1 text-xl font-bold text-navy">This link is incomplete</h1>
        <p className="mb-6 text-sm text-ink/70">
          Open the link straight from your email, or request a new one.
        </p>
        <Link href="/forgot-password" className="font-semibold text-navy hover:text-glow">
          Request a new link
        </Link>
      </>
    );
  }

  return (
    <AuthCard>
    <>
      <h1 className="mb-1 text-xl font-bold text-navy">Choose a new password</h1>
      <p className="mb-6 text-sm text-ink/70">
        Setting a new password signs out every other device.
      </p>

      <ResetPasswordForm token={token} email={email} />
    </>
    </AuthCard>
  );
}

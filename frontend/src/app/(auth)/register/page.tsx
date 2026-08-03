import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/app/(auth)/register/register-form";
import { SocialButtons } from "@/components/social-buttons";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage() {
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }

  return (
    <>
      <h1 className="mb-1 text-xl font-bold text-navy">Join PHive</h1>
      <p className="mb-6 text-sm text-ink/70">
        Students apply to projects. Lecturers publish them — that needs a staff academic
        address.
      </p>

      {/* Social sign-ups land as students; a lecturer still needs an academic
          address, which the API re-checks on the callback. */}
      <SocialButtons role="Student" />

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-ink/70">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-navy hover:text-glow">
          Sign in
        </Link>
      </p>
    </>
  );
}

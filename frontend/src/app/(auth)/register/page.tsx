import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/app/(auth)/register/register-form";
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

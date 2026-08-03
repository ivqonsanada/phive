import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }

  const { reset } = await searchParams;

  return (
    <>
      <h1 className="mb-1 text-xl font-bold text-navy">Welcome back</h1>
      <p className="mb-6 text-sm text-ink/70">Sign in to keep working on your projects.</p>

      <LoginForm justResetPassword={reset === "1"} />

      <p className="mt-6 text-center text-sm text-ink/70">
        New here?{" "}
        <Link href="/register" className="font-semibold text-navy hover:text-glow">
          Create an account
        </Link>
      </p>
    </>
  );
}

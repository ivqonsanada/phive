import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginView } from "@/app/(auth)/login/login-view";
import { SocialButtons } from "@/components/social-buttons";
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

  return <LoginView social={<SocialButtons />} justResetPassword={reset === "1"} />;
}

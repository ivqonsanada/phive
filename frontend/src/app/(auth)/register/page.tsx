import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterView } from "@/app/(auth)/register/register-view";
import { SocialButtons } from "@/components/social-buttons";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage() {
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }

  return <RegisterView social={<SocialButtons role="Student" />} />;
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { api } from "@/lib/api";
import { createSession } from "@/lib/session";
import type { AuthPayload } from "@/lib/types";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Signing you in" };

/**
 * Landing point after a social sign-in.
 *
 * The API redirects here with a single-use code rather than a token, because a token
 * in a URL ends up in history, logs and `Referer` headers. This page swaps the code
 * for the token server-side and puts it straight into the httpOnly cookie.
 */
export default async function SocialCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    redirect("/login?error=social");
  }

  try {
    const { token } = await api<AuthPayload>("/auth/exchange", {
      method: "POST",
      anonymous: true,
      body: { code },
    });

    await createSession(token);
  } catch {
    return (
      <AuthCard>
        <h1 className="mb-2 text-[24px] font-extrabold text-ink">That sign-in link expired</h1>
        <p className="mb-6 text-[16px] text-ink/80">
          These links are single-use and only valid for a couple of minutes. Start again
          and it should go straight through.
        </p>
        <Link href="/login" className="font-bold text-navy hover:text-glow">
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  // redirect() throws, so it has to happen outside the try block.
  redirect("/dashboard");
}

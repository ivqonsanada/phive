import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Verify your email" };

const API_URL = process.env.API_URL ?? "http://localhost:8000";

/**
 * The API mails a signed verification URL wrapped in a link back to this page. All
 * this page does is replay that URL and report the outcome.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const result = await verify(url);

  return (
    <AuthCard>
    <>
      <h1 className="mb-1 text-xl font-bold text-navy">{result.title}</h1>
      <p className="mb-6 text-sm text-ink/70">{result.body}</p>
      <Link href={result.href} className="font-semibold text-navy hover:text-glow">
        {result.cta}
      </Link>
    </>
    </AuthCard>
  );
}

async function verify(url: string | undefined) {
  // The query string is attacker-controlled, so only ever replay a URL that points
  // at our own API — otherwise this page becomes a server-side request forwarder.
  if (!url || !url.startsWith(`${API_URL}/api/email/verify/`)) {
    return {
      title: "This link doesn't look right",
      body: "Open the verification link straight from your email, or request a new one from your dashboard.",
      href: "/login",
      cta: "Back to sign in",

    };
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return {
      title: "That link has expired",
      body: "Verification links are only valid for a short while. Sign in and send yourself a fresh one.",
      href: "/login",
      cta: "Back to sign in",
    };
  }

  return {
    title: "Email verified",
    body: "Your address is confirmed. You have full access to PHive now.",
    href: "/dashboard",
    cta: "Go to your dashboard",
  };
}

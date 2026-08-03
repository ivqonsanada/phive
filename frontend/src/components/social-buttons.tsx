import type { UserRole } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

/**
 * Which providers are switched on. Read from the environment rather than probed, so
 * an unconfigured provider never shows a button that would fail on click.
 */
function enabledProviders(): { id: string; label: string }[] {
  const providers = (process.env.SOCIAL_PROVIDERS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return [
    { id: "google", label: "Google" },
    { id: "apple", label: "Apple" },
  ].filter((provider) => providers.includes(provider.id));
}

export function SocialButtons({ role }: { role?: UserRole }) {
  const providers = enabledProviders();

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="space-y-2">
        {providers.map((provider) => (
          <a
            key={provider.id}
            // A full page navigation, not a fetch: OAuth is a browser redirect flow.
            href={`${API_URL}/auth/${provider.id}/redirect${role ? `?role=${role}` : ""}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-navy/15 px-4 py-2.5 font-semibold text-navy transition hover:border-navy"
          >
            Continue with {provider.label}
          </a>
        ))}
      </div>

      {/* Separates the providers above from the email form below. */}
      <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-ink/40">
        <span className="h-px flex-1 bg-navy/10" />
        or
        <span className="h-px flex-1 bg-navy/10" />
      </div>
    </div>
  );
}

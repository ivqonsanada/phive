import { ApiError } from "@/lib/api-error";

export type DemoDataMode = "auto" | "always" | "never";

/**
 * `auto` is the default: serve the real API when it answers, fall back to fixtures when
 * it does not. A deployment without a backend stays browsable, and it stops serving
 * fixtures on its own the moment a real API appears — there is no flag to remember.
 *
 * `always` forces fixtures, which is useful for screenshots and offline UI work.
 * `never` lets the error through, for an environment where a broken backend should be
 * loud rather than papered over.
 */
export function parseDemoMode(value: string | undefined): DemoDataMode {
  const normalised = value?.trim().toLowerCase();

  if (normalised === "always" || normalised === "true" || normalised === "1") {
    return "always";
  }

  if (normalised === "never" || normalised === "false" || normalised === "0") {
    return "never";
  }

  return "auto";
}

/**
 * Whether a failure means "the backend is not answering" as opposed to "the backend
 * answered, and the answer was no".
 *
 * This distinction is the whole point. A 404 for a profile that does not exist is a
 * correct response, and substituting a demo profile for it would turn a working
 * not-found page into a lie. Only transport failures and server faults fall back.
 */
export function isBackendUnavailable(error: unknown): boolean {
  if (error instanceof ApiError) {
    // 401 and 403 mean we are not talking to PHive. Every endpoint behind this helper
    // is an anonymous public read — projects, profiles, leaderboards — and none of them
    // can legitimately refuse an anonymous caller. Seeing one says the request landed
    // somewhere else: a misconfigured origin, a proxy, or a login wall in front of the
    // API. This is not hypothetical — a deployed Worker pointed at `localhost` resolves
    // against the public internet and comes back 403 from a stranger.
    if (error.status === 401 || error.status === 403) {
      return true;
    }

    return error.status >= 500;
  }

  // A cancelled request is not a backend failure — React Query aborts in-flight
  // queries routinely when a component unmounts or a key changes.
  if (error instanceof DOMException && error.name === "AbortError") {
    return false;
  }

  // Anything else reaching here is a thrown fetch: DNS failure, refused connection,
  // TLS error, or the Worker being unable to reach a localhost API URL.
  return true;
}

/**
 * Run a request, substituting fixtures when the mode and the failure both allow it.
 */
export async function resolveWithFallback<T>({
  mode,
  load,
  fixture,
  onFallback,
}: {
  mode: DemoDataMode;
  load: () => Promise<T>;
  fixture: () => T;
  onFallback?: () => void;
}): Promise<T> {
  if (mode === "always") {
    onFallback?.();

    return fixture();
  }

  try {
    return await load();
  } catch (error) {
    if (mode === "never" || !isBackendUnavailable(error)) {
      throw error;
    }

    onFallback?.();

    return fixture();
  }
}

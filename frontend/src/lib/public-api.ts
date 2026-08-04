import { ApiError } from "@/lib/api-error";

/**
 * The read-only half of the API, called straight from the browser.
 *
 * Everything reachable through here is public — projects, profiles, leaderboards —
 * so no token is attached and none is needed. Authenticated calls deliberately do not
 * live here: they still go through server actions, which read the bearer token from an
 * httpOnly cookie the browser cannot see. Moving those into the browser would mean
 * handing a live session token to any script that manages to run on the page.
 */
export async function publicApi<T>(baseUrl: string, path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${baseUrl}/api${path}`, {
    headers: { Accept: "application/json" },
    signal,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? `Request to ${path} failed with ${response.status}.`,
      payload?.errors ?? {},
    );
  }

  return payload as T;
}

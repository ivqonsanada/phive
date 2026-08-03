import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { ApiError, api } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { User } from "@/lib/types";

/**
 * The signed-in user, or null. Memoised for the duration of one render pass so a
 * layout and its pages share a single API round trip.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!(await getToken())) {
    return null;
  }

  try {
    return await api<User>("/user");
  } catch (error) {
    // An expired or revoked token is indistinguishable from being signed out.
    if (error instanceof ApiError && error.isUnauthenticated) {
      return null;
    }

    throw error;
  }
});

/**
 * Use in any page, layout or action that must not render for a guest. The proxy
 * does an optimistic cookie check first; this is the one that actually verifies.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

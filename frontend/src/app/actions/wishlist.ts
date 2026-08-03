"use server";

import { revalidatePath } from "next/cache";

import { api } from "@/lib/api";

/**
 * Star or unstar a project. The API toggles server-side and returns the new state,
 * so this never has to know which way it was pointing.
 */
export async function toggleWishlist(projectUrl: string): Promise<boolean> {
  const { is_wished } = await api<{ is_wished: boolean }>(
    `/projects/${encodeURIComponent(projectUrl)}/wishlist`,
    { method: "POST" },
  );

  revalidatePath("/explore");
  revalidatePath(`/projects/${projectUrl}`);

  return is_wished;
}

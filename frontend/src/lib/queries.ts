"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { useRuntimeConfig } from "@/components/providers";
import { markDemoData } from "@/lib/demo-state";
import { resolveWithFallback } from "@/lib/demo-mode";
import {
  demoHome,
  demoLeaderboards,
  demoProfile,
  demoProject,
  demoProjects,
  demoSimilarProjects,
} from "@/lib/fixtures";
import { publicApi } from "@/lib/public-api";
import type {
  BoardKey,
  Expertise,
  HomePayload,
  LeaderboardEntry,
  Paginated,
  ProfilePayload,
  Project,
} from "@/lib/types";

export interface ExploreFilters {
  query?: string;
  expertise?: Expertise;
  open_only?: boolean;
  page?: number;
}

function queryString(filters: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  const search = params.toString();

  return search ? `?${search}` : "";
}

/**
 * Every public read goes through here, so the fallback rule is stated once.
 */
function usePublicQuery<T>(
  key: readonly unknown[],
  path: string,
  fixture: () => T,
): UseQueryResult<T> {
  const { apiBaseUrl, demoData } = useRuntimeConfig();

  return useQuery({
    queryKey: [...key, apiBaseUrl, demoData],
    queryFn: ({ signal }) =>
      resolveWithFallback({
        mode: demoData,
        load: () => publicApi<T>(apiBaseUrl, path, signal),
        fixture,
        onFallback: markDemoData,
      }),
  });
}

export function useHome(): UseQueryResult<HomePayload> {
  return usePublicQuery(["home"], "/home", demoHome);
}

export function useProjects(filters: ExploreFilters = {}): UseQueryResult<Paginated<Project>> {
  return usePublicQuery(["projects", filters], `/projects${queryString({ ...filters })}`, () =>
    demoProjects(filters.page ?? 1),
  );
}

export function useProject(projectUrl: string): UseQueryResult<Project> {
  return usePublicQuery(
    ["project", projectUrl],
    `/projects/${encodeURIComponent(projectUrl)}`,
    () => demoProject(projectUrl),
  );
}

export function useSimilarProjects(projectUrl: string): UseQueryResult<Project[]> {
  return usePublicQuery(
    ["project", projectUrl, "similar"],
    `/projects/${encodeURIComponent(projectUrl)}/similar`,
    () => demoSimilarProjects(projectUrl),
  );
}

export function useProfile(tagname: string): UseQueryResult<ProfilePayload> {
  return usePublicQuery(["profile", tagname], `/users/${encodeURIComponent(tagname)}`, () =>
    demoProfile(tagname),
  );
}

export function useLeaderboards(): UseQueryResult<{
  boards: Record<BoardKey, LeaderboardEntry[]>;
}> {
  return usePublicQuery(["leaderboards"], "/leaderboards", demoLeaderboards);
}

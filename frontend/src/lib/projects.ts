import "server-only";

import { api } from "@/lib/api";
import { resolveWithFallback } from "@/lib/demo-mode";
import {
  demoHome,
  demoLeaderboards,
  demoProfile,
  demoProject,
  demoProjects,
  demoSimilarProjects,
} from "@/lib/fixtures";
import { runtimeConfig } from "@/lib/runtime-config";
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
 * Server-rendered public reads follow the same fallback rule as the browser ones, so a
 * deployment without a backend degrades to fixtures instead of a 500 page. `never`
 * still lets the error through, and a 4xx is always passed on — a missing project has
 * to stay a 404 rather than becoming a demo project.
 */
function publicRead<T>(load: () => Promise<T>, fixture: () => T): Promise<T> {
  return resolveWithFallback({ mode: runtimeConfig().demoData, load, fixture });
}

export function getProjects(filters: ExploreFilters = {}): Promise<Paginated<Project>> {
  return publicRead(
    () => api<Paginated<Project>>(`/projects${queryString({ ...filters })}`),
    () => demoProjects(filters.page ?? 1),
  );
}

export function getProject(projectUrl: string): Promise<Project> {
  return publicRead(
    () => api<Project>(`/projects/${encodeURIComponent(projectUrl)}`),
    () => demoProject(projectUrl),
  );
}

export function getSimilarProjects(projectUrl: string): Promise<Project[]> {
  return publicRead(
    () => api<Project[]>(`/projects/${encodeURIComponent(projectUrl)}/similar`),
    () => demoSimilarProjects(projectUrl),
  );
}

export function getProfile(tagname: string): Promise<ProfilePayload> {
  return publicRead(
    () => api<ProfilePayload>(`/users/${encodeURIComponent(tagname)}`),
    () => demoProfile(tagname),
  );
}

export function getHome(): Promise<HomePayload> {
  return publicRead(() => api<HomePayload>("/home"), demoHome);
}

export function getLeaderboards(): Promise<{ boards: Record<BoardKey, LeaderboardEntry[]> }> {
  return publicRead(
    () => api<{ boards: Record<BoardKey, LeaderboardEntry[]> }>("/leaderboards"),
    demoLeaderboards,
  );
}

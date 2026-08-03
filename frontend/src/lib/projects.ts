import "server-only";

import { api } from "@/lib/api";
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

export function getProjects(filters: ExploreFilters = {}): Promise<Paginated<Project>> {
  return api<Paginated<Project>>(`/projects${queryString({ ...filters })}`);
}

export function getProject(projectUrl: string): Promise<Project> {
  return api<Project>(`/projects/${encodeURIComponent(projectUrl)}`);
}

export function getSimilarProjects(projectUrl: string): Promise<Project[]> {
  return api<Project[]>(`/projects/${encodeURIComponent(projectUrl)}/similar`);
}

export function getProfile(tagname: string): Promise<ProfilePayload> {
  return api<ProfilePayload>(`/users/${encodeURIComponent(tagname)}`);
}

export function getHome(): Promise<HomePayload> {
  return api<HomePayload>("/home");
}

export function getLeaderboards(): Promise<{ boards: Record<BoardKey, LeaderboardEntry[]> }> {
  return api<{ boards: Record<BoardKey, LeaderboardEntry[]> }>("/leaderboards");
}

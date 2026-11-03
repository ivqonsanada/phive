import type { MetadataRoute } from "next";

import { api } from "@/lib/api";
import type { BoardKey, LeaderboardEntry, Paginated, Project } from "@/lib/types";

// The project list changes whenever a lecturer publishes, so build it per request rather
// than freezing it at build time (sitemaps are cached by default).
export const dynamic = "force-dynamic";

const SITE_URL = (process.env.SITE_URL ?? "https://phive.ivqonsanada.com").replace(/\/$/, "");

/** Every published project, walking the explore pages until the API says there are no more. */
async function publishedProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  for (let page = 1; page <= 100; page++) {
    const result = await api<Paginated<Project>>(`/projects?page=${page}`, { anonymous: true });
    projects.push(...result.data);
    if (!result.links.next) break;
  }
  return projects;
}

/**
 * The public pages: home, explore and the leaderboard, every published project, and the
 * profiles reachable from them (project owners and everyone on a board). Signed-in pages
 * are left out; robots.ts keeps crawlers off them.
 *
 * Only real API data goes in. If the API is unreachable this lists the fixed pages alone,
 * rather than the frontend's offline demo fixtures, whose URLs do not exist.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/leaderboard`, changeFrequency: "daily", priority: 0.6 },
  ];

  try {
    const [projects, { boards }] = await Promise.all([
      publishedProjects(),
      api<{ boards: Record<BoardKey, LeaderboardEntry[]> }>("/leaderboards?limit=50", { anonymous: true }),
    ]);

    for (const project of projects) {
      if (!project.project_url) continue;
      pages.push({
        url: `${SITE_URL}/projects/${encodeURIComponent(project.project_url)}`,
        lastModified: project.created_at,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    const tagnames = new Set<string>();
    for (const project of projects) if (project.user?.tagname) tagnames.add(project.user.tagname);
    for (const board of Object.values(boards)) {
      for (const entry of board) if (entry.user?.tagname) tagnames.add(entry.user.tagname);
    }
    for (const tagname of tagnames) {
      pages.push({ url: `${SITE_URL}/u/${encodeURIComponent(tagname)}`, changeFrequency: "weekly", priority: 0.5 });
    }
  } catch (error) {
    console.error("sitemap: could not reach the API, listing fixed pages only", error);
  }

  return pages;
}

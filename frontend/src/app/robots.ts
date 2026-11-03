import type { MetadataRoute } from "next";

const SITE_URL = (process.env.SITE_URL ?? "https://phive.ivqonsanada.com").replace(/\/$/, "");

/** Public pages are open; everything behind sign-in, and the auth plumbing, is not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/dashboard",
        "/email/",
        "/inbox",
        "/messages",
        "/my/",
        "/newcomer",
        "/party",
        "/password/",
        "/project-box",
        "/settings",
        "/wishlist",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

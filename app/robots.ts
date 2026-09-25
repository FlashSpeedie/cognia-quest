import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const AUTHENTICATED_AREAS = [
  "/dashboard",
  "/admin",
  "/api",
  "/auth",
  "/onboarding",
  "/settings",
  "/profile",
  "/progress",
  "/achievements",
  "/certificate",
  "/leaderboard",
  "/map",
  "/academy",
  "/missions",
  "/lab",
  "/detective",
  "/ethics",
  "/final-challenge",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...AUTHENTICATED_AREAS],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

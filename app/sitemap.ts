import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const PUBLIC_PATHS = ["/", "/about", "/preview", "/privacy"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PUBLIC_PATHS.map((path) => ({ url: `${base}${path}` }));
}

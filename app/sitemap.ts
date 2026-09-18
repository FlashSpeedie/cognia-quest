import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return ["", "/about", "/preview", "/privacy", "/login", "/register"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));
}

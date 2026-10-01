import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { LESSONS } from "@/content/academy";

/**
 * Public pages. The Academy (module 1) is fully public and indexable:
 * lesson pages, the module overview, the test page and the sources page.
 * Personalized progress is never part of these URLs.
 */
const STATIC_PUBLIC_PATHS = [
  "/",
  "/about",
  "/preview",
  "/privacy",
  "/academy-new",
  "/academy-new/module/1",
  "/academy-new/module/1/test",
  "/academy-new/references",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const academyLessons = LESSONS.map((l) => `/academy-new/module/1/lesson/${l.meta.slug}`);
  return [...STATIC_PUBLIC_PATHS, ...academyLessons].map((path) => ({ url: `${base}${path}` }));
}

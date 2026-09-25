/**
 * Central site identity + production-origin resolution. Every URL the app
 * emits (SEO canonicals, sitemap, robots, Open Graph, structured data,
 * Supabase email-redirect links) resolves through siteUrl() so production
 * never falls back to localhost.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL (explicit, preferred - set in Vercel to the
 *     production origin, e.g. when moving to a custom domain)
 *  2. NEXT_PUBLIC_APP_URL (legacy alias - local dev sets this to localhost)
 *  3. VERCEL_PROJECT_PRODUCTION_URL (Vercel system env, build + runtime)
 *  4. VERCEL_PROJECT_PRODUCTION_DOMAIN (tolerated alternate spelling)
 *  5. PRODUCTION_ORIGIN (this project's canonical domain - guarantees
 *     correct URLs on a Vercel build even when system env vars are not
 *     exposed to the project)
 */
export const SITE = {
  name: "Cognia Quest",
  tagline: "Learn AI. Question AI. Use AI Responsibly.",
  description:
    "An interactive AI learning platform for high school students: understand how AI works, practice with interactive challenges, investigate AI mistakes, and learn responsible usage.",
} as const;

export const PRODUCTION_ORIGIN = "https://cognia-quest.vercel.app";

function normalize(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function domainToHttps(domain: string): string {
  return `https://${domain.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
}

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return normalize(explicit);
  const prod =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN?.trim();
  if (prod) return domainToHttps(prod);
  return PRODUCTION_ORIGIN;
}

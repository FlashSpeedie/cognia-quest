/**
 * Central site identity + production-origin resolution. Every URL the app
 * emits (SEO canonicals, sitemap, robots, Open Graph, structured data,
 * Supabase email-redirect links) resolves through siteUrl() so production
 * never falls back to localhost.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL (explicit, preferred - set in Vercel to the
 *     production origin, e.g. when moving to a custom domain). A loopback
 *     value is ignored on Vercel builds - it can only be a misconfigured
 *     env var there, never an intentional local development value.
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

/** True while building or serving on Vercel (`vercel dev` sets "development"). */
function isVercelDeployment(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
}

/** localhost / 127.0.0.1 / [::1] / *.localhost hosts. */
function isLoopback(raw: string): boolean {
  try {
    const { hostname, protocol } = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  // A loopback override can only be a misconfigured env var (e.g. a copied
  // .env.local value) once the app is on Vercel - never honor it there. Local
  // development runs off Vercel, so the explicit localhost value still works.
  if (explicit && !(isVercelDeployment() && isLoopback(explicit))) return normalize(explicit);
  const prod =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN?.trim();
  if (prod) return domainToHttps(prod);
  return PRODUCTION_ORIGIN;
}

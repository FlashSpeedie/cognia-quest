import type { Metadata } from "next";

export const SITE = {
  name: "Cognia Quest",
  tagline: "Learn AI. Question AI. Use AI Responsibly.",
  description:
    "An interactive AI learning platform for high school students: understand how AI works, practice with interactive challenges, investigate AI mistakes, and learn responsible usage.",
} as const;

/**
 * Canonical production URL, resolved in priority order:
 *  1. NEXT_PUBLIC_APP_URL (explicit override, e.g. a custom domain)
 *  2. VERCEL_PROJECT_PRODUCTION_DOMAIN (provided automatically by Vercel)
 *  3. localhost (local development only - never used on a Vercel build)
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const domain = process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN?.trim();
  if (domain) return `https://${domain.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

/**
 * Standard public-page metadata: unique title + description, absolute
 * canonical, and an Open Graph block that reuses the site's share image.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${siteUrl()}${opts.path}`;
  const ogTitle = opts.title.includes(SITE.name) ? opts.title : `${opts.title} | ${SITE.name}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: opts.description,
      url,
      siteName: SITE.name,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE.name} - ${SITE.tagline}` }],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

/** Private/authenticated areas: never indexed. */
export function privateMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: false, nocache: true } };
}

/** Layout-level robots guard: every page in the area is authenticated. */
export function privateAreaMetadata(): Metadata {
  return { robots: { index: false, follow: false, nocache: true } };
}

/** BreadcrumbList JSON-LD for a public page one level below the homepage. */
export function breadcrumbJsonLd(name: string, path: string) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name, item: `${base}${path}` },
    ],
  };
}

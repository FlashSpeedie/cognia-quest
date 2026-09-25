import type { Metadata } from "next";
import { SITE, siteUrl } from "@/lib/site";

export { SITE, siteUrl } from "@/lib/site";

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

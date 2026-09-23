import type { Metadata } from "next";

/**
 * Standard public-page metadata: unique title + description, absolute
 * canonical, and an Open Graph block that reuses the site's share image.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}${opts.path}`;
  const ogTitle = opts.title.includes("Cognia Quest") ? opts.title : `${opts.title} | Cognia Quest`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: opts.description,
      url,
      siteName: "Cognia Quest",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: ogTitle }],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

/** Private/authenticated areas: never indexed. */
export function privateMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: false, nocache: true } };
}

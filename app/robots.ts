import type { MetadataRoute } from "next";

const base = () => (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/preview", "/privacy"],
        disallow: ["/dashboard", "/admin", "/api", "/settings", "/profile", "/academy", "/missions", "/lab", "/detective", "/ethics", "/progress", "/achievements", "/final-challenge", "/certificate", "/leaderboard", "/glossary", "/careers", "/map", "/onboarding"],
      },
    ],
    sitemap: `${base()}/sitemap.xml`,
  };
}

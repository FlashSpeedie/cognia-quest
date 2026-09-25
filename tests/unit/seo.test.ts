import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  siteUrl,
  pageMetadata,
  privateMetadata,
  privateAreaMetadata,
  breadcrumbJsonLd,
  SITE,
} from "@/lib/seo";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const PROD_URL = "https://cognia-quest.vercel.app";

const envKeys = ["NEXT_PUBLIC_APP_URL", "VERCEL_PROJECT_PRODUCTION_DOMAIN"] as const;
let saved: Record<string, string | undefined> = {};

beforeEach(() => {
  saved = {};
  for (const k of envKeys) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of envKeys) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("siteUrl resolution", () => {
  it("uses NEXT_PUBLIC_APP_URL when set, stripping trailing slashes", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://custom.example.com/";
    expect(siteUrl()).toBe("https://custom.example.com");
  });

  it("falls back to the Vercel production domain when the override is unset", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN = "cognia-quest.vercel.app";
    expect(siteUrl()).toBe(PROD_URL);
  });

  it("prefers the explicit override over the Vercel domain", () => {
    process.env.NEXT_PUBLIC_APP_URL = PROD_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN = "something-else.vercel.app";
    expect(siteUrl()).toBe(PROD_URL);
  });

  it("normalizes a scheme-prefixed Vercel domain", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN = "https://cognia-quest.vercel.app";
    expect(siteUrl()).toBe(PROD_URL);
  });

  it("uses localhost only when no deployment env is present", () => {
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});

describe("sitemap", () => {
  it("contains exactly the public pages on the production host", () => {
    process.env.NEXT_PUBLIC_APP_URL = PROD_URL;
    const urls = sitemap().map((e) => e.url);
    expect(urls).toEqual([`${PROD_URL}/`, `${PROD_URL}/about`, `${PROD_URL}/preview`, `${PROD_URL}/privacy`]);
  });

  it("never emits localhost or preview URLs when deployed", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN = "cognia-quest.vercel.app";
    const joined = sitemap()
      .map((e) => e.url)
      .join(" ");
    expect(joined).not.toContain("localhost");
    expect(joined).not.toContain(".vercel.app--");
    expect(joined).toContain(PROD_URL);
  });

  it("contains no private or utility routes", () => {
    process.env.NEXT_PUBLIC_APP_URL = PROD_URL;
    const joined = sitemap()
      .map((e) => e.url)
      .join(" ");
    for (const forbidden of [
      "/admin",
      "/api",
      "/auth",
      "/dashboard",
      "/login",
      "/register",
      "/onboarding",
      "/academy",
      "/missions",
      "/lab",
      "/settings",
      "/profile",
    ]) {
      expect(joined).not.toContain(forbidden);
    }
  });
});

describe("robots.txt", () => {
  it("references the canonical production sitemap", () => {
    process.env.NEXT_PUBLIC_APP_URL = PROD_URL;
    expect(robots().sitemap).toBe(`${PROD_URL}/sitemap.xml`);
  });

  it("allows the whole site but blocks authenticated areas", () => {
    process.env.NEXT_PUBLIC_APP_URL = PROD_URL;
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : r.rules ? [r.rules] : [];
    const star = rules.find((rule: { userAgent?: string | string[] }) =>
      Array.isArray(rule.userAgent) ? rule.userAgent.includes("*") : rule.userAgent === "*",
    )!;
    expect(star.allow).toContain("/");
    for (const blocked of ["/admin", "/api", "/auth", "/dashboard", "/academy"]) {
      expect(star.disallow).toContain(blocked);
    }
  });

  it("never blocks public or auth utility pages (noindex must stay crawlable)", () => {
    process.env.NEXT_PUBLIC_APP_URL = PROD_URL;
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : r.rules ? [r.rules] : [];
    const star = rules.find((rule: { userAgent?: string | string[] }) =>
      Array.isArray(rule.userAgent) ? rule.userAgent.includes("*") : rule.userAgent === "*",
    )!;
    for (const open of ["/about", "/preview", "/privacy", "/login", "/register", "/forgot-password", "/reset-password"]) {
      expect(star.disallow).not.toContain(open);
    }
  });
});

describe("page metadata helpers", () => {
  it("builds an absolute production canonical and Open Graph block", () => {
    process.env.NEXT_PUBLIC_APP_URL = PROD_URL;
    const meta = pageMetadata({ title: "About", description: "d", path: "/about" });
    expect(meta.alternates?.canonical).toBe(`${PROD_URL}/about`);
    expect(meta.openGraph?.url).toBe(`${PROD_URL}/about`);
    expect(meta.openGraph?.siteName).toBe(SITE.name);
    expect(meta.openGraph?.title).toBe(`About | ${SITE.name}`);
    expect(meta.openGraph?.images).toBeDefined();
    expect(meta.twitter && "card" in meta.twitter ? meta.twitter.card : undefined).toBe("summary_large_image");
  });

  it("does not double the brand name when the title already contains it", () => {
    process.env.NEXT_PUBLIC_APP_URL = PROD_URL;
    const meta = pageMetadata({
      title: "Cognia Quest | Interactive AI Learning for High School Students",
      description: "d",
      path: "/",
    });
    expect(meta.openGraph?.title).toBe("Cognia Quest | Interactive AI Learning for High School Students");
  });

  it("marks private pages and authenticated layouts noindex", () => {
    expect(privateMetadata("Dashboard").robots).toEqual({ index: false, follow: false, nocache: true });
    expect(privateAreaMetadata().robots).toEqual({ index: false, follow: false, nocache: true });
  });

  it("builds an accurate two-level breadcrumb trail", () => {
    process.env.NEXT_PUBLIC_APP_URL = PROD_URL;
    const data = breadcrumbJsonLd("About", "/about") as Record<string, any>;
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[0].item).toBe(`${PROD_URL}/`);
    expect(data.itemListElement[1].item).toBe(`${PROD_URL}/about`);
  });
});

const repoRoot = process.cwd();
const seoSurfaces = [
  "lib/seo.ts",
  "app/layout.tsx",
  "app/sitemap.ts",
  "app/robots.ts",
  "app/page.tsx",
  "app/about/page.tsx",
  "app/preview/page.tsx",
  "app/privacy/page.tsx",
  "public/llms.txt",
  "public/manifest.webmanifest",
].map((p) => join(repoRoot, p));

describe("SEO surfaces stay free of development and competition references", () => {
  const forbidden = ["tsa", "webmaster", "competition", "opencode", "kimi", "kilo", "cline", "aider"];

  for (const file of seoSurfaces) {
    it(`${file.split("\\").pop()?.split("/").pop()} contains no forbidden terms`, () => {
      const src = readFileSync(file, "utf8").toLowerCase();
      for (const term of forbidden) {
        expect(src.includes(term), `found "${term}" in ${file}`).toBe(false);
      }
    });
  }
});

describe("public pages have unique, complete metadata", () => {
  const publicPages = [
    "app/page.tsx",
    "app/about/page.tsx",
    "app/preview/page.tsx",
    "app/privacy/page.tsx",
  ].map((p) => join(repoRoot, p));

  const entries = publicPages.map((file) => {
    const src = readFileSync(file, "utf8");
    const title = src.match(/title:\s*"([^"]+)"/)?.[1];
    const description = src.match(/description:\s*"([^"]+)"/)?.[1];
    return { file: file.split(/[\\/]/).slice(-2).join("/"), title, description };
  });

  it("every public page declares a title and a description", () => {
    for (const e of entries) {
      expect(e.title, `title missing in ${e.file}`).toBeTruthy();
      expect(e.description, `description missing in ${e.file}`).toBeTruthy();
    }
  });

  it("titles and descriptions are unique across public pages", () => {
    const titles = entries.map((e) => e.title);
    const descriptions = entries.map((e) => e.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("descriptions stay within a reasonable search-result length", () => {
    for (const e of entries) {
      expect(e.description!.length).toBeLessThan(200);
      expect(e.description!.length).toBeGreaterThanOrEqual(50);
    }
  });
});

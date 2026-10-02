import Link from "next/link";
import { BrandLogo } from "@/components/public/BrandLogo";
import { LinkButton } from "@/components/ui/Button";

/**
 * Public (guest-only) header for the Academy (New) area. Signed-in students
 * get the normal Cognia Quest application shell instead - see
 * app/academy-new/layout.tsx.
 */
export function AcademyHeader({ resumeHref }: { resumeHref?: string }) {
  void resumeHref;
  const links = [
    { href: "/academy-new", label: "Academy (New)" },
    { href: "/academy-new/module/1", label: "Module 1" },
    { href: "/academy-new/references", label: "Sources & references" },
  ];
  const isActive = (href: string) => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    return path === href || (href !== "/academy-new" && path.startsWith(href));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-void-700/60 bg-void-900/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" aria-label="Cognia Quest home" className="shrink-0 focus-ring rounded-lg">
            <BrandLogo size="sm" />
          </Link>
          <nav aria-label="Academy (New)" className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring ${
                  isActive(l.href) ? "text-pulse-700 dark:text-pulse-300" : "text-ink-dim hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
          >
            Log in
          </Link>
          <LinkButton href="/register" size="sm">
            Start learning
          </LinkButton>
        </div>
      </div>
    </header>
  );
}

/** Slim footer for the Academy (New) area, with honest source attribution. */
export function AcademyFooter() {
  return (
    <footer className="mt-16 border-t border-void-700/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 sm:flex-row">
        <p className="text-sm font-semibold text-ink-dim">Cognia Quest Academy (New)</p>
        <nav className="flex flex-wrap justify-center gap-5 text-sm" aria-label="Academy (New) footer">
          <Link className="font-medium text-ink-dim hover:text-ink focus-ring rounded" href="/">Home</Link>
          <Link className="font-medium text-ink-dim hover:text-ink focus-ring rounded" href="/about">About</Link>
          <Link className="font-medium text-ink-dim hover:text-ink focus-ring rounded" href="/academy-new/references">Sources & references</Link>
          <Link className="font-medium text-ink-dim hover:text-ink focus-ring rounded" href="/privacy">Privacy</Link>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-4 text-xs leading-relaxed text-ink-faint">
        Lesson videos are embedded from their original publisher and remain hosted there. Module 1
        draws on the open course by LunarTech, distributed through freeCodeCamp.org - see{" "}
        <Link href="/academy-new/references" className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300">
          sources & references
        </Link>
        .
      </p>
    </footer>
  );
}

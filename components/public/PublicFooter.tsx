import Link from "next/link";
import { BrandLogo } from "@/components/public/BrandLogo";

export function PublicFooter() {
  return (
    <footer className="border-t border-void-700/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 sm:flex-row">
        <Link href="/" aria-label="Cognia Quest home" className="focus-ring rounded-lg">
          <BrandLogo size="sm" />
        </Link>
        <nav className="flex gap-5 text-sm" aria-label="Footer">
          <Link className="font-medium text-ink-dim hover:text-ink focus-ring rounded" href="/about">About the platform</Link>
          <Link className="font-medium text-ink-dim hover:text-ink focus-ring rounded" href="/preview">Preview lessons</Link>
          <Link className="font-medium text-ink-dim hover:text-ink focus-ring rounded" href="/privacy">Privacy</Link>
          <Link className="font-medium text-ink-dim hover:text-ink focus-ring rounded" href="/login">Log in</Link>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-4 text-xs text-ink-faint">
        Cognia Quest is an interactive AI learning platform for students.
      </p>
    </footer>
  );
}

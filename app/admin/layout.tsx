import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { Logo } from "@/components/public/PublicNav";
import { audit } from "@/server/services/audit";
import { getDb } from "@/server/db/db";

export const dynamic = "force-dynamic";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const db = await getDb();
  await audit(db, user.id, "admin.view", "console");

  return (
    <div className="app-backdrop min-h-screen">
      <header className="border-b border-void-700/70 bg-void-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-300">
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-1 text-sm" aria-label="Admin">
            {ADMIN_NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 font-medium text-ink-dim hover:text-ink focus-ring">
                {n.label}
              </Link>
            ))}
            <Link href="/dashboard" className="rounded-lg px-3 py-2 font-medium text-ink-faint hover:text-ink focus-ring">
              ← Student view
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

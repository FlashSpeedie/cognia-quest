"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { NotificationBell } from "./NotificationBell";
import { CommandPalette } from "./CommandPalette";
import { Logo } from "@/components/public/PublicNav";
import { levelProgress } from "@/lib/levels";

export interface ShellUser {
  id: string;
  displayName: string;
  title: string;
  avatarId: string;
  xpTotal: number;
  role: "student" | "admin";
}

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/academy", label: "Academy", icon: "academy" },
  { href: "/lab", label: "AI Lab", icon: "lab" },
  { href: "/detective", label: "Detective", icon: "detective" },
  { href: "/ethics", label: "Ethics", icon: "scale" },
  { href: "/missions", label: "Missions", icon: "missions" },
  { href: "/achievements", label: "Achievements", icon: "achievements" },
  { href: "/progress", label: "Progress", icon: "progress" },
  { href: "/map", label: "Quest Map", icon: "network" },
];

const MOBILE_NAV = NAV.filter((n) => ["/dashboard", "/academy", "/lab", "/detective", "/missions"].includes(n.href));

export function AppShell({
  user,
  unreadCount,
  children,
}: {
  user: ShellUser;
  unreadCount: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const lp = levelProgress(user.xpTotal);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="app-backdrop min-h-screen">
      {/* ── Top bar ── */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-void-700/70 bg-void-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-3 sm:px-4">
          <button
            className="rounded-lg p-2 text-ink-dim hover:text-ink focus-ring md:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <Link href="/dashboard" className="focus-ring rounded-lg" aria-label="AI Quest dashboard">
            <Logo size="sm" />
          </Link>

          {/* XP / level cluster */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:flex" aria-label={`Level ${lp.current.level}, ${lp.current.title}, ${user.xpTotal} XP`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 font-display text-[11px] font-black text-void-950">
                {lp.current.level}
              </span>
              <div className="w-28 lg:w-40">
                <div className="flex justify-between text-[10px] leading-none">
                  <span className="font-semibold text-ink">{lp.current.title}</span>
                  <span className="font-mono text-ink-faint">
                    {lp.next ? `${lp.into}/${lp.next.minXP - lp.current.minXP}` : "MAX"}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-void-700" role="progressbar" aria-valuenow={lp.pct} aria-valuemin={0} aria-valuemax={100} aria-label="XP progress to next level">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-[width] duration-700" style={{ width: `${lp.pct}%` }} />
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300">{user.xpTotal.toLocaleString()} XP</span>
            </div>

            <NotificationBell initialUnread={unreadCount} />

            {/* Avatar menu (desktop) */}
            <AccountMenu user={user} logout={logout} />
          </div>
        </div>
      </header>

      {/* ── Sidebar (desktop) ── */}
      <nav aria-label="Primary" className="fixed bottom-0 left-0 top-14 z-30 hidden w-56 flex-col border-r border-void-700/60 bg-void-950/60 p-3 backdrop-blur-md md:flex">
        <div className="flex-1 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-ring ${
                isActive(n.href) ? "bg-pulse-400/15 text-pulse-300" : "text-ink-dim hover:bg-void-800 hover:text-ink"
              }`}
            >
              <Icon name={n.icon} size={17} />
              {n.label}
            </Link>
          ))}
        </div>
        <div className="space-y-1 border-t border-void-700/60 pt-3">
          {user.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-300 hover:bg-void-800 focus-ring">
              <Icon name="shield" size={17} /> Admin
            </Link>
          )}
          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-dim hover:bg-void-800 hover:text-ink focus-ring">
            <Icon name="profile" size={17} /> Profile
          </Link>
          <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-dim hover:bg-void-800 hover:text-ink focus-ring">
            <Icon name="settings" size={17} /> Settings
          </Link>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-void-950/80" onClick={() => setMenuOpen(false)} />
          <nav aria-label="Mobile" className="absolute left-0 top-0 h-full w-64 animate-fade-up border-r border-void-700 bg-void-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="rounded-lg p-2 text-ink-dim focus-ring">
                <Icon name="x" />
              </button>
            </div>
            <div className="space-y-1">
              {[...NAV, { href: "/profile", label: "Profile", icon: "profile" as IconName }, { href: "/settings", label: "Settings", icon: "settings" as IconName }].map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium focus-ring ${
                    isActive(n.href) ? "bg-pulse-400/15 text-pulse-300" : "text-ink-dim"
                  }`}
                >
                  <Icon name={n.icon} size={17} /> {n.label}
                </Link>
              ))}
              {user.role === "admin" && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-300">
                  <Icon name="shield" size={17} /> Admin
                </Link>
              )}
              <button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-400 focus-ring">
                <Icon name="x" size={17} /> Log out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ── Main ── */}
      <main id="main" className="pb-24 pt-14 md:pb-10 md:pl-56">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-void-700/70 bg-void-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {MOBILE_NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={isActive(n.href) ? "page" : undefined}
            className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium focus-ring ${
              isActive(n.href) ? "text-pulse-300" : "text-ink-faint"
            }`}
          >
            <Icon name={n.icon} size={19} />
            {n.label}
          </Link>
        ))}
      </nav>

      <CommandPalette />
    </div>
  );
}

function AccountMenu({ user, logout }: { user: ShellUser; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-void-700 bg-void-800 text-lg transition-colors hover:border-pulse-400/40 focus-ring"
      >
        <span aria-hidden="true">{user.avatarId}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 animate-fade-up rounded-2xl border border-void-700 bg-void-850 shadow-card" role="menu">
          <div className="border-b border-void-700 px-4 py-3">
            <p className="font-display text-sm font-bold text-ink">{user.displayName}</p>
            <p className="text-xs text-ink-faint">{user.title}</p>
          </div>
          <div className="p-1.5 text-sm">
            <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-ink-dim hover:bg-void-800 hover:text-ink focus-ring">Profile</Link>
            <Link href="/settings" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-ink-dim hover:bg-void-800 hover:text-ink focus-ring">Settings</Link>
            <button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-rose-400 hover:bg-void-800 focus-ring">Log out</button>
          </div>
        </div>
      )}
    </div>
  );
}

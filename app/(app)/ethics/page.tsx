import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "AI Ethics Center" };
export const dynamic = "force-dynamic";

const BLOCKS: { href: string; icon: IconName; title: string; desc: string }[] = [
  {
    href: "/ethics/court",
    icon: "scale",
    title: "AI Ethics Court",
    desc: "Ten deployment cases - grading bots, hallway cameras, support predictors. You decide which questions must be answered first.",
  },
  {
    href: "/ethics/privacy",
    icon: "lock",
    title: "Privacy Challenge",
    desc: "Ten apps want your data. Decide what they'd genuinely need - and watch for overreach.",
  },
  {
    href: "/ethics/policy-builder",
    icon: "shield",
    title: "Build an AI Policy",
    desc: "Draft your own class rules for responsible AI use and publish them to your record.",
  },
  {
    href: "/academy/ai-ethics/ai-in-school",
    icon: "academy",
    title: "AI & Academic Integrity",
    desc: "The honest-use module: what's learning support vs. learning replacement, and how to stay inside the rules.",
  },
];

export default async function EthicsHub() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div>
      <SectionHeading
        kicker="Judgment wing"
        title="AI Ethics Center"
        description="AI ethics isn't a set of answers - it's a set of questions asked in advance. Practice asking them."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {BLOCKS.map((b) => (
          <Link key={b.href} href={b.href} className="focus-ring rounded-2xl">
            <GlassCard className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-volt-400/30 bg-void-800/60 text-volt-700 dark:text-volt-300">
                <Icon name={b.icon} size={22} />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">{b.title}</h3>
              <p className="mt-2 text-sm text-ink-dim">{b.desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { ETHICS_CASES } from "@/content/ethics";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

export const metadata: Metadata = { title: "AI Ethics Court" };
export const dynamic = "force-dynamic";

export default async function CourtPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const attempts = await db.table("challenge_attempts").find({ userId: user.id, kind: "ethics" });
  const bestByCase = new Map<string, number>();
  for (const a of attempts) {
    const m = /coverage=(\d+)/.exec(a.detail);
    if (m) bestByCase.set(a.challengeId, Math.max(bestByCase.get(a.challengeId) ?? 0, parseInt(m[1]!, 10)));
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/ethics" className="hover:text-ink focus-ring rounded">Ethics Center</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-300">Ethics Court</span>
      </nav>
      <SectionHeading
        kicker="Court is in session"
        title="AI Ethics Court"
        description="Each case: a real-world-style proposal. Your verdict isn't allow/ban — it's the set of questions you'd demand answered. Coverage is scored; ideology is not."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {ETHICS_CASES.map((c) => {
          const best = bestByCase.get(c.id);
          return (
            <Link key={c.id} href={`/ethics/court/${c.id}`} className="focus-ring rounded-2xl">
              <GlassCard className="h-full p-5 transition-all hover:-translate-y-1 hover:shadow-glow-volt">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">{c.setting}</span>
                  {best != null && (
                    <Chip tone={best >= 75 ? "mint" : best >= 60 ? "amber" : "rose"}>best {best}%</Chip>
                  )}
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-ink">{c.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-dim">{c.scenario}</p>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { DETECTIVE_CASES } from "@/content/detective";
import { SectionHeading } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "AI Detective" };
export const dynamic = "force-dynamic";

export default async function DetectivePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const attempts = await db.table("challenge_attempts").find({ userId: user.id, kind: "detective" });
  const solvedIds = new Set(attempts.filter((a) => a.correct).map((a) => a.challengeId));
  const triedIds = new Set(attempts.map((a) => a.challengeId));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          kicker="Case files"
          title="AI Detective"
          description="AI responses cross your desk. Some are solid; some invent facts, leak privacy, or oversell certainty. Investigate the evidence and call it."
        />
        <div className="glass-panel rounded-2xl px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Solved</p>
          <p className="font-display text-3xl font-black text-ink">{solvedIds.size}/{DETECTIVE_CASES.length}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {DETECTIVE_CASES.map((c) => {
          const solved = solvedIds.has(c.id);
          const tried = triedIds.has(c.id);
          return (
            <Link key={c.id} href={`/detective/${c.id}`} className="focus-ring rounded-2xl">
              <div className={`h-full rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift ${
                solved ? "border-mint-400/30 bg-mint-400/5" : "border-void-700 bg-void-800/80"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-[0.2em] text-ink-faint">CASE #{String(c.caseNo).padStart(4, "0")}</span>
                  <Chip tone={solved ? "mint" : tried ? "amber" : "neutral"}>
                    {solved ? "closed ✓" : tried ? "in progress" : "open"}
                  </Chip>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-ink">{c.title}</h3>
                <p className="mt-2 line-clamp-2 border-l-2 border-rose-400/40 pl-3 text-sm italic text-ink-dim">
                  “{c.response.slice(0, 120)}…”
                </p>
                <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-ink-faint">
                  <Icon name="detective" size={13} /> difficulty: {c.difficulty} · +150 XP on solve
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

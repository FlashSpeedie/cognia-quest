import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { FinalChallenge } from "@/components/final/FinalChallenge";

export const metadata: Metadata = { title: "Final AI Challenge" };
export const dynamic = "force-dynamic";

export default async function FinalChallengePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const existing = await db.table("final_results").get(user.id);

  return (
    <div>
      <div className="mb-8 text-center">
        <Chip tone="volt" className="font-mono uppercase tracking-[0.3em]">Mission 10 · FINAL BOSS</Chip>
        <h1 className="mt-3 font-display text-4xl font-black text-ink">The Deployment Decision</h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-dim">
          A fictional school proposes an AI system to flag students who may need support. Seven stages of judgment:
          data, bias, prompting, verification, and the final call. Everything you&apos;ve learned, in one report.
        </p>
      </div>
      {existing ? (
        <div>
          <GlassCard className="mx-auto mb-6 max-w-2xl border-mint-400/30 bg-mint-400/5 p-5 text-center">
            <p className="text-sm text-mint-700 dark:text-mint-300">Already completed - score {existing.totalScore}%. Here&apos;s your report card.</p>
          </GlassCard>
          <FinalChallenge previousTotal={existing.totalScore} />
        </div>
      ) : (
        <FinalChallenge />
      )}
      <p className="mt-6 text-center text-xs text-ink-faint">
        Fictional scenario · fictional data · scored for reasoning coverage, not ideology.
      </p>
    </div>
  );
}

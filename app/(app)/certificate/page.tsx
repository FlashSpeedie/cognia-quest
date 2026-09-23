import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { levelProgress } from "@/lib/levels";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { PrintButton } from "@/components/app/PrintButton";

export const metadata: Metadata = { title: "Certificate of Completion" };
export const dynamic = "force-dynamic";

export default async function CertificatePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const final = await db.table("final_results").get(user.id);
  const level = levelProgress(user.xpTotal);

  if (!final) {
    return (
      <GlassCard className="mx-auto max-w-lg p-10 text-center">
        <span className="text-4xl" aria-hidden="true">📜</span>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">The certificate awaits your capstone</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Complete the Final AI Challenge to unlock your Cognia Quest certificate of learning.
        </p>
        <LinkButton href="/final-challenge" className="mt-6">Take the Final Challenge</LinkButton>
      </GlassCard>
    );
  }

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <SectionHeading kicker="You earned it" title="Certificate of Completion" />
        <PrintButton />
      </div>

      <div className="print-page mx-auto max-w-3xl rounded-3xl border-2 border-volt-400/50 bg-gradient-to-b from-void-850 to-void-900 p-10 shadow-glow sm:p-14 print:border-black print:bg-white">
        <div className="text-center font-mono text-xs uppercase tracking-[0.4em] text-pulse-700 dark:text-pulse-300 print:text-black">Cognia Quest</div>
        <h1 className="mt-4 text-center font-display text-3xl font-black text-ink print:text-black">
          CERTIFICATE OF COMPLETION
        </h1>
        <div className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-pulse-400 to-transparent" />
        <p className="mt-8 text-center text-sm text-ink-dim print:text-gray-700">This certifies that</p>
        <p className="mt-2 text-center font-display text-4xl font-black text-ink print:text-black">{user.displayName}</p>
        <p className="mt-4 text-center text-sm text-ink-dim print:text-gray-700">
          completed the Cognia Quest learning pathway - a hands-on curriculum in artificial intelligence literacy.
        </p>
        <p className="mt-6 text-center font-mono text-xs uppercase tracking-widest text-pulse-700 dark:text-pulse-300 print:text-black">
          Title earned: {level.current.title} · Final challenge score: {final.totalScore}%
        </p>
        <ul className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-1.5 text-xs text-ink-dim print:text-gray-700">
          {[
            "AI Fundamentals", "Machine Learning", "Generative AI", "Prompt Engineering",
            "AI Ethics", "Critical Evaluation",
          ].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <span aria-hidden className="text-mint-700 dark:text-mint-300 print:text-black">✓</span> {t}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex items-end justify-between text-[10px] font-mono uppercase tracking-widest text-ink-faint print:text-gray-500">
          <span>Cognia Quest Learning Achievement</span>
          <span>{new Date(final.completedAt).toLocaleDateString()}</span>
        </div>
        <p className="mt-4 text-center text-[10px] text-ink-faint print:text-gray-500">
          Cognia Quest Learning Achievement - a record of completed interactive coursework, not an accredited certification.
        </p>
      </div>
    </div>
  );
}

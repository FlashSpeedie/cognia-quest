import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { detectiveCaseById } from "@/content/detective";
import { CaseInvestigation } from "@/components/detective/CaseInvestigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ case: string }> }): Promise<Metadata> {
  const c = detectiveCaseById((await params).case);
  return { title: c ? `Case #${c.caseNo}: ${c.title}` : "Detective" };
}

export default async function DetectiveCasePage({ params }: { params: Promise<{ case: string }> }) {
  const caseId = (await params).case;
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const c = detectiveCaseById(caseId);
  if (!c) notFound();
  const db = await getDb();
  const attempts = await db.table("challenge_attempts").find({ userId: user.id, kind: "detective", challengeId: c.id });
  const solved = attempts.some((a) => a.correct);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/detective" className="hover:text-ink focus-ring rounded">AI Detective</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-700 dark:text-pulse-300">Case #{c.caseNo}</span>
      </nav>
      <CaseInvestigation caseFile={c} alreadySolved={solved} />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { SectionHeading } from "@/components/ui/Card";
import { PromptLabClient } from "@/components/lab/PromptLabClient";

export const metadata: Metadata = { title: "Prompt Lab — AI Lab" };
export const dynamic = "force-dynamic";

export default async function PromptLabPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/lab" className="hover:text-ink focus-ring rounded">AI Lab</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-300">Prompt Lab</span>
      </nav>
      <SectionHeading
        kicker="Open bench"
        title="Prompt Lab"
        description="Free practice: write any prompt, watch the rubric react live, submit your best. The scorer is an honest 8-dimension heuristic — it rewards clarity, not flattery."
      />
      <div className="mt-8">
        <PromptLabClient taskId="free" />
      </div>
    </div>
  );
}

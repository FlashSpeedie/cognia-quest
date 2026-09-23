import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { SectionHeading } from "@/components/ui/Card";
import { ToolSelector } from "@/components/lab/ToolSelector";

export const metadata: Metadata = { title: "AI Tool Selector - AI Lab" };
export const dynamic = "force-dynamic";

export default async function ToolSelectorPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/lab" className="hover:text-ink focus-ring rounded">AI Lab</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-700 dark:text-pulse-300">Tool Selector</span>
      </nav>
      <SectionHeading
        kicker="Judgment drill"
        title="AI Tool Selector"
        description="For each task, pick the right category of tool. Sometimes the right answer is AI. Sometimes it's a calculator. Knowing which is the skill."
      />
      <div className="mt-8 max-w-2xl">
        <ToolSelector />
      </div>
    </div>
  );
}

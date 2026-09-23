import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { SectionHeading } from "@/components/ui/Card";
import { DataExplorer } from "@/components/lab/DataExplorer";

export const metadata: Metadata = { title: "Dataset Explorer - AI Lab" };
export const dynamic = "force-dynamic";

export default async function DataExplorerPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/lab" className="hover:text-ink focus-ring rounded">AI Lab</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-700 dark:text-pulse-300">Dataset Explorer</span>
      </nav>
      <SectionHeading
        kicker="Forensics"
        title="Dataset Explorer"
        description="Before anyone trains on data, someone should have looked at it. Sort it, filter it, and list what's wrong with it."
      />
      <div className="mt-8">
        <DataExplorer />
      </div>
    </div>
  );
}

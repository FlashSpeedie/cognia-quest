import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { SectionHeading } from "@/components/ui/Card";
import { BiasSim } from "@/components/lab/BiasSim";

export const metadata: Metadata = { title: "Bias Simulation - AI Lab" };
export const dynamic = "force-dynamic";

export default async function BiasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/lab" className="hover:text-ink focus-ring rounded">AI Lab</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-700 dark:text-pulse-300">Bias Simulation</span>
      </nav>
      <SectionHeading
        kicker="Investigation · fictional data"
        title="The Scholarship Model"
        description="Models learn where you let them look. Find the feature leaking geography into this scholarship model, remove it, and verify the gap closes. Educational simulation with fictional applicants."
      />
      <div className="mt-8">
        <BiasSim />
      </div>
    </div>
  );
}

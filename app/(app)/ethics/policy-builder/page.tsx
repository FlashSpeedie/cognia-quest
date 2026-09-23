import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { SectionHeading } from "@/components/ui/Card";
import { PolicyBuilder } from "@/components/ethics/PolicyBuilder";

export const metadata: Metadata = { title: "Policy Builder - Ethics" };
export const dynamic = "force-dynamic";

export default async function PolicyBuilderPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/ethics" className="hover:text-ink focus-ring rounded">Ethics Center</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-700 dark:text-pulse-300">Policy Builder</span>
      </nav>
      <SectionHeading
        kicker="Mission 09"
        title="Build a Classroom AI Policy"
        description="Write the rules you'd actually want to live under. This is what thoughtful AI governance looks like at classroom scale."
      />
      <div className="mt-8">
        <PolicyBuilder />
      </div>
    </div>
  );
}

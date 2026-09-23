import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { SectionHeading } from "@/components/ui/Card";
import { PrivacyChallenge } from "@/components/ethics/PrivacyChallenge";

export const metadata: Metadata = { title: "Privacy Challenge - Ethics" };
export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/ethics" className="hover:text-ink focus-ring rounded">Ethics Center</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-700 dark:text-pulse-300">Privacy Challenge</span>
      </nav>
      <SectionHeading
        kicker="Data minimization"
        title="Privacy Challenge"
        description="Every app wants more data than it needs. For each scenario, select only what's genuinely necessary. Nothing else gets in."
      />
      <div className="mt-8">
        <PrivacyChallenge />
      </div>
    </div>
  );
}

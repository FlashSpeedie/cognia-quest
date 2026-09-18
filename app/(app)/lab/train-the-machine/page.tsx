import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { SectionHeading } from "@/components/ui/Card";
import { TrainTheMachine } from "@/components/lab/TrainTheMachine";
import Link from "next/link";

export const metadata: Metadata = { title: "Train the Machine — AI Lab" };
export const dynamic = "force-dynamic";

export default async function TrainMachinePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/lab" className="hover:text-ink focus-ring rounded">AI Lab</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-300">Train the Machine</span>
      </nav>
      <SectionHeading
        kicker="Simulation · classification"
        title="Train the Machine"
        description="Predict who passes from study + sleep hours. You control the data — and its every flaw teaches you something real about machine learning. Educational simulation, fully deterministic."
      />
      <div className="mt-8">
        <TrainTheMachine />
      </div>
    </div>
  );
}

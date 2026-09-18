import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { SectionHeading, Card } from "@/components/ui/Card";
import { SettingsForm } from "@/components/app/SettingsForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="max-w-2xl">
      <SectionHeading kicker="Control panel" title="Settings" description="AI Quest adapts to how you read, move, and focus. All privacy-respecting, all reversible." />
      <Card className="mt-8 p-6">
        <SettingsForm initial={user.preferences} />
      </Card>
      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-ink">Your data</h2>
        <p className="mt-2 text-sm text-ink-dim">
          AI Quest stores only your account (email, display name) and learning activity. No tracking, no ads,
          no sale of data — the same privacy principles this platform teaches.
        </p>
        <p className="mt-2 text-sm text-ink-dim">
          Theme and motion preferences apply instantly and persist on this device too.
        </p>
      </Card>
    </div>
  );
}

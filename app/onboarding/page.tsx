import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { OnboardingWizard } from "@/components/auth/OnboardingWizard";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("Welcome");
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.onboarding.completed) redirect("/dashboard");
  return <OnboardingWizard name={user.displayName} />;
}

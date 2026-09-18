import { json, requireUser } from "@/server/http";

/** Lightweight client-readable session snapshot. */
export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const u = auth.user;
  return json({
    user: {
      id: u.id,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      title: u.title,
      avatarId: u.avatarId,
      xpTotal: u.xpTotal,
      onboarding: u.onboarding,
      preferences: u.preferences,
      isDemo: u.isDemo,
    },
  });
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { AppShell } from "@/components/shell/AppShell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.onboarding.completed) redirect("/onboarding");

  const db = await getDb();
  const unread = (await db.table("notifications").find({ userId: user.id, read: false })).length;

  return (
    <AppShell
      user={{
        id: user.id,
        displayName: user.displayName,
        title: user.title,
        avatarId: user.avatarId,
        xpTotal: user.xpTotal,
        role: user.role,
      }}
      unreadCount={unread}
    >
      {children}
    </AppShell>
  );
}

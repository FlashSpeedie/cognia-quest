import type { Metadata } from "next";
import { getDb } from "@/server/db/db";
import { getSessionUser } from "@/server/auth/session";
import { levelFor } from "@/lib/levels";
import { SectionHeading } from "@/components/ui/Card";
import { UserTable, type AdminUserRow } from "@/components/admin/UserTable";

export const metadata: Metadata = { title: "Admin - Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const caller = await getSessionUser();
  if (!caller || caller.role !== "admin") return null;

  const db = await getDb();
  const [users, lessons, missions] = await Promise.all([
    db.table("users").all(),
    db.table("lesson_progress").all(),
    db.table("mission_progress").all(),
  ]);

  const lessonDone = new Map<string, number>();
  for (const l of lessons) {
    if (l.status === "completed") lessonDone.set(l.userId, (lessonDone.get(l.userId) ?? 0) + 1);
  }
  const missionDone = new Map<string, number>();
  for (const m of missions) {
    if (m.status === "completed") missionDone.set(m.userId, (missionDone.get(m.userId) ?? 0) + 1);
  }

  const rows: AdminUserRow[] = users
    .sort((a, b) => b.xpTotal - a.xpTotal)
    .map((u) => ({
      id: u.id,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      isDemo: u.isDemo,
      xp: u.xpTotal,
      levelTitle: levelFor(u.xpTotal).title,
      status: u.status ?? "active",
      createdAt: u.createdAt,
      lessonsCompleted: lessonDone.get(u.id) ?? 0,
      missionsCompleted: missionDone.get(u.id) ?? 0,
      lastActivity: null,
    }));

  return (
    <div>
      <SectionHeading
        kicker="Console"
        title="Users"
        description="Search, filter, and manage every registered account. Click a name for full detail."
      />
      <div className="mt-8">
        <UserTable users={rows} />
      </div>
    </div>
  );
}

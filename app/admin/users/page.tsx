import type { Metadata } from "next";
import { getDb } from "@/server/db/db";
import { getUsers } from "@/server/services/admin";
import { SectionHeading, Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

export const metadata: Metadata = { title: "Admin — Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const db = await getDb();
  const users = await getUsers(db);

  return (
    <div>
      <SectionHeading kicker="Roster" title="Users" description="All registered accounts. Read-only — role changes require the database, deliberately." />
      <Card className="mt-8 overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-void-700 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Final</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-void-700/40">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{u.displayName}</p>
                  <p className="text-xs text-ink-faint">{u.email}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{u.level.title}</td>
                <td className="px-4 py-3 font-mono">{u.xp.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.finalScore != null ? `${u.finalScore}%` : "—"}</td>
                <td className="px-4 py-3">
                  <Chip tone={u.role === "admin" ? "amber" : u.isDemo ? "volt" : "neutral"}>
                    {u.role === "admin" ? "admin" : u.isDemo ? "demo" : "student"}
                  </Chip>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-faint">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

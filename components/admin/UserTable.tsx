"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";

export interface AdminUserRow {
  id: string;
  displayName: string;
  email: string;
  role: "student" | "admin";
  isDemo: boolean;
  xp: number;
  levelTitle: string;
  status: "active" | "suspended";
  createdAt: string;
  lessonsCompleted: number;
  missionsCompleted: number;
  lastActivity: string | null;
}

type SortKey = "displayName" | "xp" | "createdAt" | "lessonsCompleted" | "missionsCompleted";

export function UserTable({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "admin" | "suspended">("all");
  const [sortKey, setSortKey] = useState<SortKey>("xp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let rows = users;
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter === "student") rows = rows.filter((u) => u.role === "student" && !u.isDemo);
    if (roleFilter === "admin") rows = rows.filter((u) => u.role === "admin");
    if (roleFilter === "suspended") rows = rows.filter((u) => u.status === "suspended");
    return [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "displayName") return a.displayName.localeCompare(b.displayName) * dir;
      if (sortKey === "createdAt") return a.createdAt.localeCompare(b.createdAt) * dir;
      return ((a[sortKey] as number) - (b[sortKey] as number)) * dir;
    });
  }, [users, query, roleFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const th = (key: SortKey, label: string) => (
    <th className="cursor-pointer px-4 py-3 select-none hover:text-ink" onClick={() => toggleSort(key)} scope="col">
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === key && <Icon name={sortDir === "asc" ? "arrow-left" : "arrow-right"} size={10} />}
      </span>
    </th>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="user-search" className="sr-only">Search users</label>
        <input
          id="user-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full max-w-xs rounded-lg border border-void-700 bg-void-900 px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus-ring"
        />
        <div className="flex gap-1.5" role="radiogroup" aria-label="Filter users">
          {([
            ["all", "All"],
            ["student", "Students"],
            ["admin", "Admins"],
            ["suspended", "Suspended"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              role="radio"
              aria-checked={roleFilter === key}
              onClick={() => setRoleFilter(key)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-ring ${
                roleFilter === key
                  ? "border-pulse-600 bg-pulse-50 text-pulse-700 dark:bg-pulse-950/50 dark:text-pulse-300"
                  : "border-void-700 text-ink-dim hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="ml-auto text-xs text-ink-faint" aria-live="polite">
          {filtered.length} of {users.length} accounts
        </p>
      </div>

      <Card className="mt-4 overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-void-700 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">
              {th("displayName", "Student")}
              {th("xp", "XP")}
              <th className="px-4 py-3" scope="col">Level</th>
              {th("lessonsCompleted", "Lessons")}
              {th("missionsCompleted", "Missions")}
              <th className="px-4 py-3" scope="col">Status</th>
              <th className="px-4 py-3" scope="col">Role</th>
              {th("createdAt", "Joined")}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-void-700/40 transition-colors hover:bg-void-850">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="group block focus-ring rounded">
                    <p className="font-semibold text-ink group-hover:text-pulse-600 dark:group-hover:text-pulse-300">{u.displayName}</p>
                    <p className="text-xs text-ink-faint">{u.email}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{u.xp.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs">{u.levelTitle}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.lessonsCompleted}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.missionsCompleted}</td>
                <td className="px-4 py-3">
                  <Chip tone={u.status === "suspended" ? "rose" : "mint"}>{u.status}</Chip>
                </td>
                <td className="px-4 py-3">
                  <Chip tone={u.role === "admin" ? "amber" : u.isDemo ? "volt" : "neutral"}>
                    {u.role === "admin" ? "admin" : u.isDemo ? "demo" : "student"}
                  </Chip>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-faint">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-ink-faint">No accounts match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

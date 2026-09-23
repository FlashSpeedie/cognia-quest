"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

interface Notif {
  id: string;
  kind: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const KIND_ICON: Record<string, IconName> = {
  achievement: "badge",
  mission: "missions",
  level: "bolt",
  info: "flag",
};

export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[] | null>(null);
  const [unread, setUnread] = useState(initialUnread);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      const r = await fetch("/api/notifications");
      if (r.ok) {
        const d = (await r.json()) as { notifications: Notif[]; unread: number };
        setItems(d.notifications);
        setUnread(d.unread);
        if (d.unread > 0) {
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
          });
          setUnread(0);
        }
      }
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className="relative rounded-xl border border-void-700 bg-void-800/70 p-2 text-ink-dim transition-colors hover:text-ink focus-ring"
      >
        <Icon name="bolt" size={17} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[86vw] animate-fade-up rounded-xl border border-void-700 bg-void-900 shadow-pop">
          <p className="border-b border-void-700 px-4 py-3 font-display text-sm font-bold text-ink">Notifications</p>
          <div className="max-h-80 overflow-y-auto">
            {!items && <p className="px-4 py-6 text-center text-sm text-ink-faint">Loadingâ€¦</p>}
            {items && items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink-faint">All quiet. Your next badge will land here.</p>
            )}
            {items?.map((n) => (
              <div key={n.id} className="flex gap-3 border-b border-void-700/50 px-4 py-3 last:border-0">
                <span className="mt-0.5 text-pulse-700 dark:text-pulse-300">
                  <Icon name={KIND_ICON[n.kind] ?? "flag"} size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="mt-0.5 text-xs text-ink-dim">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

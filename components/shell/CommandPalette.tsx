"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

interface Hit {
  kind: string;
  title: string;
  detail: string;
  href: string;
}

const COMMANDS = [
  { label: "Open Dashboard", href: "/dashboard" },
  { label: "Open Academy", href: "/academy" },
  { label: "Open AI Lab", href: "/lab" },
  { label: "Open AI Detective", href: "/detective" },
  { label: "Open Ethics Center", href: "/ethics" },
  { label: "View Missions", href: "/missions" },
  { label: "View Achievements", href: "/achievements" },
  { label: "My Progress", href: "/progress" },
  { label: "Quest Map", href: "/map" },
  { label: "Glossary", href: "/glossary" },
  { label: "AI Careers", href: "/careers" },
  { label: "Certificate", href: "/certificate" },
  { label: "Final Challenge", href: "/final-challenge" },
  { label: "Toggle Theme", action: "theme" },
  { label: "Toggle Reduced Motion", action: "motion" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = "palette-list";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHits([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (r.ok) {
          const d = (await r.json()) as { hits: Hit[] };
          setHits(d.hits);
          setActive(0);
        }
      } catch {
        /* offline: stay quiet */
      }
    }, 150);
    return () => clearTimeout(t);
  }, [query]);

  const filteredCommands = COMMANDS.filter((c) => !query || c.label.toLowerCase().includes(query.toLowerCase()));

  const runCommand = useCallback(
    (c: (typeof COMMANDS)[number]) => {
      if (c.action === "theme") {
        const el = document.documentElement;
        const light = el.classList.toggle("light");
        try {
          localStorage.setItem("aq-theme", light ? "light" : "dark");
        } catch {}
      } else if (c.action === "motion") {
        const el = document.documentElement;
        const reduced = el.classList.toggle("reduce-motion");
        try {
          localStorage.setItem("aq-motion", reduced ? "reduced" : "normal");
        } catch {}
        // persist server-side preference too
        fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences: { reducedMotion: reduced } }),
        }).catch(() => {});
      } else if (c.href) {
        router.push(c.href);
      }
      setOpen(false);
    },
    [router],
  );

  const items: ({ type: "cmd"; cmd: (typeof COMMANDS)[number] } | { type: "hit"; hit: Hit })[] = [
    ...hits.map((h) => ({ type: "hit" as const, hit: h })),
    ...filteredCommands.map((c) => ({ type: "cmd" as const, cmd: c })),
  ];

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = items[active];
      if (!it) return;
      if (it.type === "cmd") runCommand(it.cmd);
      else {
        router.push(it.hit.href);
        setOpen(false);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-void-950/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="mx-auto mt-[14vh] w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="glass-panel overflow-hidden rounded-2xl shadow-card">
          <div className="flex items-center gap-3 border-b border-void-700 px-4 py-3">
            <Icon name="search" size={18} className="text-ink-faint" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search lessons, missions, glossary — or type a command"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={items[active] ? `pal-${active}` : undefined}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <kbd className="rounded border border-void-700 bg-void-800 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">esc</kbd>
          </div>
          <ul id={listId} role="listbox" className="max-h-[46vh] overflow-y-auto p-2">
            {items.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-ink-faint">
                {query ? `No results for “${query}”. Try “token”, “overfitting”, or “bias”.` : "Type to search everything."}
              </li>
            )}
            {items.map((it, i) => {
              const activeCls = i === active ? "bg-pulse-400/10 text-ink" : "text-ink-dim";
              if (it.type === "hit") {
                return (
                  <li key={`h-${it.hit.href}-${i}`} id={`pal-${i}`} role="option" aria-selected={i === active}>
                    <button
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${activeCls}`}
                      onClick={() => {
                        router.push(it.hit.href);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setActive(i)}
                    >
                      <span className="rounded-md border border-void-700 bg-void-800 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink-faint">
                        {it.hit.kind}
                      </span>
                      <span className="flex-1 truncate">{it.hit.title}</span>
                      <span className="truncate text-xs text-ink-faint">{it.hit.detail}</span>
                    </button>
                  </li>
                );
              }
              return (
                <li key={`c-${it.cmd.label}`} id={`pal-${i}`} role="option" aria-selected={i === active}>
                  <button
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${activeCls}`}
                    onClick={() => runCommand(it.cmd)}
                    onMouseEnter={() => setActive(i)}
                  >
                    <Icon name="terminal" size={14} className="text-ink-faint" />
                    {it.cmd.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-void-700 px-4 py-2 text-[11px] text-ink-faint">
            <kbd className="rounded border border-void-700 bg-void-800 px-1">↑↓</kbd> navigate ·{" "}
            <kbd className="rounded border border-void-700 bg-void-800 px-1">↵</kbd> open ·{" "}
            <kbd className="rounded border border-void-700 bg-void-800 px-1">ctrl k</kbd> toggle
          </div>
        </div>
      </div>
    </div>
  );
}

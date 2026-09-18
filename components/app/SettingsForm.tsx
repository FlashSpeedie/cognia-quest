"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Preferences } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

export function SettingsForm({ initial }: { initial: Preferences }) {
  const [prefs, setPrefs] = useState<Preferences>(initial);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const { push } = useToast();
  const router = useRouter();

  async function save(patch: Partial<Preferences>, key: string) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSavingKey(key);
    // apply locally instantly
    if (patch.theme !== undefined) {
      const light = patch.theme === "light";
      document.documentElement.classList.toggle("light", light);
      try { localStorage.setItem("aq-theme", light ? "light" : "dark"); } catch {}
    }
    if (patch.reducedMotion !== undefined) {
      document.documentElement.classList.toggle("reduce-motion", patch.reducedMotion);
      try { localStorage.setItem("aq-motion", patch.reducedMotion ? "reduced" : "normal"); } catch {}
    }
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: patch }),
      });
      if (!res.ok) throw new Error();
      push({ kind: "success", title: "Saved", body: "Preference updated." });
      router.refresh();
    } catch {
      push({ kind: "error", title: "Couldn't save", body: "Check your connection and retry." });
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="flex items-center gap-2 font-display font-bold text-ink">
          <Icon name="sun" size={16} className="text-amber-300" /> Appearance
        </legend>
        <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Theme">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={prefs.theme === t}
              onClick={() => save({ theme: t }, "theme")}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold capitalize focus-ring ${
                prefs.theme === t ? "border-pulse-400 bg-pulse-400/15 text-pulse-300" : "border-void-700 text-ink-dim hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-void-700 pt-6">
        <legend className="flex items-center gap-2 font-display font-bold text-ink">Accessibility</legend>
        <Toggle
          label="Reduce motion"
          hint="Minimize animations across the platform."
          checked={prefs.reducedMotion}
          onChange={(v) => save({ reducedMotion: v }, "motion")}
        />
      </fieldset>

      <fieldset className="border-t border-void-700 pt-6">
        <legend className="font-display font-bold text-ink">Sound</legend>
        <Toggle
          label="Sound effects"
          hint="Gentle chimes on level-ups and badges. Off by default."
          checked={prefs.sound}
          onChange={(v) => save({ sound: v }, "sound")}
        />
      </fieldset>

      <fieldset className="border-t border-void-700 pt-6">
        <legend className="font-display font-bold text-ink">Notifications</legend>
        <Toggle label="Achievement alerts" checked={prefs.notifications.achievements} onChange={(v) => save({ notifications: { ...prefs.notifications, achievements: v } }, "n1")} />
        <Toggle label="Mission alerts" checked={prefs.notifications.missions} onChange={(v) => save({ notifications: { ...prefs.notifications, missions: v } }, "n2")} />
      </fieldset>

      <fieldset className="border-t border-void-700 pt-6">
        <legend className="font-display font-bold text-ink">Privacy</legend>
        <Toggle
          label="Show me on the leaderboard"
          hint="Off by default. Only your display name and XP are ever shown."
          checked={prefs.leaderboardOptIn}
          onChange={(v) => save({ leaderboardOptIn: v }, "lb")}
        />
      </fieldset>
      <span className="sr-only" aria-live="polite">{savingKey ? "Saving setting" : ""}</span>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mt-3 flex items-start justify-between gap-4">
      <div>
        <span id={`t-${label}`} className="text-sm font-medium text-ink">{label}</span>
        {hint && <p className="text-xs text-ink-faint">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-ring ${checked ? "bg-pulse-500" : "bg-void-700"}`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

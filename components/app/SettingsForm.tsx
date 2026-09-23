"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Preferences } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";

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
      const dark = patch.theme === "dark";
      document.documentElement.classList.toggle("dark", dark);
      try { localStorage.setItem("aq-theme", dark ? "dark" : "light"); } catch {}
    }
    if (patch.reducedMotion !== undefined) {
      document.documentElement.classList.toggle("reduce-motion", patch.reducedMotion);
      try { localStorage.setItem("aq-motion", patch.reducedMotion ? "reduced" : "normal"); } catch {}
    }
    if (patch.sound !== undefined) {
      try { localStorage.setItem("aq-sound", patch.sound ? "on" : "off"); } catch {}
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
          <Icon name="sun" size={16} className="text-amber-500" /> Appearance
        </legend>
        <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Theme">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={prefs.theme === t}
              onClick={() => save({ theme: t }, "theme")}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition-colors focus-ring ${
                prefs.theme === t
                  ? "border-pulse-600 bg-pulse-50 text-pulse-700 dark:bg-pulse-950/50 dark:text-pulse-700 dark:text-pulse-300"
                  : "border-void-700 text-ink-dim hover:border-ink-faint hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-void-700 pt-6">
        <legend className="flex items-center gap-2 font-display font-bold text-ink">Accessibility</legend>
        <Switch
          label="Reduce motion"
          hint="Minimize animations across the platform."
          checked={prefs.reducedMotion}
          onChange={(v) => save({ reducedMotion: v }, "motion")}
        />
      </fieldset>

      <fieldset className="border-t border-void-700 pt-6">
        <legend className="font-display font-bold text-ink">Sound</legend>
        <Switch
          label="Sound effects"
          hint="Gentle chimes on level-ups and badges. Off by default."
          checked={prefs.sound}
          onChange={(v) => save({ sound: v }, "sound")}
        />
      </fieldset>

      <fieldset className="border-t border-void-700 pt-6">
        <legend className="font-display font-bold text-ink">Notifications</legend>
        <Switch label="Achievement alerts" checked={prefs.notifications.achievements} onChange={(v) => save({ notifications: { ...prefs.notifications, achievements: v } }, "n1")} />
        <Switch label="Mission alerts" checked={prefs.notifications.missions} onChange={(v) => save({ notifications: { ...prefs.notifications, missions: v } }, "n2")} />
      </fieldset>

      <fieldset className="border-t border-void-700 pt-6">
        <legend className="font-display font-bold text-ink">Privacy</legend>
        <Switch
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

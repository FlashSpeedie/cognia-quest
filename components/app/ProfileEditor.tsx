"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const AVATARS = ["🚀", "🛰️", "🧠", "🤖", "⚡", "🔬", "🎯", "🛡️", "💡", "🌌", "🧬", "🦾"];

export function ProfileEditor({ initialName, initialAvatar }: { initialName: string; initialAvatar: string }) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim(), avatarId: avatar }),
      });
      if (res.ok) {
        push({ kind: "success", title: "Profile saved", body: "Your identity has been updated." });
        router.refresh();
      } else {
        const d = (await res.json()) as { error?: string };
        push({ kind: "error", title: "Couldn't save", body: d.error ?? "Try again." });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
      <div>
        <p className="mb-2 text-sm font-medium text-ink" id="avatar-label">Avatar</p>
        <div role="radiogroup" aria-labelledby="avatar-label" className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              role="radio"
              aria-checked={avatar === a}
              aria-label={`Avatar ${a}`}
              onClick={() => setAvatar(a)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition-all focus-ring ${
                avatar === a ? "border-pulse-400 bg-pulse-400/15 shadow-glow" : "border-void-700 bg-void-800 hover:border-pulse-400/40"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={save} loading={saving} disabled={name.trim().length < 2}>
        Save changes
      </Button>
    </div>
  );
}

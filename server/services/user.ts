import type { Db } from "@/server/db/db";
import type { Preferences, User } from "@/lib/types";
import { z } from "zod";
import { logActivity } from "./activity";

export const onboardingSchema = z.object({
  learnerType: z.enum(["beginner", "explorer", "coder", "researcher", "creative", "engineer"]),
  goal: z.enum(["understand", "school", "prompting", "ml", "expert"]),
});

export async function completeOnboarding(db: Db, user: User, input: unknown) {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid onboarding choices" };
  await db.table("users").update(user.id, {
    onboarding: { completed: true, learnerType: parsed.data.learnerType, goal: parsed.data.goal },
  });
  await logActivity(db, user.id, "onboarding", "Completed onboarding");
  return { ok: true as const };
}

export async function skipOnboarding(db: Db, user: User) {
  await db.table("users").update(user.id, { onboarding: { completed: true } });
  return { ok: true as const };
}

export const preferencesSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  reducedMotion: z.boolean().optional(),
  sound: z.boolean().optional(),
  leaderboardOptIn: z.boolean().optional(),
  notifications: z
    .object({ achievements: z.boolean().optional(), missions: z.boolean().optional() })
    .optional(),
});

export async function updatePreferences(db: Db, user: User, patch: unknown) {
  const parsed = preferencesSchema.safeParse(patch);
  if (!parsed.success) return { ok: false as const, error: "Invalid preferences" };
  const merged: Preferences = {
    ...user.preferences,
    ...parsed.data,
    notifications: { ...user.preferences.notifications, ...(parsed.data.notifications ?? {}) },
  };
  await db.table("users").update(user.id, { preferences: merged });
  return { ok: true as const, preferences: merged };
}

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2)
    .max(24)
    .regex(/^[a-zA-Z0-9 _-]+$/)
    .optional(),
  avatarId: z.string().max(8).optional(),
});

export async function updateProfile(db: Db, user: User, patch: unknown) {
  const parsed = profileSchema.safeParse(patch);
  if (!parsed.success) return { ok: false as const, error: "Invalid profile" };
  const update: Partial<User> = {};
  if (parsed.data.displayName) update.displayName = parsed.data.displayName;
  if (parsed.data.avatarId) update.avatarId = parsed.data.avatarId;
  await db.table("users").update(user.id, update);
  return { ok: true as const };
}

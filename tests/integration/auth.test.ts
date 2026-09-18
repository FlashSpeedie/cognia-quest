import { describe, it, expect } from "vitest";
import { freshDb } from "./setup";
import { registerUser, loginUser } from "@/server/services/authService";
import { completeOnboarding } from "@/server/services/user";

describe("authentication service", () => {
  it("registers, hashes passwords, and rejects duplicates", async () => {
    const db = await freshDb();
    const r = await registerUser(db, { email: "New@Test.dev", displayName: "Newbie", password: "supersecret1" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.user.email).toBe("new@test.dev"); // normalized
      expect(r.user.passwordHash).not.toContain("supersecret");
      expect(r.user.passwordHash).toMatch(/^s1:/);
      expect(r.user.role).toBe("student");
      expect(r.user.xpTotal).toBe(0);
    }
    const dup = await registerUser(db, { email: "new@test.dev", displayName: "Copy", password: "another123" });
    expect(dup.ok).toBe(false);
  });

  it("rejects invalid registration input", async () => {
    const db = await freshDb();
    expect((await registerUser(db, { email: "nope", displayName: "X", password: "short" })).ok).toBe(false);
    expect((await registerUser(db, { email: "a@b.co", displayName: "颜<script>", password: "longenough1" })).ok).toBe(false);
    expect((await registerUser(db, { email: "a@b.co", displayName: "Fine Name", password: "short" })).ok).toBe(false);
  });

  it("logs in with correct credentials only", async () => {
    const db = await freshDb();
    await registerUser(db, { email: "u@t.dev", displayName: "User", password: "password12" });
    expect((await loginUser(db, { email: "u@t.dev", password: "password12" })).ok).toBe(true);
    expect((await loginUser(db, { email: "u@t.dev", password: "wrongwrong" })).ok).toBe(false);
    expect((await loginUser(db, { email: "ghost@t.dev", password: "password12" })).ok).toBe(false);
  });

  it("stores onboarding choices", async () => {
    const db = await freshDb();
    const r = await registerUser(db, { email: "ob@t.dev", displayName: "Onbo", password: "password12" });
    if (!r.ok) throw new Error("reg failed");
    const done = await completeOnboarding(db, r.user, { learnerType: "coder", goal: "ml" });
    expect(done.ok).toBe(true);
    const u = await db.table("users").get(r.user.id);
    expect(u!.onboarding.completed).toBe(true);
    expect(u!.onboarding.learnerType).toBe("coder");
  });
});

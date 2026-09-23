"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

/**
 * Server-authorized admin actions for a single user. Every call goes
 * through /api/admin/users/[id] which re-checks the caller's admin role
 * server-side - a student hitting these endpoints gets 403.
 */
export function UserAdminActions({
  userId,
  displayName,
  status,
  isAdmin,
}: {
  userId: string;
  displayName: string;
  status: "active" | "suspended";
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: "active" | "suspended") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Could not update status");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error - please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, { method: "POST" });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Could not delete account");
        return;
      }
      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("Network error - please try again.");
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  // Admin accounts are protected from both actions by the API; hide the
  // controls too so the UI never offers something the server would reject.
  if (isAdmin) {
    return <p className="text-xs text-ink-faint">Admin accounts are managed at the database level.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "active" ? (
        <Button variant="secondary" size="sm" loading={busy} onClick={() => setStatus("suspended")}>
          Suspend account
        </Button>
      ) : (
        <Button variant="success" size="sm" loading={busy} onClick={() => setStatus("active")}>
          Reactivate account
        </Button>
      )}
      <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy}>
        Delete account
      </Button>
      {error && <p role="alert" className="w-full text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this account permanently?">
        <p className="text-sm leading-relaxed text-ink-dim">
          This will permanently delete <strong className="text-ink">{displayName}</strong> and every
          record tied to their account: XP, lessons, missions, badges, attempts, and activity.
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={busy} onClick={deleteUser}>
            Delete permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}

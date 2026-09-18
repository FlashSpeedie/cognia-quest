/** Small shared helper: record a sim run from a client component. */
export async function recordSimFeedback(simId: string, result: Record<string, unknown>) {
  try {
    await fetch("/api/sim/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simId, result }),
    });
  } catch {
    // offline-safe: silently drop — the UI told the user nothing persisted
  }
}

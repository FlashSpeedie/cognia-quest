/** Tiny WebAudio chimes - gated behind the "sound" setting. Never autoplays. */

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem("aq-sound") === "on";
  } catch {
    return false;
  }
}

export function playChime(kind: "levelup" | "badge" | "success" = "success") {
  if (!soundEnabled()) return;
  try {
    const Ctx: typeof AudioContext = window.AudioContext;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    gain.connect(ctx.destination);
    const seq =
      kind === "levelup" ? [523, 659, 784, 1047] : kind === "badge" ? [660, 880] : [523, 784];
    seq.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.5);
    });
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    // audio unavailable - ignore
  }
}

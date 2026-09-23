"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";

/** ── Next-token game: play the language model. ─────────────────────── */
const ROUNDS = [
  {
    prefix: "The mitochondria is the powerhouse of the",
    options: [
      { t: "cell", p: 81, correct: true },
      { t: "universe", p: 6 },
      { t: "sandwich", p: 1 },
      { t: "protractor", p: 0.5 },
    ],
  },
  {
    prefix: "To make bread, first mix flour, water, and",
    options: [
      { t: "yeast", p: 64, correct: true },
      { t: "bricks", p: 0.4 },
      { t: "homework", p: 0.2 },
      { t: "Wednesday", p: 0.1 },
    ],
  },
  {
    prefix: "The moon landing happened in 19",
    options: [
      { t: "69", p: 72, correct: true },
      { t: "42", p: 3 },
      { t: "78", p: 1 },
      { t: "00", p: 0.5 },
    ],
  },
];

export function NextToken({ onComplete }: { onComplete?: () => void }) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const r = ROUNDS[Math.min(round, ROUNDS.length - 1)]!;
  const finished = round >= ROUNDS.length;

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (r.options[i]!.correct) setScore((s) => s + 1);
  }

  function next() {
    if (round + 1 >= ROUNDS.length) {
      setRound(round + 1);
      onComplete?.();
    } else {
      setRound(round + 1);
      setPicked(null);
    }
  }

  if (finished) {
    return (
      <GlassCard className="p-5 text-center">
        <p className="font-display text-xl font-bold text-ink">You played the model: {score}/{ROUNDS.length}</p>
        <p className="mt-2 text-sm text-ink-dim">
          Notice what you just did: you predicted the most <em>likely</em> word, not the <em>truest</em> one.
          That&apos;s all a language model does - billions of times, parameter by parameter. Plausibility, not truth.
        </p>
      </GlassCard>
    );
  }

  return (
    <div>
      <GlassCard className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Round {round + 1}/{ROUNDS.length} - predict the most likely next token</p>
        <p className="mt-2 font-mono text-sm text-ink">
          {r.prefix}
          <span className="ml-1 inline-block h-4 w-2 animate-pulse-soft bg-pulse-400 align-middle" aria-hidden="true" />
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {r.options.map((o, i) => {
            const showProbs = picked !== null;
            return (
              <button
                key={o.t}
                onClick={() => pick(i)}
                disabled={picked !== null}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all focus-ring ${
                  picked === null
                    ? "border-void-700 text-ink hover:border-pulse-400/50"
                    : picked === i
                      ? o.correct
                        ? "border-mint-400 bg-mint-400/15 text-mint-700 dark:text-mint-300"
                        : "border-rose-400 bg-rose-400/15 text-rose-400"
                      : o.correct
                        ? "border-mint-400/40 text-mint-700 dark:text-mint-300"
                        : "border-void-700 text-ink-faint"
                }`}
              >
                {o.t}
                {showProbs && <span className="ml-2 font-mono text-[10px] text-ink-faint">{o.p}%</span>}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-ink-dim">
              {r.options[picked]!.correct ? "Most likely - that's how it would continue." : "Possible, but unlikely. Models sample from likely tokens, which is why they stay plausible."}
            </p>
            <Button size="sm" onClick={next}>Next</Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

/** ── Tokenizer demo: text → chunks (approximate, educational). ─────── */
function tokenizeApprox(text: string): string[] {
  // GPT-ish approximation: split off punctuation, then chunk long words.
  const out: string[] = [];
  for (const raw of text.split(/(\s+)/)) {
    if (!raw) continue;
    if (/^\s+$/.test(raw)) {
      out.push("␣");
      continue;
    }
    if (/^[^a-zA-Z0-9]+$/.test(raw)) {
      out.push(raw);
      continue;
    }
    let word = raw;
    while (word.length > 4) {
      out.push(word.slice(0, 4));
      word = word.slice(4);
    }
    out.push(word);
  }
  return out;
}

export function TokenVisualizer({ onComplete }: { onComplete?: () => void }) {
  const [text, setText] = useState("AI models don't read words - they read tokens.");
  const tokens = useMemo(() => tokenizeApprox(text), [text]);
  const nonSpace = tokens.filter((t) => t !== "␣");

  return (
    <div>
      <label className="block text-sm font-medium text-ink" htmlFor="tok-input">
        Type a sentence
      </label>
      <input
        id="tok-input"
        value={text}
        onChange={(e) => {
          setText(e.target.value.slice(0, 120));
          if (e.target.value.length > 20) onComplete?.();
        }}
        className="mt-1.5 w-full rounded-xl border border-void-700 bg-void-850 px-3 py-2.5 text-sm text-ink focus-ring"
      />
      <GlassCard className="mt-3 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Token stream (approximation)</p>
        <div className="mt-2 flex flex-wrap gap-1 font-mono text-sm" aria-label={`This text becomes about ${nonSpace.length} tokens`}>
          {tokens.map((t, i) => (
            <span
              key={i}
              className="rounded border border-pulse-400/25 bg-pulse-400/8 px-1.5 py-0.5 text-pulse-200"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-dim">
          ~{nonSpace.length} tokens{nonSpace.length > 0 ? ` · about ${Math.round((nonSpace.length / Math.max(1, text.split(/\s+/).filter(Boolean).length)) * 10) / 10} tokens per word` : ""}.
          The context window counts these - not words.
        </p>
      </GlassCard>
    </div>
  );
}

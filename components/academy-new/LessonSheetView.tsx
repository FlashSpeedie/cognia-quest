import type { AcademyLesson } from "@/content/academy/types";
import { formatSegment } from "@/lib/academy";
import { Diagram } from "./Diagrams";
import { Icon } from "@/components/ui/Icon";

/**
 * The Lesson Sheet - the study material that makes the lesson work even
 * without replaying the video. Structured, original Cognia Quest teaching
 * copy: core idea, vocabulary, numbered concepts, example, the classic
 * mix-up, a reasoning prompt, takeaways, and the tie back to the exact
 * source segments.
 */
export function LessonSheetView({ lesson }: { lesson: AcademyLesson }) {
  const sheet = lesson.sheet;
  const goals = lesson.meta.goals;
  const segments = lesson.video.segments;

  return (
    <section aria-label="Lesson sheet" className="space-y-10">
      {/* ── What You'll Learn ── */}
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">What You Will Learn</h2>
        <ul className="mt-4 space-y-2">
          {goals.map((g) => (
            <li key={g} className="flex items-start gap-2.5 text-[15px] text-ink-dim">
              <span aria-hidden="true" className="mt-1 text-pulse-500">✦</span>
              {g}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Core Idea ── */}
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Core Idea</h2>
        <div className="mt-4 space-y-4">
          {sheet.coreIdea.map((p, i) => (
            <p key={i} className="text-[15px] leading-[1.8] text-ink-dim">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* ── Key Vocabulary ── */}
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Key Vocabulary</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {sheet.vocabulary.map((v) => (
            <div
              key={v.term}
              className="rounded-xl border border-pulse-400/30 bg-pulse-400/5 px-4 py-3.5"
            >
              <dt className="font-display text-base font-bold text-ink">{v.term}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-dim">{v.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Concepts to Remember ── */}
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Concepts to Remember</h2>
        <ol className="mt-4 space-y-8">
          {sheet.concepts.map((c, i) => (
            <li key={c.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pulse-600 font-display text-sm font-bold text-white"
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold text-ink">{c.title}</h3>
                <div className="mt-2 space-y-3">
                  {c.body.map((p, j) => (
                    <p key={j} className="text-[15px] leading-[1.8] text-ink-dim">
                      {p}
                    </p>
                  ))}
                </div>
                {c.diagramId && (
                  <div className="mt-4">
                    <Diagram id={c.diagramId} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Example ── */}
      {sheet.example && (
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Example</h2>
          <div className="mt-4 rounded-xl border border-void-700/70 bg-void-850 px-5 py-4">
            <p className="font-display text-lg font-bold text-ink">{sheet.example.title}</p>
            <div className="mt-2 space-y-2.5">
              {sheet.example.body.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-ink-dim">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Common Confusion ── */}
      {sheet.commonConfusion && (
        <div className="rounded-xl border-l-4 border-amber-400/50 bg-amber-400/5 px-5 py-4">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink-dim">
            <Icon name="spark" size={14} aria-hidden="true" /> Common confusion
          </p>
          <p className="mt-2 font-display text-lg font-bold italic text-ink">
            {sheet.commonConfusion.title}
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-dim">
            {sheet.commonConfusion.body}
          </p>
        </div>
      )}

      {/* ── Think About It ── */}
      <div className="rounded-xl border-l-4 border-volt-400/50 bg-volt-400/5 px-5 py-4">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink-dim">
          <Icon name="brain" size={14} aria-hidden="true" /> Think about it
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">{sheet.thinkAboutIt}</p>
      </div>

      {/* ── Key Takeaways ── */}
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Key Takeaways</h2>
        <ul className="mt-4 space-y-2">
          {sheet.keyTakeaways.map((t, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] text-ink-dim">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mint-500" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Source Connection ── */}
      <div className="rounded-xl border border-void-700/70 bg-void-850 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">Source connection</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{sheet.sourceConnection}</p>
        <p className="mt-2 font-mono text-[11px] text-ink-faint">
          {segments
            .map((s) => `${s.label}: ${formatSegment(s.startSeconds, s.endSeconds)}`)
            .join("  ·  ")}
        </p>
      </div>
    </section>
  );
}

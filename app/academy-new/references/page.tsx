import type { Metadata } from "next";
import { MODULE_1 } from "@/content/academy/module-1/module";
import { moduleReferences } from "@/content/academy/module-1/references";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Academy Sources & References",
  description:
    "Sources and credits for the Cognia Quest Academy: the original video creators, chapters and timestamps used by each Module 1 lesson, and how the material is licensed and attributed.",
  path: "/academy-new/references",
});

/**
 * Public sources & credits for the Academy. The source video is credited to
 * its original creator and remains hosted by its publisher - Cognia Quest
 * provides original explanations, activities and assessments built on top
 * of the referenced material, and claims no ownership of it.
 */
export default function AcademyReferencesPage() {
  const refs = moduleReferences();
  const primary = refs[0];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
        Sources & references
      </h1>
      <p className="mt-3 text-base leading-relaxed text-ink-dim">
        The lessons in this Academy align with an external video course. The videos are embedded from,
        and remain hosted by, their original publisher. Every explanation, activity, checkpoint,
        quiz and assessment on Cognia Quest is original material written for this platform.
      </p>

      {primary && (
        <section aria-labelledby="primary-heading" className="mt-8 rounded-xl border border-pulse-400/40 bg-pulse-400/5 px-5 py-5">
          <h2 id="primary-heading" className="text-[11px] font-bold uppercase tracking-widest text-pulse-700 dark:text-pulse-300">
            Primary video source: Module 1
          </h2>
          <p className="mt-2 font-display text-lg font-bold text-ink">{primary.title}</p>
          <dl className="mt-3 space-y-1.5 text-sm text-ink-dim">
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-ink">Original creator:</dt>
              <dd>LunarTech</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-ink">Distribution:</dt>
              <dd>Distributed through freeCodeCamp.org</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-ink">Platform:</dt>
              <dd>{primary.platform}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-ink">Original video:</dt>
              <dd>
                <a
                  href={primary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300"
                >
                  Watch on YouTube
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-ink">Chapters used:</dt>
              <dd>{primary.detail}</dd>
            </div>
          </dl>
        </section>
      )}

      <section aria-labelledby="segments-heading" className="mt-8">
        <h2 id="segments-heading" className="font-display text-xl font-bold text-ink">
          Chapter usage by lesson
        </h2>
        <p className="mt-2 text-sm text-ink-dim">
          Each lesson builds on the exact segment of the source video listed below. The player on
          the lesson page starts (and stops) at that segment.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-void-700/70">
          <table className="w-full min-w-[540px] text-left text-sm">
            <thead className="bg-void-850 text-xs text-ink-faint">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Lesson</th>
                <th scope="col" className="px-4 py-3 font-semibold">Video chapter</th>
                <th scope="col" className="px-4 py-3 font-semibold">Segment</th>
              </tr>
            </thead>
            <tbody>
              {refs.slice(1).map((r) => (
                <tr key={r.id} className="border-t border-void-700/60">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-ink">{r.title}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-dim">{r.detail?.split(" (")[0]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                    {r.detail?.match(/\(([^)]+)\)/)?.[1] ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="notes-heading" className="mt-8 rounded-xl border border-void-700/70 bg-void-850 px-5 py-5">
        <h2 id="notes-heading" className="font-display text-lg font-bold text-ink">
          How this material is used
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-dim">
          <li className="flex gap-2.5">
            <span aria-hidden="true" className="mt-0.5 text-pulse-500">✦</span>
            The video is embedded from its original publisher and is not downloaded, re-hosted, or
            altered by Cognia Quest.
          </li>
          <li className="flex gap-2.5">
            <span aria-hidden="true" className="mt-0.5 text-pulse-500">✦</span>
            Lesson text, diagrams, activities, checkpoints, quizzes, the module test and the AI
            learning assistant are original Cognia Quest material aligned to the referenced
            segments.
          </li>
          <li className="flex gap-2.5">
            <span aria-hidden="true" className="mt-0.5 text-pulse-500">✦</span>
            Some source commentary (such as job-market and salary remarks from the year the course
            was recorded) reflects that period and is intentionally not presented as current fact
            in our lessons.
          </li>
          <li className="flex gap-2.5">
            <span aria-hidden="true" className="mt-0.5 text-pulse-500">✦</span>
            Crediting the source does not imply endorsement of Cognia Quest by the creator or the
            distributing platform.
          </li>
        </ul>
      </section>
    </div>
  );
}

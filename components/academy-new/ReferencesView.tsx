import type { AcademyLesson } from "@/content/academy/types";
import type { ReferenceEntry } from "@/content/academy/types";
import { formatSegment } from "@/lib/academy";
import { Icon } from "@/components/ui/Icon";

/**
 * The one canonical References section for a lesson (Step 3 of 4). The
 * full source record lives here and nowhere else on the lesson: the video
 * section carries only the compact "Video source: LunarTech" credit.
 */
export function ReferencesView({
  lesson,
  entries,
}: {
  lesson: AcademyLesson;
  entries: ReferenceEntry[];
}) {
  const segments = lesson.video.segments;
  const overall =
    segments.length > 0
      ? formatSegment(
          Math.min(...segments.map((s) => s.startSeconds)),
          Math.max(...segments.map((s) => s.endSeconds)),
        )
      : "";
  const primary = entries.find((e) => e.kind === "primary") ?? entries[0];

  return (
    <section aria-label="References" className="space-y-6" data-references-section>
      <h2 className="font-display text-2xl font-bold text-ink">References</h2>
      <div className="rounded-xl border border-pulse-400/40 bg-pulse-400/5 px-5 py-5">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-pulse-700 dark:text-pulse-300">
          Primary video
        </h2>
        <p className="mt-2 font-display text-lg font-bold leading-snug text-ink">
          {primary?.title}
        </p>
        <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-ink">Creator:</dt>
            <dd className="text-ink-dim">LunarTech</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-ink">Platform:</dt>
            <dd className="text-ink-dim">YouTube</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-ink">Lesson segment:</dt>
            <dd className="text-ink-dim">
              {segments.length === 1
                ? `"${segments[0]?.label}"`
                : `${segments.length} segments, starting with "${segments[0]?.label}"`}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-ink">Timestamp:</dt>
            <dd className="font-mono text-ink-dim">
              {segments.length === 1 ? overall : `${overall} overall`}
            </dd>
          </div>
        </dl>
        {primary?.url && (
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-void-700 bg-void-900 px-3 py-2 text-xs font-semibold text-pulse-700 transition-colors hover:border-pulse-400/50 hover:bg-pulse-50 focus-ring dark:text-pulse-300 dark:hover:bg-pulse-950/40"
          >
            Watch on YouTube
            <Icon name="arrow-right" size={13} aria-hidden="true" />
          </a>
        )}
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          The video remains hosted by its original publisher. Cognia Quest plays only the cited
          segment range through the official YouTube embed.
        </p>
      </div>

      <div className="rounded-xl border border-void-700/70 bg-void-900 px-5 py-5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">
          Cognia Quest material
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          Original Cognia Quest lesson sheet, checkpoints, activities and assessment questions
          created for this lesson. Some source commentary from the recording year (such as
          job-market remarks) is intentionally not taught here.
        </p>
        <a
          href="/academy-new/references"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300"
        >
          Full module sources & references
          <Icon name="arrow-right" size={12} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { getAcademyModuleState, resumeLessonId, lessonMasteryPcts } from "@/server/services/academyProgress";
import { MODULE_1, MODULE_TEST_PASS_THRESHOLD, LESSON_MASTERY_THRESHOLD } from "@/content/academy/module-1/module";
import { LESSONS } from "@/content/academy";
import { moduleMasteryPct } from "@/lib/academy";
import { pageMetadata } from "@/lib/seo";
import { ProgressBar, ProgressRing } from "@/components/ui/ProgressBar";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Academy — Learn AI and Machine Learning",
  description:
    "A free, interactive AI course: start with Module 1 and build a working understanding of machine learning - how it learns, how problems are categorized, and how to tell whether a model actually works.",
  path: "/academy-new",
});

const TOTAL_MINUTES = LESSONS.reduce((a, l) => a + l.meta.minutes, 0);

export default async function AcademyHome() {
  const user = await getSessionUser();

  // Personal progress (signed-in only) - user-scoped, never shared-cached.
  let completed = 0;
  let inProgressId: string | null = null;
  let masteryPct: number | null = null;
  let testBest: number | null = null;
  let testPassed = false;
  if (user) {
    const db = await getDb();
    const [state, pcts] = await Promise.all([
      getAcademyModuleState(db, user.id),
      lessonMasteryPcts(db, user.id),
    ]);
    const byLesson = new Map(state.lessonProgress.map((r) => [r.lessonId, r]));
    completed = LESSONS.filter((l) => byLesson.get(l.meta.id)?.status === "completed").length;
    inProgressId = resumeLessonId(state);
    testBest = state.moduleResult?.bestScore ?? null;
    testPassed = state.moduleResult?.passed ?? false;
    masteryPct = moduleMasteryPct(pcts, testBest);
  }

  const resumeLesson = inProgressId ? LESSONS.find((l) => l.meta.id === inProgressId) : null;

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: MODULE_1.title,
          description: MODULE_1.description,
          provider: { "@type": "Organization", name: "Cognia Quest" },
          educationalLevel: "High school",
          isAccessibleForFree: true,
        }}
      />

      {/* ── Hero ── */}
      <section className="pb-12 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-pulse-700 dark:text-pulse-300">
          Cognia Quest Academy
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.15] tracking-tight text-ink sm:text-5xl">
          Academy
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-dim">
          Build a strong foundation in AI, understand how machine learning works, and learn to use
          these systems thoughtfully.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-ink-faint">
          Every lesson, activity and quiz works without an account — sign in to save progress and
          earn XP.
        </p>

        {user && (
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-pulse-400/40 bg-pulse-400/5 px-5 py-4">
            <ProgressRing value={masteryPct ?? 0} size={64} label="Module 1 mastery" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-bold text-ink">
                {resumeLesson
                  ? `Continue where you left off — ${resumeLesson.meta.title}`
                  : testPassed
                    ? "Module 1 complete — review any time"
                    : completed === LESSONS.length
                      ? "All lessons complete — take the module test"
                      : "Start Module 1"}
              </p>
              <p className="mt-0.5 text-sm text-ink-dim">
                {completed}/{LESSONS.length} lessons complete
                {testBest !== null ? ` · best test score ${testBest}%` : ""}
              </p>
            </div>
            <a
              href={
                resumeLesson
                  ? `/academy-new/module/1/lesson/${resumeLesson.meta.slug}`
                  : completed === LESSONS.length
                    ? "/academy-new/module/1/test"
                    : "/academy-new/module/1"
              }
              className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
            >
              Continue learning
              <Icon name="arrow-right" size={15} aria-hidden="true" />
            </a>
          </div>
        )}
      </section>

      {/* ── Module 1 ── */}
      <section aria-labelledby="module-1-heading">
        <div className="rounded-2xl border border-void-700/70 bg-void-900 p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-pulse-600 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                  MODULE 1
                </span>
                {testPassed && (
                  <span className="rounded-full border border-mint-400/50 bg-mint-400/10 px-2.5 py-0.5 text-[11px] font-bold text-mint-700 dark:text-mint-300">
                    Complete
                  </span>
                )}
              </div>
              <h2 id="module-1-heading" className="mt-3 font-display text-2xl font-bold text-ink">
                {MODULE_1.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-dim">{MODULE_1.subtitle}</p>
            </div>
            {user && (
              <div className="w-full sm:w-56">
                <ProgressBar
                  value={masteryPct ?? 0}
                  label="Module mastery"
                  showValue
                  tone={testPassed ? "mint" : "pulse"}
                />
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
                  70% lesson mastery + 30% best test score
                </p>
              </div>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [`${LESSONS.length}`, "Interactive lessons"],
              [`~${Math.round(TOTAL_MINUTES / 15) * 15} min`, "Estimated time"],
              [`${LESSON_MASTERY_THRESHOLD}%`, "Quiz score to master a lesson"],
              [`${MODULE_TEST_PASS_THRESHOLD}%`, "Module test pass mark"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-void-700/70 bg-void-850 px-4 py-3">
                <dt className="text-[11px] font-medium text-ink-faint">{label}</dt>
                <dd className="mt-1 font-display text-lg font-bold text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {LESSONS.map((l) => (
              <li key={l.meta.id}>
                <a
                  href={`/academy-new/module/1/lesson/${l.meta.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-void-700/60 bg-void-850 px-3.5 py-3 transition-colors hover:border-pulse-400/50 hover:bg-pulse-50 focus-ring dark:hover:bg-pulse-950/30"
                >
                  <span className="font-mono text-xs font-bold text-ink-faint">
                    {String(l.meta.order).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{l.meta.title}</span>
                    <span className="block text-[11px] text-ink-faint">{l.meta.minutes} min</span>
                  </span>
                  <Icon name="arrow-right" size={14} className="shrink-0 text-ink-faint" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/academy-new/module/1"
              className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
            >
              {user ? (resumeLesson ? "Continue learning" : "Go to Module 1") : "Start learning"}
              <Icon name="arrow-right" size={15} aria-hidden="true" />
            </a>
            <a
              href="/academy-new/module/1/test"
              className="inline-flex items-center gap-2 rounded-lg border border-void-700 bg-void-900 px-4 py-3 text-sm font-semibold text-ink-dim transition-colors hover:text-ink focus-ring"
            >
              Module test
            </a>
            <span className="text-xs text-ink-faint">
              Lesson videos by LunarTech — credited on every lesson.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { getAcademyModuleState, lessonMasteryPcts } from "@/server/services/academyProgress";
import { MODULE_1, MODULE_TEST_PASS_THRESHOLD, LESSON_MASTERY_THRESHOLD } from "@/content/academy/module-1/module";
import { LESSONS } from "@/content/academy";
import {
  lessonMasteryPct,
  lessonMasteryState,
  moduleMasteryPct,
  MASTERY_LABELS,
  formatSegment,
} from "@/lib/academy";
import { pageMetadata } from "@/lib/seo";
import { ProgressBar, ProgressRing } from "@/components/ui/ProgressBar";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module: num } = await params;
  if (num !== "1") return { title: "Module" };
  return pageMetadata({
    title: `Module 1 — ${MODULE_1.title}`,
    description: MODULE_1.subtitle,
    path: "/academy-new/module/1",
  });
}

const STATE_STYLE: Record<string, string> = {
  not_started: "bg-void-700 text-ink-faint",
  in_progress: "bg-pulse-400/15 text-pulse-700 dark:text-pulse-300",
  completed: "bg-mint-400/15 text-mint-700 dark:text-mint-300",
};

export default async function ModuleOverviewPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: num } = await params;
  if (num !== "1") notFound();

  const user = await getSessionUser();

  let byLesson = new Map<string, { status: string; sectionsDone: string[]; quizBest: number | null; attempts: number }>();
  let masteryPct = 0;
  let testBest: number | null = null;
  let testPassed = false;
  let testPassedAt: string | null = null;
  let completed = 0;

  if (user) {
    const db = await getDb();
    const [state, pcts] = await Promise.all([
      getAcademyModuleState(db, user.id),
      lessonMasteryPcts(db, user.id),
    ]);
    byLesson = new Map(
      state.lessonProgress.map((r) => [
        r.lessonId,
        { status: r.status, sectionsDone: r.sectionsDone, quizBest: r.quizBest, attempts: r.attempts },
      ]),
    );
    testBest = state.moduleResult?.bestScore ?? null;
    testPassed = state.moduleResult?.passed ?? false;
    testPassedAt = state.moduleResult?.passedAt ?? null;
    masteryPct = moduleMasteryPct(pcts, testBest);
    completed = LESSONS.filter((l) => byLesson.get(l.meta.id)?.status === "completed").length;
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-faint">
        <a href="/academy-new" className="hover:text-ink focus-ring rounded">Academy (New)</a>
        <span aria-hidden="true">/</span>
        <span className="text-pulse-700 dark:text-pulse-300">Module 1</span>
      </nav>

      {/* ── Module header ── */}
      <header className="mt-5">
        <span className="rounded-md bg-pulse-600 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
          MODULE 1
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {MODULE_1.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-dim">{MODULE_1.subtitle}</p>
        <p className="mt-3 text-sm text-ink-faint">
          Lesson videos by <span className="font-semibold text-ink-dim">LunarTech</span>, embedded
          from YouTube — see{" "}
          <a href="/academy-new/references" className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300">
            sources & references
          </a>
          .
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-void-700/70 bg-void-900 px-5 py-4">
          {user ? (
            <>
              <ProgressRing
                value={masteryPct}
                size={72}
                label="Module mastery"
                centerLabel={testPassed ? `${masteryPct}% ✓` : `${masteryPct}%`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-ink">
                  {completed}/{LESSONS.length} lessons complete
                  {testPassed ? " · module test passed" : testBest !== null ? ` · best test score ${testBest}%` : ""}
                </p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Module mastery = 70% average lesson mastery + 30% best test score. A lesson counts
                  as mastered at {LESSON_MASTERY_THRESHOLD}% quiz score or above.
                </p>
                {testPassed && testPassedAt && (
                  <p className="mt-1 text-xs font-semibold text-mint-700 dark:text-mint-300">
                    Completed {new Date(testPassedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-dim">
              Browsing as a guest — everything below is fully usable.{" "}
              <a href="/login" className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300">
                Sign in
              </a>{" "}
              to save progress, earn XP and resume where you left off.
            </p>
          )}
        </div>
      </header>

      {/* ── Lessons ── */}
      <section aria-labelledby="lessons-heading" className="mt-10">
        <h2 id="lessons-heading" className="font-display text-xl font-bold text-ink">
          Lessons
        </h2>
        <ol className="mt-4 space-y-3">
          {LESSONS.map((l) => {
            const row = byLesson.get(l.meta.id);
            const mInput = {
              sectionsDone: row?.sectionsDone.length ?? 0,
              requiredSections: l.requiredSectionIds.length,
              completed: row?.status === "completed",
              quizBest: row?.quizBest ?? null,
              attempts: row?.attempts ?? 0,
            };
            const state = lessonMasteryState(mInput);
            const pct = lessonMasteryPct(mInput);
            const stepsPct =
              mInput.requiredSections > 0
                ? Math.round((mInput.sectionsDone / mInput.requiredSections) * 100)
                : 0;
            const cta =
              state === "not_started" ? "Start" : state === "mastered" || mInput.completed ? "Review" : "Continue";
            return (
              <li key={l.meta.id}>
                <a
                  href={`/academy-new/module/1/lesson/${l.meta.slug}`}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-void-700/70 bg-void-900 px-5 py-4 transition-colors hover:border-pulse-400/50 hover:shadow-card focus-ring"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${STATE_STYLE[row?.status ?? "not_started"]}`}
                  >
                    {row?.status === "completed" ? (
                      <Icon name="check" size={18} />
                    ) : (
                      String(l.meta.order).padStart(2, "0")
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-bold text-ink">
                      {l.meta.title}
                    </span>
                    <span className="mt-0.5 block max-w-xl truncate text-sm text-ink-faint">
                      {l.meta.summary}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-faint">
                      <span>{l.meta.minutes} min</span>
                      <span className="font-mono">
                        video{" "}
                        {l.video.segments.length > 1
                          ? `${l.video.segments.length} segments`
                          : formatSegment(l.video.segments[0]?.startSeconds ?? 0, l.video.segments[0]?.endSeconds ?? 0)}
                      </span>
                      {user && row && row.sectionsDone.length > 0 && (
                        <span>
                          {stepsPct}% of steps
                          {row.quizBest !== null ? ` · quiz best ${row.quizBest}%` : ""}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {user && (
                      <span className="hidden sm:block">
                        <span className="sr-only">Mastery {pct}%</span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            state === "mastered"
                              ? "border-mint-400/50 bg-mint-400/10 text-mint-700 dark:text-mint-300"
                              : state === "practicing"
                                ? "border-pulse-400/50 bg-pulse-400/10 text-pulse-700 dark:text-pulse-300"
                                : state === "learning"
                                  ? "border-amber-400/50 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                                  : "border-void-700 bg-void-850 text-ink-faint"
                          }`}
                        >
                          {MASTERY_LABELS[state]}
                        </span>
                      </span>
                    )}
                    <span className="text-sm font-semibold text-pulse-700 dark:text-pulse-300">{cta} →</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ── Module test ── */}
      <section aria-labelledby="test-heading" className="mt-10">
        <div
          className={`rounded-xl border px-5 py-5 ${
            testPassed ? "border-mint-400/50 bg-mint-400/5" : "border-void-700/70 bg-void-900"
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span
              aria-hidden="true"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                testPassed ? "bg-mint-500/15 text-mint-600" : "bg-volt-400/15 text-volt-600 dark:text-volt-300"
              }`}
            >
              <Icon name="badge" size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="test-heading" className="font-display text-lg font-bold text-ink">
                Module 1 Test
              </h2>
              <p className="mt-0.5 text-sm text-ink-dim">
                20 questions across the whole module · pass mark {MODULE_TEST_PASS_THRESHOLD}% ·
                unlimited retakes, best score counts
                {testBest !== null ? ` · your best: ${testBest}%` : ""}
              </p>
            </div>
            <a
              href="/academy-new/module/1/test"
              className="inline-flex items-center gap-2 rounded-lg bg-pulse-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-700 focus-ring"
            >
              {testPassed ? "Review the test" : testBest !== null ? "Retake the test" : "Take the test"}
              <Icon name="arrow-right" size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

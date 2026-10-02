import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { getAcademyModuleState, lessonMasteryPcts } from "@/server/services/academyProgress";
import { LESSONS, lessonBySlug, quizById } from "@/content/academy";
import { MODULE_1, LESSON_MASTERY_THRESHOLD, lessonVideoSeconds } from "@/content/academy/module-1/module";
import { toPublicQuestion, moduleMasteryPct } from "@/lib/academy";
import { pageMetadata } from "@/lib/seo";
import { LessonProgressProvider } from "@/components/academy-new/LessonProgressContext";
import { LessonShell, type NavLesson, type ModuleProgress } from "@/components/academy-new/LessonShell";
import { LessonVideo } from "@/components/academy-new/LessonVideo";
import { SourceAttribution } from "@/components/academy-new/SourceAttribution";
import { CheckpointCard } from "@/components/academy-new/CheckpointCard";
import { LessonSheetView } from "@/components/academy-new/LessonSheetView";
import { ActivityCard } from "@/components/academy-new/ActivityCard";
import { QuizRunner } from "@/components/academy-new/QuizRunner";
import { FreeResponseQuiz } from "@/components/academy-new/FreeResponseCard";
import { CompletionPanel } from "@/components/academy-new/CompletionPanel";
import { TutorPanel } from "@/components/academy-new/TutorPanel";
import { lessonReferences } from "@/content/academy/module-1/references";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}): Promise<Metadata> {
  const { module: num, lesson: slug } = await params;
  if (num !== "1") return { title: "Lesson" };
  const lesson = lessonBySlug(slug);
  if (!lesson) return { title: "Lesson" };
  return pageMetadata({
    title: `${lesson.meta.title} — Module 1`,
    description: lesson.meta.summary,
    path: `/academy-new/module/1/lesson/${lesson.meta.slug}`,
  });
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string; lesson: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const { module: num, lesson: slug } = await params;
  if (num !== "1") notFound();
  const lesson = lessonBySlug(slug);
  if (!lesson) notFound();

  // Tutor deep links (?t=sourceSeconds) position the player at the exact
  // source moment the answer referenced.
  const { t } = await searchParams;
  const tRaw = Array.isArray(t) ? t[0] : t;
  const initialSourceSeconds = tRaw != null && /^\d+$/.test(tRaw) ? Number(tRaw) : null;

  const user = await getSessionUser();

  // User-scoped progress (never shared-cached); guests start empty.
  let initialDone: string[] = [];
  let quizBest: number | null = null;
  let attempts = 0;
  let alreadyBanked = false;
  let navStates: NavLesson[] = LESSONS.map((l) => ({
    slug: l.meta.slug,
    order: l.meta.order,
    title: l.meta.title,
    minutes: l.meta.minutes,
    state: "not_started" as const,
  }));
  let moduleProgress: ModuleProgress = {
    completed: 0,
    total: LESSONS.length,
    masteryPct: 0,
    testPassed: false,
  };

  if (user) {
    const db = await getDb();
    const [state, pcts] = await Promise.all([
      getAcademyModuleState(db, user.id),
      lessonMasteryPcts(db, user.id),
    ]);
    const byLesson = new Map(state.lessonProgress.map((r) => [r.lessonId, r]));
    const row = byLesson.get(lesson.meta.id);
    initialDone = row?.sectionsDone ?? [];
    quizBest = row?.quizBest ?? null;
    attempts = row?.attempts ?? 0;
    alreadyBanked = row?.status === "completed";
    const completedCount = LESSONS.filter(
      (l) => byLesson.get(l.meta.id)?.status === "completed",
    ).length;
    navStates = navStates.map((n) => {
      const l = LESSONS.find((x) => x.meta.slug === n.slug)!;
      const r = byLesson.get(l.meta.id);
      return {
        ...n,
        state: r?.status === "completed" ? ("completed" as const) : r && r.sectionsDone.length > 0 ? ("in_progress" as const) : ("not_started" as const),
      };
    });
    moduleProgress = {
      completed: completedCount,
      total: LESSONS.length,
      masteryPct: moduleMasteryPct(pcts, state.moduleResult?.bestScore ?? null),
      testPassed: state.moduleResult?.passed ?? false,
    };
  }

  const quiz = quizById(lesson.quizId);
  const publicQuestions = quiz ? quiz.questions.map(toPublicQuestion) : [];
  const idx = LESSONS.findIndex((l) => l.meta.id === lesson.meta.id);
  const prev = idx > 0 ? LESSONS[idx - 1] : null;
  const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;
  const refs = lessonReferences(lesson.meta.id);

  return (
    <LessonProgressProvider
      lessonId={lesson.meta.id}
      requiredIds={lesson.requiredSectionIds}
      initialDone={initialDone}
      signedIn={!!user}
      initialQuizBest={quizBest}
    >
      <LessonShell
        lessons={navStates}
        currentSlug={lesson.meta.slug}
        currentOrder={lesson.meta.order}
        title={lesson.meta.title}
        minutes={lesson.meta.minutes}
        videoSource={MODULE_1.source.creator}
        progress={moduleProgress}
        prevHref={prev ? `/academy-new/module/1/lesson/${prev.meta.slug}` : null}
        nextHref={next ? `/academy-new/module/1/lesson/${next.meta.slug}` : null}
      >
        {/* ── Video: the focused segment playlist + creator credit ── */}
        <section aria-label="Lesson video">
          <h2 className="sr-only">Lesson video</h2>
          <LessonVideo
            lessonId={lesson.meta.id}
            videoId={MODULE_1.source.videoId}
            segments={lesson.video.segments.map((s) => ({
              id: s.id,
              label: s.label,
              chapter: s.chapter,
              startSeconds: s.startSeconds,
              endSeconds: s.endSeconds,
            }))}
            checkpoints={lesson.checkpoints}
            initialSourceSeconds={initialSourceSeconds}
            sourceUrl={MODULE_1.source.url}
          />
          <SourceAttribution
            videoTitle={MODULE_1.source.title}
            creator={MODULE_1.source.creator}
            url={MODULE_1.source.url}
            segments={lesson.video.segments.map((s) => ({
              label: s.label,
              chapter: s.chapter,
              start: s.startSeconds,
              end: s.endSeconds,
            }))}
          />
        </section>

        {/* ── Checkpoints: the pause-and-think moments from the video ── */}
        <section aria-label="Lesson checkpoints">
          <h2 className="font-display text-2xl font-bold text-ink">Checkpoints</h2>
          <p className="mt-1.5 text-sm text-ink-dim">
            These pause the video at conceptual transitions. Answer them when they appear during
            playback - or right here, any time.
          </p>
          <div className="mt-5 space-y-4">
            {lesson.checkpoints.map((cp) => (
              <CheckpointCard key={cp.id} checkpoint={cp} />
            ))}
          </div>
        </section>

        {/* ── The Lesson Sheet ── */}
        <LessonSheetView lesson={lesson} />

        {/* ── Optional enrichment exercise ── */}
        {lesson.activity && <ActivityCard def={lesson.activity} lessonId={lesson.meta.id} />}

        {/* ── Lesson quiz: 6 auto-graded + 4 written-reasoning = 10 questions ── */}
        {quiz && (
          <section aria-label="Lesson quiz">
            <div className="rounded-xl border border-void-700/70 bg-void-850 px-5 py-4">
              <h2 className="font-display text-2xl font-bold text-ink">Lesson Quiz</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">
                10 questions: six auto-graded (1–6), four written-reasoning (7–10). Score{" "}
                {LESSON_MASTERY_THRESHOLD}%+ to master this lesson — 50%+ counts toward completion,
                and retries never lower your best. The video for this lesson runs{" "}
                {Math.round(lessonVideoSeconds(lesson.meta.id) / 60)} minutes of source material.
              </p>
            </div>
            <div className="mt-5">
              <QuizRunner
                quizId={quiz.id}
                questions={publicQuestions}
                signedIn={!!user}
                mode="lesson"
                initialBest={quizBest}
                initialAttempts={attempts}
                masteryThresholdPct={LESSON_MASTERY_THRESHOLD}
              />
            </div>
            {lesson.freeResponses.length > 0 && (
              <div className="mt-6">
                <FreeResponseQuiz lessonId={lesson.meta.id} freeResponses={lesson.freeResponses} />
              </div>
            )}
          </section>
        )}

        {/* ── References ── */}
        <section aria-label="References" className="rounded-xl border border-void-700/70 bg-void-900 px-5 py-5">
          <h2 className="font-display text-2xl font-bold text-ink">References</h2>
          <ul className="mt-3 space-y-4">
            {refs.map((r) => (
              <li key={r.id} className="text-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">{r.label}</p>
                <p className="mt-1 font-semibold text-ink">
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-2 hover:underline focus-ring"
                    >
                      {r.title}
                    </a>
                  ) : (
                    r.title
                  )}
                </p>
                <p className="mt-0.5 text-ink-dim">
                  {[r.creator, r.platform].filter(Boolean).join(" · ")}
                  {r.detail ? ` · ${r.detail}` : ""}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            External educational video: embedded from, and remaining hosted by, its original
            publisher. Cognia Quest lesson material: the lesson sheet, checkpoints, quiz and
            references on this page are original Cognia Quest material aligned to the cited
            segments. See{" "}
            <a href="/academy-new/references" className="font-semibold text-pulse-700 underline-offset-2 hover:underline focus-ring dark:text-pulse-300">
              module sources & references
            </a>
            .
          </p>
        </section>

        {/* ── Completion ── */}
        <CompletionPanel
          nextHref={next ? `/academy-new/module/1/lesson/${next.meta.slug}` : null}
          nextLessonTitle={next ? next.meta.title : null}
          alreadyBanked={alreadyBanked}
          attemptCount={attempts}
        />

        {/* ── Learning assistant (lazy) ── */}
        <TutorPanel lessonId={lesson.meta.id} lessonTitle={lesson.meta.title} />
      </LessonShell>
    </LessonProgressProvider>
  );
}

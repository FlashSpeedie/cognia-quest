import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { LESSONS, lessonBySlug, quizById } from "@/content/academy";
import { MODULE_1, LESSON_MASTERY_THRESHOLD } from "@/content/academy/module-1/module";
import { lessonReferences } from "@/content/academy/module-1/references";
import { toPublicQuestion } from "@/lib/academy";
import { pageMetadata } from "@/lib/seo";
import { LessonProgressProvider } from "@/components/academy-new/LessonProgressContext";
import { LessonShell, type NavLesson } from "@/components/academy-new/LessonShell";
import { VideoBlock } from "@/components/academy-new/VideoBlock";
import { SourceAttribution } from "@/components/academy-new/SourceAttribution";
import { BlockView } from "@/components/academy-new/BlockView";
import { CheckpointCard } from "@/components/academy-new/CheckpointCard";
import { ActivityCard } from "@/components/academy-new/ActivityCard";
import { QuizRunner } from "@/components/academy-new/QuizRunner";
import { FreeResponseCard } from "@/components/academy-new/FreeResponseCard";
import { CompletionPanel } from "@/components/academy-new/CompletionPanel";
import { TutorPanel } from "@/components/academy-new/TutorPanel";

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
}: {
  params: Promise<{ module: string; lesson: string }>;
}) {
  const { module: num, lesson: slug } = await params;
  if (num !== "1") notFound();
  const lesson = lessonBySlug(slug);
  if (!lesson) notFound();

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

  if (user) {
    const db = await getDb();
    const rows = await db.table("lesson_progress").find({ userId: user.id, moduleId: "module-1" });
    const byLesson = new Map(rows.map((r) => [r.lessonId, r]));
    const row = byLesson.get(lesson.meta.id);
    initialDone = row?.sectionsDone ?? [];
    quizBest = row?.quizBest ?? null;
    attempts = row?.attempts ?? 0;
    alreadyBanked = row?.status === "completed";
    navStates = navStates.map((n) => {
      const l = LESSONS.find((x) => x.meta.slug === n.slug)!;
      const r = byLesson.get(l.meta.id);
      return {
        ...n,
        state: r?.status === "completed" ? ("completed" as const) : r && r.sectionsDone.length > 0 ? ("in_progress" as const) : ("not_started" as const),
      };
    });
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
        moduleNumber={1}
        moduleTitle={MODULE_1.title}
        lessons={navStates}
        currentSlug={lesson.meta.slug}
        currentOrder={lesson.meta.order}
        title={lesson.meta.title}
        minutes={lesson.meta.minutes}
        videoSource={MODULE_1.source.creator}
        prevHref={prev ? `/academy-new/module/1/lesson/${prev.meta.slug}` : null}
        nextHref={next ? `/academy-new/module/1/lesson/${next.meta.slug}` : null}
      >
        {/* ── Video (facade -> single embed, exact segment) ── */}
        <section aria-label="Lesson video">
          <h2 className="sr-only">Lesson video</h2>
          <VideoBlock
            videoId={MODULE_1.source.videoId}
            start={lesson.meta.segment.start}
            end={lesson.meta.segment.end}
            title={MODULE_1.source.title}
            creator={MODULE_1.source.creator}
          />
          <SourceAttribution
            videoTitle={MODULE_1.source.title}
            creator={MODULE_1.source.creator}
            url={MODULE_1.source.url}
            chapter={lesson.meta.segment.chapter}
            chapterTitle={lesson.meta.segment.chapterTitle}
            start={lesson.meta.segment.start}
            end={lesson.meta.segment.end}
          />
        </section>

        {/* ── Lesson goals ── */}
        <section aria-label="Lesson goals">
          <h2 className="font-display text-lg font-bold text-ink">What you will learn</h2>
          <ul className="mt-3 space-y-1.5">
            {lesson.meta.goals.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-ink-dim">
                <span aria-hidden="true" className="mt-1 text-pulse-500">✦</span>
                {g}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Original explanation + checkpoints ── */}
        {lesson.intro.map((b, i) => (
          <BlockView key={`intro-${i}`} block={b} />
        ))}
        {lesson.blocks.map((b, i) =>
          b.kind === "checkpoint" ? (
            <CheckpointCard key={b.checkpoint.id} checkpoint={b.checkpoint} />
          ) : (
            <BlockView key={`block-${i}`} block={b} />
          ),
        )}

        {/* ── Interactive exercise ── */}
        {lesson.activity && <ActivityCard def={lesson.activity} lessonId={lesson.meta.id} />}

        {/* ── Lesson quiz ── */}
        {quiz && (
          <section aria-label="Lesson quiz">
            <div className="rounded-xl border border-void-700/70 bg-void-850 px-5 py-4">
              <h2 className="font-display text-xl font-bold text-ink">Lesson quiz</h2>
              <p className="mt-1 text-sm text-ink-dim">
                {quiz.questions.length} questions, graded on submission with full explanations. Score{" "}
                {LESSON_MASTERY_THRESHOLD}%+ to master this lesson — 50%+ counts toward completion,
                and retries never lower your best.
              </p>
            </div>
            <div className="mt-4">
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
          </section>
        )}

        {/* ── Free response ── */}
        {lesson.freeResponse && (
          <FreeResponseCard lessonId={lesson.meta.id} freeResponse={lesson.freeResponse} />
        )}

        {/* ── References ── */}
        <section aria-label="References" className="rounded-xl border border-void-700/70 bg-void-900 px-5 py-5">
          <h2 className="font-display text-lg font-bold text-ink">References</h2>
          <ul className="mt-3 space-y-3">
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
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            The video is embedded from and remains hosted by its original publisher. Explanations,
            activities and assessments on this page are original Cognia Quest material. See{" "}
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

        {/* ── AI learning assistant (lazy) ── */}
        <TutorPanel lessonId={lesson.meta.id} lessonTitle={lesson.meta.title} />
      </LessonShell>
    </LessonProgressProvider>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import {
  getAcademyModuleState,
  lessonNavItems,
  firstIncompleteLessonId,
} from "@/server/services/academyProgress";
import { LESSONS, lessonBySlug, quizById, lessonById } from "@/content/academy";
import { MODULE_1, LESSON_MASTERY_THRESHOLD } from "@/content/academy/module-1/module";
import {
  toPublicQuestion,
  isLessonSectionKey,
  lessonSectionProgress,
  lessonSheetStepId,
  lessonReferencesStepId,
  clampLessonSection,
  type LessonSectionKey,
} from "@/lib/academy";
import { pageMetadata } from "@/lib/seo";
import { LessonProgressProvider } from "@/components/academy-new/LessonProgressContext";
import {
  LessonShell,
  type NavLesson,
  type SectionSteps,
  type ModuleProgress,
} from "@/components/academy-new/LessonShell";
import { LessonVideo } from "@/components/academy-new/LessonVideo";
import { SourceAttribution } from "@/components/academy-new/SourceAttribution";
import { SectionNav } from "@/components/academy-new/SectionNav";
import { LessonSheetView } from "@/components/academy-new/LessonSheetView";
import { ReferencesView } from "@/components/academy-new/ReferencesView";
import { ActivityCard } from "@/components/academy-new/ActivityCard";
import { LessonQuizFlow } from "@/components/academy-new/LessonQuizFlow";
import { TutorPanel } from "@/components/academy-new/TutorPanel";
import { LessonLockedScreen } from "@/components/academy-new/LessonLocks";
import { lessonReferences } from "@/content/academy/module-1/references";

export const dynamic = "force-dynamic";

/**
 * One lesson, four sequential sections (Video -> Lesson Sheet -> References
 * -> Quiz), selected by ?section= and enforced server-side: a locked
 * section deep link falls back to the student's current section, and a
 * locked LESSON renders a friendly locked screen with no content at all.
 * Refreshing, sharing or deep-linking a section URL all work naturally,
 * and browser Back/Forward move between sections.
 */

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
    title: `${lesson.meta.title} - Module 1`,
    description: lesson.meta.summary,
    path: `/academy-new/module/1/lesson/${lesson.meta.slug}`,
  });
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string; lesson: string }>;
  searchParams: Promise<{ t?: string | string[]; section?: string | string[] }>;
}) {
  const { module: num, lesson: slug } = await params;
  if (num !== "1") notFound();
  const lesson = lessonBySlug(slug);
  if (!lesson) notFound();

  // Tutor deep links (?t=sourceSeconds) land on the video, at the exact
  // source moment the answer referenced.
  const { t, section: sectionParam } = await searchParams;
  const tRaw = Array.isArray(t) ? t[0] : t;
  const initialSourceSeconds = tRaw != null && /^\d+$/.test(tRaw) ? Number(tRaw) : null;
  const sectionRaw = Array.isArray(sectionParam) ? sectionParam[0] : sectionParam;
  const explicit: LessonSectionKey | null = isLessonSectionKey(sectionRaw) ? sectionRaw : null;
  const requested: LessonSectionKey | null =
    initialSourceSeconds != null && initialSourceSeconds > 0 ? (explicit ?? "video") : explicit;

  const user = await getSessionUser();

  // User-scoped progress (never shared-cached); guests start empty and are
  // never locked out of lesson content (public preview).
  let initialDone: string[] = [];
  let quizBest: number | null = null;
  let attempts = 0;
  let alreadyBanked = false;
  let navLessons: NavLesson[] = LESSONS.map((l) => ({
    slug: l.meta.slug,
    order: l.meta.order,
    title: l.meta.title,
    minutes: l.meta.minutes,
    state: "available" as const,
  }));
  let moduleProgress: ModuleProgress = {
    completed: 0,
    total: LESSONS.length,
    testLocked: false,
    testPassed: false,
  };

  let section: LessonSectionKey = requested ?? "video";
  let secProgress: ReturnType<typeof lessonSectionProgress> | null = null;

  if (user) {
    const db = await getDb();
    const state = await getAcademyModuleState(db, user.id);
    const row = state.lessonProgress.find((r) => r.lessonId === lesson.meta.id) ?? null;
    initialDone = row?.sectionsDone ?? [];
    quizBest = row?.quizBest ?? null;
    attempts = row?.attempts ?? 0;
    alreadyBanked = row?.status === "completed";

    const navItems = lessonNavItems(state);
    const mine = navItems.find((n) => n.lessonId === lesson.meta.id)!;
    if (!mine.unlocked) {
      // Route-level enforcement: locked lessons show a friendly screen,
      // never the lesson content.
      const firstIncomplete = firstIncompleteLessonId(state);
      const blocking = firstIncomplete ? lessonById(firstIncomplete) : LESSONS[0];
      const completedCount = navItems.filter((n) => n.completed).length;
      return (
        <LessonProgressProvider
          lessonId={lesson.meta.id}
          requiredIds={[]}
          initialDone={[]}
          signedIn
        >
          <LessonLockedScreen
            lesson={lesson.meta}
            blockingLesson={blocking!.meta}
            completedCount={completedCount}
            totalLessons={LESSONS.length}
          />
        </LessonProgressProvider>
      );
    }

    navLessons = navItems.map((n) => {
      const l = lessonById(n.lessonId)!;
      return {
        slug: l.meta.slug,
        order: n.order,
        title: l.meta.title,
        minutes: l.meta.minutes,
        state: n.completed ? ("completed" as const) : n.unlocked ? ("available" as const) : ("locked" as const),
      };
    });

    secProgress = lessonSectionProgress({
      lessonCompleted: row?.status === "completed",
      checkpointIds: lesson.checkpoints.map((cp) => cp.id),
      sheetStepId: lessonSheetStepId(lesson.meta.id),
      referencesStepId: lessonReferencesStepId(lesson.meta.id),
      quizStepId: `${lesson.meta.id}-quiz`,
      quizBest: row?.quizBest ?? null,
      done: initialDone,
    });
    // Deep-link guard: a section the student hasn't reached yet falls back
    // to their current section, so locked sections can't be opened by URL.
    section = clampLessonSection(requested, secProgress);

    moduleProgress = {
      completed: navItems.filter((n) => n.completed).length,
      total: LESSONS.length,
      testLocked: !navItems.every((n) => n.completed),
      testPassed: state.moduleResult?.passed ?? false,
    };
  } else if (requested == null) {
    section = "video";
  }

  const sectionSteps: SectionSteps = {
    video: lesson.checkpoints.map((cp) => cp.id),
    lesson: [lessonSheetStepId(lesson.meta.id)],
    references: [lessonReferencesStepId(lesson.meta.id)],
    quiz: [`${lesson.meta.id}-quiz`],
  };

  const quiz = quizById(lesson.quizId);
  const publicQuestions = quiz ? quiz.questions.map(toPublicQuestion) : [];
  const idx = LESSONS.findIndex((l) => l.meta.id === lesson.meta.id);
  const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;
  const refs = lessonReferences(lesson.meta.id);
  const lessonUrl = `/academy-new/module/1/lesson/${lesson.meta.slug}`;
  const sectionUrl = (key: LessonSectionKey) => `${lessonUrl}?section=${key}`;

  return (
    <LessonProgressProvider
      lessonId={lesson.meta.id}
      requiredIds={lesson.requiredSectionIds}
      initialDone={initialDone}
      signedIn={!!user}
      initialQuizBest={quizBest}
    >
      <LessonShell
        lessons={navLessons}
        currentSlug={lesson.meta.slug}
        currentOrder={lesson.meta.order}
        title={lesson.meta.title}
        minutes={lesson.meta.minutes}
        section={section}
        sectionSteps={sectionSteps}
        progress={moduleProgress}
        signedIn={!!user}
      >
        {section === "video" && (
          <>
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
              <SourceAttribution creator={MODULE_1.source.creator} url={MODULE_1.source.url} />
            </section>
            <SectionNav
              backHref={null}
              nextHref={sectionUrl("lesson")}
              nextLabel="Lesson Sheet"
              gateIds={user ? lesson.checkpoints.map((cp) => cp.id) : null}
              gateHint="Answer every checkpoint during the video"
            />
          </>
        )}

        {section === "lesson" && (
          <>
            <h2 className="sr-only">Lesson Sheet</h2>
            <LessonSheetView lesson={lesson} />
            {lesson.activity && (
              <div className="mt-10">
                <ActivityCard def={lesson.activity} lessonId={lesson.meta.id} />
              </div>
            )}
            <SectionNav
              backHref={sectionUrl("video")}
              backLabel="Video"
              nextHref={sectionUrl("references")}
              nextLabel="References"
              markDoneSectionId={lessonSheetStepId(lesson.meta.id)}
            />
          </>
        )}

        {section === "references" && (
          <>
            <ReferencesView lesson={lesson} entries={refs} />
            <SectionNav
              backHref={sectionUrl("lesson")}
              backLabel="Lesson Sheet"
              nextHref={sectionUrl("quiz")}
              nextLabel="Quiz"
              markDoneSectionId={lessonReferencesStepId(lesson.meta.id)}
            />
          </>
        )}

        {section === "quiz" && quiz && (
          <>
            <div className="rounded-xl border border-void-700/70 bg-void-850 px-5 py-4">
              <h2 className="font-display text-2xl font-bold text-ink">Lesson Quiz</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">
                10 questions: six auto-graded (1-6), four written-reasoning (7-10). Score{" "}
                {LESSON_MASTERY_THRESHOLD}% or higher to pass this lesson and unlock the next one.
                Retries never lower your best score.
              </p>
            </div>
            <div className="mt-5">
              <LessonQuizFlow
                lessonId={lesson.meta.id}
                lessonSlug={lesson.meta.slug}
                quizId={quiz.id}
                quizTitle={quiz.title}
                questions={publicQuestions}
                freeResponses={lesson.freeResponses}
                signedIn={!!user}
                initialBest={quizBest}
                initialAttempts={attempts}
                masteryThresholdPct={LESSON_MASTERY_THRESHOLD}
                alreadyBanked={alreadyBanked}
                nextHref={next ? `/academy-new/module/1/lesson/${next.meta.slug}` : null}
                nextLessonTitle={next ? next.meta.title : null}
              />
            </div>
            <SectionNav
              backHref={sectionUrl("references")}
              backLabel="References"
              nextHref={null}
              nextLabel={null}
            />
          </>
        )}

        <TutorPanel lessonId={lesson.meta.id} lessonTitle={lesson.meta.title} />
      </LessonShell>
    </LessonProgressProvider>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import {
  getAcademyModuleState,
  firstIncompleteLessonId,
} from "@/server/services/academyProgress";
import { MODULE_1, MODULE_TEST_PASS_THRESHOLD, LESSON_MASTERY_THRESHOLD } from "@/content/academy/module-1/module";
import { MODULE_TEST } from "@/content/academy/module-1/module-test";
import { LESSONS, lessonById } from "@/content/academy";
import { toPublicQuestion } from "@/lib/academy";
import { pageMetadata } from "@/lib/seo";
import { LessonProgressProvider } from "@/components/academy-new/LessonProgressContext";
import { ModuleTestRunner } from "@/components/academy-new/ModuleTestRunner";
import { ModuleTestLockedScreen } from "@/components/academy-new/LessonLocks";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module: num } = await params;
  if (num !== "1") return { title: "Module test" };
  return pageMetadata({
    title: `Module 1 Test - ${MODULE_1.title}`,
    description: `The Module 1 mastery assessment: ${MODULE_TEST.questions.length} questions across the whole module. Pass mark ${MODULE_TEST_PASS_THRESHOLD}%. Retakes always allowed - your best score counts.`,
    path: "/academy-new/module/1/test",
  });
}

export default async function ModuleTestPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: num } = await params;
  if (num !== "1") notFound();

  const user = await getSessionUser();
  let bestScore: number | null = null;
  let attempts = 0;
  let passed = false;
  let lessonsCompleted = 0;

  if (user) {
    const db = await getDb();
    const state = await getAcademyModuleState(db, user.id);
    bestScore = state.moduleResult?.bestScore ?? null;
    attempts = state.moduleResult?.attempts ?? 0;
    passed = state.moduleResult?.passed ?? false;
    const byLesson = new Map(state.lessonProgress.map((r) => [r.lessonId, r]));
    lessonsCompleted = LESSONS.filter((l) => byLesson.get(l.meta.id)?.status === "completed").length;

    // Sequential rule: the module test opens only when every lesson is
    // completed. Enforced here, not just in the sidebar.
    if (lessonsCompleted < LESSONS.length) {
      const currentId = firstIncompleteLessonId(state);
      const currentLesson = currentId ? lessonById(currentId) : LESSONS[0];
      return (
        <LessonProgressProvider
          lessonId="m1-module-test"
          requiredIds={[]}
          initialDone={[]}
          signedIn
        >
          <ModuleTestLockedScreen
            currentLesson={currentLesson!.meta}
            completedCount={lessonsCompleted}
            totalLessons={LESSONS.length}
          />
        </LessonProgressProvider>
      );
    }
  }

  const publicQuestions = MODULE_TEST.questions.map(toPublicQuestion);

  return (
    <LessonProgressProvider
      lessonId="m1-module-test"
      requiredIds={[]}
      initialDone={[]}
      signedIn={!!user}
    >
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-faint">
          <a href="/academy-new" className="hover:text-ink focus-ring rounded">Academy (New)</a>
          <span aria-hidden="true">/</span>
          <a href="/academy-new/module/1" className="hover:text-ink focus-ring rounded">Module 1</a>
          <span aria-hidden="true">/</span>
          <span className="text-pulse-700 dark:text-pulse-300">Test</span>
        </nav>

        <header className="mt-5">
          <span className="rounded-md bg-pulse-600 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
            MODULE 1 · ASSESSMENT
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
            {MODULE_1.title}: Test
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-dim">
            The module-level mastery assessment. This is not another lesson quiz: it covers
            everything from what machine learning is, through evaluation metrics and data splits,
            to bias, variance and overfitting.
          </p>
        </header>

        <div className="mt-8">
          <ModuleTestRunner
            questions={publicQuestions}
            signedIn={!!user}
            bestScore={bestScore}
            attempts={attempts}
            passed={passed}
            passThreshold={MODULE_TEST_PASS_THRESHOLD}
            lessonMasteryThreshold={LESSON_MASTERY_THRESHOLD}
            lessonsCompleted={lessonsCompleted}
          />
        </div>

        <p className="mt-6 rounded-lg border border-void-700/70 bg-void-850 px-4 py-3 text-xs leading-relaxed text-ink-faint">
          The learning assistant on lesson pages will not provide answers to active test questions,
          but reviewing any lesson, checkpoint or activity beforehand is always allowed, and full
          explanations appear for every question once you submit.
        </p>
      </div>
    </LessonProgressProvider>
  );
}

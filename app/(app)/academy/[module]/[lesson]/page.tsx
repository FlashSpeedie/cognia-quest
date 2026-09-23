import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { moduleBySlug, lessonBySlug } from "@/content/modules";
import { LessonView } from "@/components/academy/LessonView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}): Promise<Metadata> {
  const { module: m, lesson: l } = await params;
  const lesson = lessonBySlug(m, l);
  return { title: lesson ? `${lesson.title} - Cognia Quest` : "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ module: string; lesson: string }> }) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const m = moduleBySlug(moduleSlug);
  const lesson = lessonBySlug(moduleSlug, lessonSlug);
  if (!m || !lesson) notFound();

  const db = await getDb();
  const progress = await db.table("lesson_progress").get(`${user.id}:${lesson.id}`);

  const idx = m.lessons.findIndex((l) => l.id === lesson.id);
  const next = m.lessons[idx + 1];
  const nextHref = next ? `/academy/${m.slug}/${next.slug}` : null;

  return (
    <LessonView
      lesson={lesson}
      moduleSlug={m.slug}
      moduleTitle={m.title}
      completedSections={progress?.sectionsDone ?? []}
      doneLesson={progress?.status === "completed"}
      nextHref={nextHref}
    />
  );
}

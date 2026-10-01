import type { ReactNode } from "react";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { getAcademyModuleState, resumeLessonId } from "@/server/services/academyProgress";
import { LESSONS } from "@/content/academy";
import { AcademyHeader, AcademyFooter } from "@/components/academy-new/AcademyHeader";

/**
 * Public Academy shell. No auth gate: every lesson, activity and the module
 * test are usable anonymously. Signing in adds saved progress, XP and
 * personalized resume - the header simply reflects which mode you're in.
 */
export default async function AcademyLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  let resumeHref = "/academy-new/module/1";

  if (user) {
    try {
      const db = await getDb();
      const state = await getAcademyModuleState(db, user.id);
      const resumeId = resumeLessonId(state);
      const resumeLesson = resumeId ? LESSONS.find((l) => l.meta.id === resumeId) : null;
      resumeHref = resumeLesson
        ? `/academy-new/module/1/lesson/${resumeLesson.meta.slug}`
        : state.moduleResult?.passed
          ? "/academy-new/module/1"
          : "/academy-new/module/1";
    } catch {
      // resume is a convenience - fall back to the module page
    }
  }

  return (
    <div className="app-backdrop min-h-screen">
      <AcademyHeader signedIn={!!user} resumeHref={resumeHref} />
      <main id="main" className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6">
        {children}
      </main>
      <AcademyFooter />
    </div>
  );
}

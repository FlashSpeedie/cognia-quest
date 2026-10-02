import type { ReactNode } from "react";
import { getSessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db/db";
import { getAcademyModuleState, resumeLessonId } from "@/server/services/academyProgress";
import { LESSONS } from "@/content/academy";
import { AppShell } from "@/components/shell/AppShell";
import { AcademyHeader, AcademyFooter } from "@/components/academy-new/AcademyHeader";

/**
 * Academy (New) shell.
 *
 * - Authenticated students get the normal Cognia Quest application shell
 *   (global sidebar + top bar), with the course navigation living inside
 *   the lesson pages - exactly like the rest of the authenticated app.
 * - Anonymous visitors keep the public Academy header/footer: every lesson,
 *   checkpoint, quiz and the module test work without an account.
 *
 * No auth gate either way - signing in only adds saved progress and XP.
 */
export default async function AcademyLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (user) {
    const db = await getDb();
    const [unread, state] = await Promise.all([
      db.table("notifications").find({ userId: user.id, read: false }).then((rows) => rows.length),
      getAcademyModuleState(db, user.id).catch(() => null),
    ]);
    const resumeId = state ? resumeLessonId(state) : null;
    const resumeLesson = resumeId ? LESSONS.find((l) => l.meta.id === resumeId) : null;
    const resumeHref = resumeLesson
      ? `/academy-new/module/1/lesson/${resumeLesson.meta.slug}`
      : "/academy-new/module/1";

    return (
      <AppShell
        user={{
          id: user.id,
          displayName: user.displayName,
          title: user.title,
          avatarId: user.avatarId,
          xpTotal: user.xpTotal,
          role: user.role,
          preferences: user.preferences,
        }}
        unreadCount={unread}
      >
        <p className="sr-only">
          You are in Academy (New): the Module 1 course area. The Academy (New) sidebar entry stays
          highlighted while you learn here.
        </p>
        {children}
      </AppShell>
    );
  }

  return (
    <div className="app-backdrop min-h-screen">
      <AcademyHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6">
        {children}
      </main>
      <AcademyFooter />
    </div>
  );
}

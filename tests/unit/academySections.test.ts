import { describe, it, expect } from "vitest";
import {
  LESSON_SECTION_KEYS,
  LESSON_SECTION_LABELS,
  isLessonSectionKey,
  lessonSheetStepId,
  lessonReferencesStepId,
  lessonQuizStepId,
  lessonSectionProgress,
  lessonSectionUnlocked,
  lessonSectionDone,
  defaultLessonSection,
  clampLessonSection,
  LESSON_MASTERY_THRESHOLD,
} from "@/lib/academy";
import { LESSON_MASTERY_THRESHOLD as REEXPORTED } from "@/content/academy/module-1/module";

const LESSON_ID = "m1-l1";
const CPS = ["m1-l1-cp1", "m1-l1-cp2", "m1-l1-cp3"];

function progress(done: string[], quizBest: number | null = null, lessonCompleted = false) {
  return lessonSectionProgress({
    lessonCompleted,
    checkpointIds: CPS,
    sheetStepId: lessonSheetStepId(LESSON_ID),
    referencesStepId: lessonReferencesStepId(LESSON_ID),
    quizStepId: lessonQuizStepId(LESSON_ID),
    quizBest,
    done,
  });
}

describe("lesson section keys + step ids", () => {
  it("exposes the four sections in teaching order with labels", () => {
    expect([...LESSON_SECTION_KEYS]).toEqual(["video", "lesson", "references", "quiz"]);
    expect(LESSON_SECTION_LABELS.video).toBe("Video");
    expect(LESSON_SECTION_LABELS.lesson).toBe("Lesson Sheet");
    expect(LESSON_SECTION_LABELS.references).toBe("References");
    expect(LESSON_SECTION_LABELS.quiz).toBe("Quiz");
  });

  it("validates section keys from URLs", () => {
    expect(isLessonSectionKey("video")).toBe(true);
    expect(isLessonSectionKey("lesson")).toBe(true);
    expect(isLessonSectionKey("references")).toBe(true);
    expect(isLessonSectionKey("quiz")).toBe(true);
    expect(isLessonSectionKey("checkpoints")).toBe(false);
    expect(isLessonSectionKey(null)).toBe(false);
    expect(isLessonSectionKey("Quiz")).toBe(false);
  });

  it("derives the persistable step ids", () => {
    expect(lessonSheetStepId("m1-l4")).toBe("m1-l4-sheet");
    expect(lessonReferencesStepId("m1-l4")).toBe("m1-l4-refs");
    expect(lessonQuizStepId("m1-l4")).toBe("m1-l4-quiz");
  });

  it("keeps the mastery threshold in one place (lib) re-exported by content", () => {
    expect(LESSON_MASTERY_THRESHOLD).toBe(80);
    expect(REEXPORTED).toBe(80);
  });
});

describe("sequential section access (Video -> Lesson Sheet -> References -> Quiz)", () => {
  it("nothing done: only the video is unlocked; resume at video", () => {
    const p = progress([]);
    expect(lessonSectionUnlocked("video", p)).toBe(true);
    expect(lessonSectionUnlocked("lesson", p)).toBe(false);
    expect(lessonSectionUnlocked("references", p)).toBe(false);
    expect(lessonSectionUnlocked("quiz", p)).toBe(false);
    expect(defaultLessonSection(p)).toBe("video");
  });

  it("checkpoints answered unlock the Lesson Sheet", () => {
    const p = progress(CPS);
    expect(lessonSectionDone("video", p)).toBe(true);
    expect(lessonSectionUnlocked("lesson", p)).toBe(true);
    expect(lessonSectionUnlocked("references", p)).toBe(false);
    expect(defaultLessonSection(p)).toBe("lesson");
  });

  it("sheet read unlocks References", () => {
    const p = progress([...CPS, lessonSheetStepId(LESSON_ID)]);
    expect(lessonSectionUnlocked("references", p)).toBe(true);
    expect(lessonSectionUnlocked("quiz", p)).toBe(false);
    expect(defaultLessonSection(p)).toBe("references");
  });

  it("references read unlock the Quiz", () => {
    const p = progress([...CPS, lessonSheetStepId(LESSON_ID), lessonReferencesStepId(LESSON_ID)]);
    expect(lessonSectionUnlocked("quiz", p)).toBe(true);
    expect(defaultLessonSection(p)).toBe("quiz");
  });

  it("the quiz section is done only when the quiz step is marked AND best >= 80", () => {
    const step = lessonQuizStepId(LESSON_ID);
    // Legacy row: step marked under the old 50% rule with a 60% best.
    const legacy = progress([...CPS, `${LESSON_ID}-sheet`, `${LESSON_ID}-refs`, step], 60);
    expect(lessonSectionDone("quiz", legacy)).toBe(false);
    expect(defaultLessonSection(legacy)).toBe("quiz");
    // Passed at the threshold.
    const passed = progress(
      [...CPS, `${LESSON_ID}-sheet`, `${LESSON_ID}-refs`, step],
      LESSON_MASTERY_THRESHOLD,
    );
    expect(lessonSectionDone("quiz", passed)).toBe(true);
    // Everything complete: review lands on the video.
    expect(defaultLessonSection(passed)).toBe("video");
  });

  it("a completed lesson counts every section as done (review never re-locks)", () => {
    const p = progress([], null, true);
    expect(p.videoDone && p.sheetDone && p.referencesDone && p.quizDone).toBe(true);
    for (const key of LESSON_SECTION_KEYS) {
      expect(lessonSectionUnlocked(key, p)).toBe(true);
      expect(lessonSectionDone(key, p)).toBe(true);
    }
    expect(defaultLessonSection(p)).toBe("video");
  });
});

describe("clampLessonSection (deep-link guard)", () => {
  it("deep links to locked sections fall back to the current section", () => {
    const p = progress([]); // fresh student
    expect(clampLessonSection("quiz", p)).toBe("video");
    expect(clampLessonSection("references", p)).toBe("video");
    expect(clampLessonSection("lesson", p)).toBe("video");
    expect(clampLessonSection("video", p)).toBe("video");
    expect(clampLessonSection(null, p)).toBe("video");

    const mid = progress([...CPS, `${LESSON_ID}-sheet`]);
    expect(clampLessonSection("quiz", mid)).toBe("references");
    expect(clampLessonSection("references", mid)).toBe("references");
  });

  it("unlocked deep links are honored exactly", () => {
    const p = progress([...CPS, `${LESSON_ID}-sheet`, `${LESSON_ID}-refs`]);
    expect(clampLessonSection("quiz", p)).toBe("quiz");
    expect(clampLessonSection("video", p)).toBe("video");
  });
});

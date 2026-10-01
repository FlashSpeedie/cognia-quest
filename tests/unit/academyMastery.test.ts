import { describe, it, expect } from "vitest";
import {
  lessonMasteryPct,
  lessonMasteryState,
  moduleMasteryPct,
  formatTimestamp,
  formatSegment,
  toPublicQuestion,
  LESSON_XP,
  MODULE_TEST_XP,
} from "@/lib/academy";
import { LESSON_QUIZZES } from "@/content/academy/module-1/questions";
import { MODULE_TEST } from "@/content/academy/module-1/module-test";
import { LESSONS } from "@/content/academy/module-1/lessons";

const base = (over: Partial<Parameters<typeof lessonMasteryPct>[0]> = {}) => ({
  sectionsDone: 0,
  requiredSections: 6,
  completed: false,
  quizBest: null,
  attempts: 0,
  ...over,
});

describe("lesson mastery buckets (deterministic + explainable)", () => {
  it("not started when nothing done and no attempt", () => {
    expect(lessonMasteryPct(base())).toBe(0);
    expect(lessonMasteryState(base())).toBe("not_started");
  });

  it("learning once some steps are done but quiz not attempted", () => {
    const input = base({ sectionsDone: 2 });
    expect(lessonMasteryPct(input)).toBe(40);
    expect(lessonMasteryState(input)).toBe("learning");
  });

  it("practicing once the quiz is attempted, even before completion", () => {
    const input = base({ sectionsDone: 2, attempts: 1, quizBest: 40 });
    expect(lessonMasteryPct(input)).toBe(55);
    expect(lessonMasteryState(input)).toBe("practicing");
  });

  it("completed when every required step is done (quiz >= 50% implied)", () => {
    const input = base({ sectionsDone: 6, completed: true, attempts: 1, quizBest: 60 });
    expect(lessonMasteryPct(input)).toBe(70);
    expect(lessonMasteryState(input)).toBe("practicing");
  });

  it("mastered only with completion AND best quiz >= 80", () => {
    const mastered = base({ sectionsDone: 6, completed: true, attempts: 2, quizBest: 80 });
    expect(lessonMasteryPct(mastered)).toBe(100);
    expect(lessonMasteryState(mastered)).toBe("mastered");
    const almost = base({ sectionsDone: 6, completed: true, attempts: 2, quizBest: 79 });
    expect(lessonMasteryPct(almost)).toBe(70);
  });
});

describe("module mastery formula", () => {
  it("weighs 70% lessons + 30% best test score", () => {
    const lessons = [100, 100, 100, 100, 100, 100, 100, 100];
    expect(moduleMasteryPct(lessons, 100)).toBe(100);
    expect(moduleMasteryPct(lessons, 0)).toBe(70);
    expect(moduleMasteryPct(lessons, null)).toBe(70);
  });

  it("caps the module at 70% until the test is taken", () => {
    expect(moduleMasteryPct([100, 100, 100, 100, 100, 100, 100, 100], null)).toBe(70);
    expect(moduleMasteryPct([100, 100, 100, 100, 100, 100, 100, 100], 50)).toBe(85);
  });

  it("averages lesson mastery across the module", () => {
    const half = [100, 100, 100, 100, 0, 0, 0, 0];
    expect(moduleMasteryPct(half, null)).toBe(35); // 0.7 * 50
  });

  it("handles the empty module", () => {
    expect(moduleMasteryPct([], 100)).toBe(0);
  });
});

describe("timestamp formatting", () => {
  it("formats minutes:seconds under an hour", () => {
    expect(formatTimestamp(0)).toBe("0:00");
    expect(formatTimestamp(1043)).toBe("17:23");
    expect(formatTimestamp(3001)).toBe("50:01");
  });

  it("formats h:mm:ss at an hour and beyond", () => {
    expect(formatTimestamp(3915)).toBe("1:05:15");
    expect(formatTimestamp(6063)).toBe("1:41:03");
  });

  it("formats segment ranges", () => {
    expect(formatSegment(3001, 3143)).toBe("50:01\u201352:23");
  });
});

describe("public question stripping", () => {
  it("keeps rendering fields but removes answers and explanations", () => {
    const quiz = LESSON_QUIZZES[0]!;
    for (const q of quiz.questions) {
      const pub = toPublicQuestion(q);
      const json = JSON.stringify(pub);
      expect(json).not.toContain("correct");
      expect(json).not.toContain("explanation");
      expect(pub.id).toBe(q.id);
      expect(pub.kind).toBe(q.kind);
    }
  });

  it("module test questions also strip to public form", () => {
    for (const q of MODULE_TEST.questions) {
      const json = JSON.stringify(toPublicQuestion(q));
      expect(json).not.toContain("explanation");
    }
  });
});

describe("content invariants", () => {
  it("every lesson's required steps are unique and cover checkpoints + activity + quiz + free response", () => {
    for (const l of LESSONS) {
      const ids = l.requiredSectionIds;
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(`${l.meta.id}-activity`);
      expect(ids).toContain(`${l.meta.id}-quiz`);
      expect(ids).toContain(`${l.meta.id}-freeresponse`);
      const checkpointIds = l.blocks
        .filter((b) => b.kind === "checkpoint")
        .map((b) => (b as { checkpoint: { id: string } }).checkpoint.id);
      for (const c of checkpointIds) expect(ids).toContain(c);
    }
  });

  it("every quiz id referenced by a lesson exists in the question bank", () => {
    const ids = new Set(LESSON_QUIZZES.map((q) => q.id));
    for (const l of LESSONS) expect(ids.has(l.quizId)).toBe(true);
  });

  it("every lesson segment matches its intended chapter range", () => {
    const expectRange = [
      [0, 1043],
      [1043, 1566],
      [3001, 3143],
      [3143, 3282],
      [3282, 3702],
      [3702, 3907],
      [3915, 4341],
      [4349, 6063],
    ] as const;
    LESSONS.forEach((l, i) => {
      expect(l.meta.segment.start).toBe(expectRange[i]![0]);
      expect(l.meta.segment.end).toBe(expectRange[i]![1]);
    });
  });

  it("XP constants stay in sync with the rules economy", () => {
    expect(LESSON_XP).toBe(50);
    expect(MODULE_TEST_XP).toBe(150);
  });
});

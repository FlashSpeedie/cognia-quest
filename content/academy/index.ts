/**
 * Server-side Academy content barrel. Import from here in server components
 * and route handlers. Client components must use `import type` only.
 */
export {
  MODULE_1,
  MODULE_TEST_PASS_THRESHOLD,
  LESSON_MASTERY_THRESHOLD,
  LESSON_SEGMENTS,
  lessonVideoSeconds,
  lessonMetaBySlug,
  lessonMetaById,
} from "./module-1/module";
export { LESSONS, lessonBySlug, lessonById, checkpointsOf, markableStepIds } from "./module-1/lessons";
export { LESSON_QUIZZES, quizById } from "./module-1/questions";
export { MODULE_TEST } from "./module-1/module-test";
export { KNOWLEDGE, retrieveKnowledge } from "./module-1/knowledge";
export { moduleReferences, lessonReferences, segmentRange } from "./module-1/references";

import { z } from "zod";

/** Shared enum: AI Detective issue types (matches content schema). */
export const detection_issueTypes = z.enum([
  "hallucination",
  "unsupported",
  "outdated",
  "bias",
  "misleading",
  "missing-context",
  "privacy",
  "overconfidence",
  "none",
]);

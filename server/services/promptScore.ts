/**
 * Prompt scoring rubric (spec §15). Deterministic educational heuristic -
 * NOT a scientific measurement. Each dimension scores 0–5; total 0–100.
 */

export interface PromptDimension {
  key: string;
  label: string;
  score: number; // 0-5
  passed: boolean; // score >= 3
  tip: string;
}

export interface PromptScore {
  total: number; // 0-100
  grade: "weak" | "okay" | "strong";
  dimensions: PromptDimension[];
  improvedVs: string | null; // one-line coach note
}

const hasAny = (text: string, patterns: RegExp[]) => patterns.some((p) => p.test(text));

const RX = {
  audience: [
    /\b(\d{1,2})(th|st|nd|rd)[ -]?grade/i,
    /\b\d{1,2}[ -]year[ -]old/i,
    /\bfor (a |an )?(beginner|child|kid|student|teen|expert|class|teacher|my (friend|grandma|brother|sister))/i,
    /\b(beginners?|dummies|high[ -]?school|middle[ -]?school|college)\b/i,
    /\blike i'?m (5|10|new)/i,
  ],
  format: [
    /\b(bullet|list|table|outline|steps?|flashcards?|quiz|summary|paragraphs?|sections?|headings?|chart|diagram|script|essay|analogy|analogies)\b/i,
    /\bformat(ed)?\b/i,
    /\bq(&|and) ?a\b/i,
  ],
  constraints: [
    /\b(no more than|at most|at least|exactly|under|over|fewer than) \d+/i,
    /\b\d+ (words?|sentences?|paragraphs?|minutes?|slides?|questions?|examples?|ideas?|points?)\b/i,
    /\b(without|avoid|don't include|no jargon|only use)\b/i,
  ],
  context: [
    /\b(i'?m|i am|we('re| are)|my (class|teacher|project|exam|test|notes)|our)\b/i,
    /\bfor (my|our) (class|exam|test|project|essay|presentation|homework)\b/i,
    /\bwhich (i|we)\b/i,
    /\b(biology|chemistry|history|math|english|spanish|physics|computer) (student|class|exam|student)/i,
    /\b(for a \d{1,2}(th|st|nd|rd)[ -]?grade)/i,
  ],
  goal: [
    /\b(explain|summari[sz]e|create|write|generate|list|compare|contrast|design|plan|debug|fix|refactor|teach|quiz me|brainstorm|outline|translate|review|critique|improve|rewrite)\b/i,
  ],
  verification: [
    /\b(cite|source|reference|link)\b/i,
    /\b(show your|explain your|step[ -]?by[ -]?step|reasoning)\b/i,
    /\b(if (you'?re|you are) unsure|say so|don'?t (make up|guess)|flag|uncertain)\b/i,
    /\b(check|verify|double[ -]?check)\b/i,
  ],
  specificityTopic: /\b(photosynthesis|cell|quadratic|essay|french revolution|world war|python|javascript|dna|climate|algorithm|gravity|shakespeare|romeo|hamlet|ecosystem|fractions?|equations?)\b/i,
};

function dimensionScore(prompt: string): PromptDimension[] {
  const p = prompt.trim();
  const words = p.split(/\s+/).filter(Boolean).length;
  const sentences = p.split(/[.!?\n]+/).filter((s) => s.trim().length > 2).length;

  // clarity: structure, capitalization, length sanity, question/task form
  let clarity = 1;
  if (words >= 6) clarity++;
  if (words >= 15) clarity++;
  if (/[a-z]/.test(p[0] ?? "") === false) clarity++; // capitalized start
  if (sentences >= 1 && !/\.\.\.+$/.test(p)) clarity++;
  if (words < 4) clarity = Math.min(clarity, 1);

  const bool5 = (hit: boolean) => (hit ? 5 : 0);

  const audience = bool5(hasAny(p, RX.audience));
  const format = bool5(hasAny(p, RX.format));
  const constraints = bool5(hasAny(p, RX.constraints));
  const context = bool5(hasAny(p, RX.context)) ;
  const goal = hasAny(p, RX.goal) ? 5 : /^(what|how|why|when|where|who|can you|could you)/i.test(p) ? 3 : 0;
  const verification = bool5(hasAny(p, RX.verification));
  // specificity: concrete nouns/scope, length of task description
  let specificity = 0;
  if (RX.specificityTopic.test(p) || /\b(the|this|my|these) [a-z]{3,}/i.test(p)) specificity += 2;
  if (words >= 10) specificity += 1;
  if (words >= 20) specificity += 1;
  if (/\d/.test(p)) specificity += 1;

  const mk = (key: string, label: string, score: number, tip: string): PromptDimension => ({
    key, label, score: Math.min(5, score), passed: score >= 3, tip,
  });

  return [
    mk("clarity", "Clarity", clarity, "Write one clear, complete sentence describing the task."),
    mk("context", "Context", context, "Say who you are or what class/project this is for."),
    mk("specificity", "Specificity", specificity, "Name the exact topic and scope (not just 'help with biology')."),
    mk("audience", "Audience", audience, "State who it's for: 'for a 9th-grade biology student'."),
    mk("format", "Format", format, "Choose an output shape: bullets, table, flashcards, outline..."),
    mk("constraints", "Constraints", constraints, "Add limits: word counts, 'no jargon', number of ideas."),
    mk("goal", "Goal", goal, "Use a clear action verb: explain, summarize, compare, create..."),
    mk("verification", "Verification", verification, "Ask for sources, step-by-step reasoning, or 'flag anything unsure'."),
  ];
}

export function scorePrompt(prompt: string): PromptScore {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return {
      total: 0,
      grade: "weak",
      dimensions: dimensionScore(""),
      improvedVs: null,
    };
  }
  const dims = dimensionScore(trimmed);
  // weighted total → 0..100
  const raw = dims.reduce((s, d) => s + d.score, 0); // max 40
  let total = Math.round((raw / 40) * 100);
  // length sweetener: very short prompts cap low even with keywords
  const words = trimmed.split(/\s+/).length;
  if (words < 8) total = Math.min(total, 45);
  if (words < 5) total = Math.min(total, 30);
  total = Math.min(100, total);

  const missing = dims.filter((d) => !d.passed);
  const improvedVs =
    missing.length === 0
      ? "Excellent - this prompt covers all eight rubric dimensions."
      : `Next improvement: add ${missing
          .slice(0, 2)
          .map((d) => d.label.toLowerCase())
          .join(" and ")}.`;

  return {
    total,
    grade: total >= 75 ? "strong" : total >= 50 ? "okay" : "weak",
    dimensions: dims,
    improvedVs,
  };
}

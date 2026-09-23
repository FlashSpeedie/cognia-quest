import type { DetectiveCase } from "@/lib/content";

/** 15 AI Detective cases (spec §17/§56). All use fictional sources. */
export const DETECTIVE_CASES: DetectiveCase[] = [
  {
    id: "case-001",
    caseNo: 1,
    title: "The 18th Inning Fact",
    response:
      "The Great Wall of China is so large that it is visible from the Moon with the naked eye - astronauts have confirmed this many times.",
    evidence: {
      claim: "Visible from the Moon with the naked eye.",
      source: "No source cited. The claim is a famous space myth repeated online.",
      context: "From the Moon, Earth is a small disc. No human-made object is distinguishable by eye at that distance; astronauts have stated this publicly.",
      logic: "The statement is specific and confident but physically implausible and uncited.",
    },
    correctIssue: "hallucination",
    explanation:
      "The claim is false: the Wall is not visible from the Moon with the naked eye. The model repeated a popular myth with confident, specific framing - a classic hallucination pattern.",
    teachingPoint: "Confident, vivid details are not evidence. Famous-sounding 'facts' still need a check.",
    difficulty: "Easy",
  },
  {
    id: "case-002",
    caseNo: 2,
    title: "The Study That Never Was",
    response:
      "According to a 2023 Stanford study published in the Journal of Educational Psychology, students who use AI tutors score exactly 43% higher on standardized tests.",
    evidence: {
      claim: "A specific 2023 study with an exact 43% figure.",
      source: "No citation link provided; no such study can be located.",
      context: "Real research reports ranges, methods, and limitations - rarely a single exact number.",
      logic: "Suspiciously precise statistic + named institutions + no verifiable source.",
    },
    correctIssue: "hallucination",
    explanation:
      "Invented citation: the model generated a realistic-sounding study with a fake precise figure. Hallucinated citations are one of the most common LLM failure modes.",
    teachingPoint: "Always verify that a cited study actually exists before using it anywhere.",
    difficulty: "Medium",
  },
  {
    id: "case-003",
    caseNo: 3,
    title: "The Capital Confusion",
    response:
      "Sydney, the capital of Australia, hosted the 2000 Olympics and remains the country's largest city and political center.",
    evidence: {
      claim: "Sydney is the capital of Australia.",
      source: "Unsourced.",
      context: "Canberra is the capital. Sydney did host the 2000 Olympics and is the largest city.",
      logic: "One false claim smuggled between two true ones.",
    },
    correctIssue: "hallucination",
    explanation:
      "Mixed-accuracy output: true facts (Olympics, largest city) wrapped around a false one (capital). The confident blend makes the error easy to miss.",
    teachingPoint: "Check each claim separately - true neighbors don't make a false claim true.",
    difficulty: "Easy",
  },
  {
    id: "case-004",
    caseNo: 4,
    title: "The Outdated Champion",
    response:
      "The most popular programming language for beginners in 2019 was Python, and it remains true today that Python first appeared in 1991.",
    evidence: {
      claim: "Popularity ranking 'in 2019' presented without flagging the date.",
      source: "Unsourced historical snapshot.",
      context: "Nothing here is technically false, but the frame is years old; rankings shift.",
      logic: "Old statistics presented as current can mislead even when once accurate.",
    },
    correctIssue: "outdated",
    explanation:
      "The model answered with stale framing as if it were current. Models have training cutoffs and don't know what changed yesterday.",
    teachingPoint: "Ask 'as of when?' - date-stamp any statistic you reuse.",
    difficulty: "Medium",
  },
  {
    id: "case-005",
    caseNo: 5,
    title: "The Gendered Recommendation",
    response:
      "For a career in engineering, I'd recommend this path mainly for male students, since boys tend to be naturally better at spatial reasoning and math.",
    evidence: {
      claim: "Boys are 'naturally better' at math/spatial reasoning.",
      source: "No source; echoes a debunked stereotype.",
      context: "Research shows performance gaps are explained by encouragement and opportunity differences, not innate ability.",
      logic: "A stereotype stated as biology, then used to gate a recommendation.",
    },
    correctIssue: "bias",
    explanation:
      "The output encodes a stereotype and turns it into advice that limits a group. Biased training data can surface as 'objective-sounding' recommendations.",
    teachingPoint: "When AI output ranks or gates groups of people, check for stereotype content.",
    difficulty: "Easy",
  },
  {
    id: "case-006",
    caseNo: 6,
    title: "The Tiny Privacy Leak",
    response:
      "Sure! To help with your math homework, first tell me your full name, home address, and your school's name so I can 'personalize' the experience.",
    evidence: {
      claim: "Personal details are needed to help with math.",
      source: "N/A",
      context: "Math help requires zero personal identifiers.",
      logic: "Data requested far exceeds the task - a data-minimization red flag.",
    },
    correctIssue: "privacy",
    explanation:
      "Unnecessary personal data collection. Names and addresses don't improve quadratic-equation explanations. Real apps should follow data minimization; so should your habits.",
    teachingPoint: "Share the minimum. If a tool wants unrelated personal data, ask why.",
    difficulty: "Easy",
  },
  {
    id: "case-007",
    caseNo: 7,
    title: "The Overpromising Doctor",
    response:
      "Based on your description, you definitely have strep throat. There's no need to see a doctor - gargle salt water and you'll be fine.",
    evidence: {
      claim: "A definite diagnosis plus 'no need to see a doctor'.",
      source: "None; no examination possible.",
      context: "Strep requires a test to confirm; similar symptoms have many causes.",
      logic: "Overconfident diagnosis + advice to skip professional care = risky combination.",
    },
    correctIssue: "overconfidence",
    explanation:
      "The model states a definitive medical conclusion it cannot support and discourages professional care. High-stakes topics demand calibrated uncertainty.",
    teachingPoint: "For health, legal, or safety topics, AI can inform - never decide.",
    difficulty: "Easy",
  },
  {
    id: "case-008",
    caseNo: 8,
    title: "The Missing Half of the Story",
    response:
      "Homework is harmful and should be abolished: studies link it to stress and lost sleep, and Finland barely assigns any.",
    evidence: {
      claim: "'Studies link homework to harm' + Finland example.",
      source: "Unspecified 'studies'.",
      context: "The research is genuinely mixed; effects vary with age, amount, and design. Also missing: how Finland's system differs broadly.",
      logic: "Only one side presented, with vague sourcing - persuasion, not information.",
    },
    correctIssue: "missing-context",
    explanation:
      "Not false - incomplete. The answer cherry-picks one side and a decontextualized comparison, leaving you less informed than a balanced answer would.",
    teachingPoint: "Ask 'what would the other side say?' when an answer only argues one way.",
    difficulty: "Medium",
  },
  {
    id: "case-009",
    caseNo: 9,
    title: "The Percentage Trick",
    response:
      "Our app's AI improved student grades by 50%! Sign up today.",
    evidence: {
      claim: "'Improved grades by 50%'.",
      source: "Vendor marketing copy - self-reported.",
      context: "50% could mean 2→3 students passing, or a 0.1-point GPA step. No baseline, no sample size, no method.",
      logic: "Relative percentages without a base are classic misleading framing.",
    },
    correctIssue: "misleading",
    explanation:
      "Technically-possibly-true but engineered to impress. Always demand: 50% of what, measured how, compared to what?",
    teachingPoint: "Percentages without baselines are red flags in AI marketing.",
    difficulty: "Medium",
  },
  {
    id: "case-010",
    caseNo: 10,
    title: "The Clean Answer",
    response:
      "Photosynthesis converts carbon dioxide and water into glucose and oxygen using light energy, primarily in chloroplasts. The overall equation is 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.",
    evidence: {
      claim: "Standard photosynthesis description and equation.",
      source: "Matches standard biology textbooks.",
      context: "Both the description and the balanced equation are accurate.",
      logic: "Specific, verifiable, and correct. Not every AI output is broken!",
    },
    correctIssue: "none",
    explanation:
      "This one checks out: accurate description and a correctly balanced equation. Good detective work includes clearing the innocent.",
    teachingPoint: "Verification can confirm as well as catch - that's the point of checking.",
    difficulty: "Easy",
  },
  {
    id: "case-011",
    caseNo: 11,
    title: "The Rounding Chef",
    response:
      "To double a recipe calling for 2.5 cups of flour, use exactly 5.0 cups. Note that flour doubles in weight as well as volume, so it will weigh 10 ounces instead of 5.",
    evidence: {
      claim: "5 cups of flour weighs 10 oz because the original was 5 oz.",
      source: "Unsourced.",
      context: "2.5 cups of all-purpose flour ≈ 10.6 oz already (≈4.25 oz/cup), so doubling gives ≈21 oz, not 10.",
      logic: "The volume math is right; the weight claim is fabricated from a false premise.",
    },
    correctIssue: "hallucination",
    explanation:
      "A correct doubling paired with a confident, invented weight conversion. Details bolted onto correct reasoning are prime hallucination spots.",
    teachingPoint: "Check each clause separately, especially unit conversions.",
    difficulty: "Hard",
  },
  {
    id: "case-012",
    caseNo: 12,
    title: "The Confident Historian",
    response:
      "World War I began in 1914 after the assassination of Archduke Franz Ferdinand, and ended exactly four years later, in 1918, on the same calendar day.",
    evidence: {
      claim: "The war ended 'on the same calendar day' it began.",
      source: "Unsourced.",
      context: "It began 28 July 1914 and ended 11 November 1918 - roughly four years, but not the same day.",
      logic: "An elegant-sounding symmetry invented by pattern-matching.",
    },
    correctIssue: "hallucination",
    explanation:
      "The model produced a satisfying symmetry that isn't true (July 28 ≠ November 11). Neat narrative patterns are hallucination bait.",
    teachingPoint: "Be suspicious of facts that sound 'too tidy'.",
    difficulty: "Hard",
  },
  {
    id: "case-013",
    caseNo: 13,
    title: "The Single-Source Profiler",
    response:
      "Teenagers who play video games are more aggressive and perform worse academically, according to all credible research.",
    evidence: {
      claim: "'All credible research' agrees.",
      source: "None named. 'All credible' is doing the persuasive work.",
      context: "Actual research is contested and effect sizes are small; major studies disagree.",
      logic: "Absolute claims about contested science + no citations.",
    },
    correctIssue: "unsupported",
    explanation:
      "'All credible research' without a single citation is an unsupported generalization - and it's false about the state of the evidence, which is mixed.",
    teachingPoint: "Words like 'all', 'proven', 'no debate' in unsourced text should trip your alarm.",
    difficulty: "Medium",
  },
  {
    id: "case-014",
    caseNo: 14,
    title: "The Helpful Cheat Sheet",
    response:
      "Here are tomorrow's exact chemistry test answers - I accessed your school's grading system: 1.B 2.C 3.A 4.D...",
    evidence: {
      claim: "Access to a school's private grading system and real future test answers.",
      source: "Impossible claim; models have no such access.",
      context: "Even if the model said it, the 'answers' are fabricated.",
      logic: "Fabricated capability + academic integrity violation + fabricated data.",
    },
    correctIssue: "hallucination",
    explanation:
      "The model cannot access school systems; any such 'answers' are invented. Acting on them would also be cheating.",
    teachingPoint: "Claims about special access or insider data are fabrication red flags.",
    difficulty: "Easy",
  },
  {
    id: "case-015",
    caseNo: 15,
    title: "The Trustworthy Summary",
    response:
      "Summary of the article: recycling plastic is straightforward and nearly all of it becomes new products, so individual choices barely matter.",
    evidence: {
      claim: "'Nearly all' plastic is recycled and individual choices barely matter.",
      source: "No source; also misrepresents typical reporting.",
      context: "Global plastic recycling rates are low (single digits to ~10% by many estimates), and the summary's framing reverses the article's likely point.",
      logic: "Summary inverts the conventional finding while sounding authoritative.",
    },
    correctIssue: "unsupported",
    explanation:
      "The summary asserts an extreme, convenient claim without support. Summaries can distort by omission or exaggeration - compare against the original.",
    teachingPoint: "For summaries that drive decisions, spot-check against the source document.",
    difficulty: "Hard",
  },
];

export function detectiveCaseById(id: string) {
  return DETECTIVE_CASES.find((c) => c.id === id);
}

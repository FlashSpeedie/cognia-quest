/** Final AI Challenge — capstone stages (spec §26). Server-validated rubric. */

export type FinalStage =
  | {
      id: string;
      kind: "multi-select";
      title: string;
      briefing: string;
      options: { id: string; label: string; good: boolean; why: string }[];
      minGood: number;
    }
  | {
      id: string;
      kind: "mcq";
      title: string;
      briefing: string;
      options: string[];
      correct: number;
      why: string;
    }
  | {
      id: string;
      kind: "prompt";
      title: string;
      briefing: string;
      passScore: number;
    }
  | {
      id: string;
      kind: "checklist";
      title: string;
      briefing: string;
      items: { id: string; label: string; important: boolean }[];
    }
  | {
      id: string;
      kind: "verdict";
      title: string;
      briefing: string;
      options: { label: string; defensible: boolean; why: string }[];
    };

export const FINAL_STAGES: FinalStage[] = [
  {
    id: "choose-data",
    kind: "multi-select",
    title: "Stage 1 — Choose the Data",
    briefing:
      "A fictional school wants an AI to flag students who may need academic support. Which inputs are appropriate to use? Select all that are reasonable.",
    minGood: 4,
    options: [
      { id: "grades", label: "Recent grades & trends", good: true, why: "Directly related to academic standing." },
      { id: "assignments", label: "Assignment completion rate", good: true, why: "Behavioral signal about engagement." },
      { id: "attendance", label: "Attendance rate", good: true, why: "Strong, relevant, routinely collected signal." },
      { id: "advisor", label: "Advisor/counselor notes flagged for follow-up", good: true, why: "Human judgment as one input — with oversight." },
      { id: "address", label: "Home address", good: false, why: "Sensitive location data; proxies for income & ethnicity." },
      { id: "lunch", label: "Free/reduced lunch status", good: false, why: "Socioeconomic proxy — penalizes poverty, not need for support." },
      { id: "surname", label: "Student surname", good: false, why: "Pure identifier; proxies ethnicity. Irrelevant and risky." },
      { id: "browser", label: "Library computer browsing history", good: false, why: "Privacy-invasive and unrelated to support needs." },
    ],
  },
  {
    id: "spot-problem",
    kind: "mcq",
    title: "Stage 2 — Inspect the Dataset",
    briefing:
      "The training data: 800 records from the school's honors program last year and 120 from all other programs combined. What is the most serious problem?",
    options: [
      "The dataset is too old to trust",
      "It's heavily imbalanced — mostly honors students, so the model learns 'honors = fine' and may ignore everyone else",
      "There aren't enough columns",
      "It needs more decimal places",
    ],
    correct: 1,
    why: "Representation problems in data become blind spots in models. The fix is balanced, representative data — not more of the same.",
  },
  {
    id: "train-config",
    kind: "mcq",
    title: "Stage 3 — Configure the Training",
    briefing:
      "You have a balanced dataset of 6,000 student records. Which training setup gives an honest picture of how the model will perform on next year's students?",
    options: [
      "Train on ALL 6,000 records, then report accuracy on the same data — maximum data for learning",
      "Hold out 25% for testing, tune on the rest, and audit accuracy separately by student group",
      "Train on this year's data and test on the same students next week, since they're the same people",
    ],
    correct: 1,
    why: "A held-out test plus group-level audits. Training on everything measures memory, not skill; 'same students next week' leaks the future into the evaluation.",
  },
  {
    id: "read-results",
    kind: "mcq",
    title: "Stage 4 — Read the Results",
    briefing:
      "After retraining on balanced data: overall accuracy 89%, but among students with intermittent attendance the model misses 3 out of 5 who later needed help. What does this mean?",
    options: [
      "The model is fine — 89% is high",
      "Overall accuracy hides a weak spot: high misses (false negatives) for one group — the very students the system exists to catch",
      "The 89% figure must be a hallucination",
      "Accuracy doesn't matter at all",
    ],
    correct: 1,
    why: "Always check group-level error rates. Averages conceal the exact failures that matter most for a support tool.",
  },
  {
    id: "prompt-write",
    kind: "prompt",
    title: "Stage 5 — Write the Explanation Prompt",
    briefing:
      "The system will show teachers AI-generated explanations of why a student was flagged. Write the prompt that generates those explanations. Make it specific: audience (busy teachers), format, tone (supportive, not labeling), what to avoid (blame), what to include (concrete next steps, uncertainty note).",
    passScore: 70,
  },
  {
    id: "detect-issue",
    kind: "mcq",
    title: "Stage 6 — Review the AI Output",
    briefing:
      "The system tells a teacher: 'Student #4471 will fail math this quarter (certainty: 99.2%). This is final and requires no further review.' What's the biggest issue?",
    options: [
      "The student ID should be longer",
      "The fine print is hard to read",
      "Overconfident prediction presented as final, explicitly discouraging human review — predictions inform, they don't decide",
      "Nothing — 99.2% is very accurate",
    ],
    correct: 2,
    why: "99.2% 'certainty' that forbids review is both statistically dubious and an accountability red flag.",
  },
  {
    id: "checklist",
    kind: "checklist",
    title: "Stage 7 — The Deployment Checklist",
    briefing: "Which conditions must be true before this system goes live? Select all that apply.",
    items: [
      { id: "c1", label: "Students & families are told the system exists", important: true },
      { id: "c2", label: "A counselor reviews every flag before any action", important: true },
      { id: "c3", label: "Group-level accuracy is audited each term", important: true },
      { id: "c4", label: "Students can contest a flag", important: true },
      { id: "c5", label: "Data is minimized and retention-limited", important: true },
      { id: "c6", label: "The vendor's logo should be bigger", important: false },
      { id: "c7", label: "Predictions auto-generate detentions", important: false },
      { id: "c8", label: "The vendor contract forbids secondary data use", important: true },
    ],
  },
  {
    id: "verdict",
    kind: "verdict",
    title: "Stage 8 — Your Recommendation",
    briefing: "You've seen the data, the model's strengths and blind spots, and the deployment risks. What should the school do?",
    options: [
      { label: "Deploy immediately, exactly as proposed", defensible: false, why: "The proposal lacks transparency, review, contestability, and bias auditing." },
      { label: "Deploy a limited pilot with the safeguards from Stage 6, audited each term", defensible: true, why: "Captures potential benefit while containing risk with oversight and review." },
      { label: "Ban all AI from schools forever", defensible: false, why: "Abstention isn't analysis: a well-governed tool may genuinely help students." },
    ],
  },
];

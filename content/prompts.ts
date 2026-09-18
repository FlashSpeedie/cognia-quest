import type { PromptTask, ToolScenario } from "@/lib/content";

/** Prompt Battle tasks (spec §16/§56: 10+). */
export const PROMPT_TASKS: PromptTask[] = [
  {
    id: "pb-bio-study",
    category: "Study guide",
    task: "Create a study guide for a biology exam on cell structure.",
    weakExample: "Help me study cells.",
    hints: ["Who is the audience?", "What format helps studying — outline, table, flashcards?", "How long should it be?"],
    expectations: ["audience/level", "format (outline/table/flashcards)", "scope: which organelles/topics", "length cap", "active-recall element (questions)"],
  },
  {
    id: "pb-summary",
    category: "Summarization",
    task: "Summarize a long history article for tomorrow's class discussion.",
    weakExample: "Summarize this.",
    hints: ["How long should the summary be?", "What should it preserve — dates, arguments, quotes?", "Plain language or academic tone?"],
    expectations: ["length limit", "audience", "what to preserve", "tone", "structure"],
  },
  {
    id: "pb-brainstorm",
    category: "Brainstorming",
    task: "Brainstorm science fair project ideas about renewable energy.",
    weakExample: "Give me science fair ideas.",
    hints: ["How many ideas?", "Feasible with school materials?", "Specific to your grade level?"],
    expectations: ["number of ideas", "feasibility constraints", "grade level", "variety across methods", "why each is interesting"],
  },
  {
    id: "pb-tutor",
    category: "Tutoring",
    task: "Get help understanding quadratic functions — without just getting answers.",
    weakExample: "Explain quadratics and do my homework problems.",
    hints: ["Ask for Socratic guidance instead of answers?", "What do you already know?", "How would you like practice checked?"],
    expectations: ["no direct answers / guided approach", "prior knowledge", "examples", "check-understanding step"],
  },
  {
    id: "pb-code",
    category: "Coding help",
    task: "Debug a Python loop that prints the wrong totals.",
    weakExample: "My code is broken, fix it.",
    hints: ["Paste the code?", "Expected vs actual output?", "What have you tried?"],
    expectations: ["include the code", "expected vs actual", "environment/version", "what was tried"],
  },
  {
    id: "pb-plan",
    category: "Study planning",
    task: "Build a two-week study plan for three final exams.",
    weakExample: "Make me a study plan.",
    hints: ["Exam dates?", "Hours available per day?", "Strong vs weak subjects?"],
    expectations: ["exam dates", "available hours", "subject priorities", "rest/breaks", "review sessions"],
  },
  {
    id: "pb-explain",
    category: "Explaining",
    task: "Explain how vaccines train the immune system for a class presentation.",
    weakExample: "Explain vaccines.",
    hints: ["Audience age?", "An analogy would help?", "Presentation time limit?"],
    expectations: ["audience", "analogy", "length/time", "key terms defined", "accuracy + simple"],
  },
  {
    id: "pb-notes",
    category: "Transforming notes",
    task: "Turn messy class notes on the French Revolution into review flashcards.",
    weakExample: "Make flashcards from my notes.",
    hints: ["How many cards?", "Question-answer format?", "Focus on dates, causes, or people?"],
    expectations: ["format (Q→A)", "count", "topic focus", "concise per card"],
  },
  {
    id: "pb-research",
    category: "Research planning",
    task: "Plan a research paper on social media's effects on teens.",
    weakExample: "Write my research paper.",
    hints: ["A plan, not the paper?", "What sections/questions?", "Source types to seek?"],
    expectations: ["outline/structure", "research questions", "source types", "timeline", "citation style"],
  },
  {
    id: "pb-debate",
    category: "Critical thinking",
    task: "Prepare counterarguments for a debate on school uniforms.",
    weakExample: "Give me debate points.",
    hints: ["Which side are you arguing?", "Ask for the strongest opposing points?", "Evidence to support each?"],
    expectations: ["side specified", "steel-manned opposing points", "evidence requested", "rebuttal structure"],
  },
];

/** AI Tool Selector scenarios (spec §23). */
export const TOOL_SCENARIOS: ToolScenario[] = [
  {
    id: "tool-sci-fair",
    scenario: "You need to brainstorm science fair project ideas and refine the best one.",
    options: ["Conversational AI", "Image generator", "Calculator", "Spreadsheet"],
    correct: 0,
    why: "Ideation and refinement through dialogue is exactly what conversational AI does well.",
    risks: "It may suggest infeasible or unsafe experiments — sanity-check materials and safety.",
    verify: "Confirm your idea is allowed by the fair's rules and feasible with available materials.",
  },
  {
    id: "tool-chart",
    scenario: "You measured plant growth for 30 days and need to find the growth trend.",
    options: ["Spreadsheet/data analysis", "Image generator", "Conversational AI", "Music generator"],
    correct: 0,
    why: "Structured numeric data → trends and charts is spreadsheet/analysis territory; deterministic and exact.",
    risks: "AI chat could hallucinate numbers instead of computing them.",
    verify: "Spot-check the trend math by hand on a few rows.",
  },
  {
    id: "tool-poster",
    scenario: "You need an eye-catching poster background for the robotics club.",
    options: ["Image generation", "Spreadsheet", "Calculator", "Grammar checker"],
    correct: 0,
    why: "Visual asset creation is image generation's job.",
    risks: "Check usage rights/school policy; avoid generating logos or people without consent.",
    verify: "Confirm the image license/school rules before printing.",
  },
  {
    id: "tool-bug",
    scenario: "Your JavaScript timer counts up instead of down.",
    options: ["Coding assistant", "Image generator", "Recommender system", "Music generator"],
    correct: 0,
    why: "Code-specific debugging fits coding assistants trained on code patterns.",
    risks: "Suggested fixes can subtly break other behavior.",
    verify: "Run the code and test edge cases after any suggested fix.",
  },
  {
    id: "tool-math",
    scenario: "You must compute the exact hypotenuse of 7 and 24 for geometry homework.",
    options: ["Calculator", "Conversational AI", "Image generator", "Autocomplete"],
    correct: 0,
    why: "Exact arithmetic is deterministic — calculators don't approximate or hallucinate.",
    risks: "AI chat might produce a confident wrong number.",
    verify: "With AI answers, recompute; with calculators, sanity-check magnitude (7-24-25 triangle).",
  },
  {
    id: "tool-essay",
    scenario: "You want feedback on your essay's argument flow before the deadline.",
    options: ["Conversational AI", "Calculator", "Spreadsheet", "Image generator"],
    correct: 0,
    why: "Structured feedback on writing is a conversational AI strength.",
    risks: "It may miss your teacher's rubric or encourage its style over yours.",
    verify: "Check feedback against the assignment rubric; keep your voice.",
  },
  {
    id: "tool-sources",
    scenario: "You need three credible sources about ocean acidification for a research paper.",
    options: ["Library database / research tool", "Conversational AI alone", "Image generator", "Music generator"],
    correct: 0,
    why: "Research indexes return real, citable sources with publication details.",
    risks: "LLMs can invent citations that look perfectly real.",
    verify: "Whatever the tool suggests, open and read the actual source before citing.",
  },
  {
    id: "tool-vocab",
    scenario: "You want 20 quiz questions from your Spanish vocab list to practice tomorrow.",
    options: ["Conversational AI", "Calculator", "Image generator", "GPS"],
    correct: 0,
    why: "Transforming a list into practice questions is a language task.",
    risks: "Generated questions may contain translation errors.",
    verify: "Spot-check translations against your class list before studying them.",
  },
];

export function promptTaskById(id: string) {
  return PROMPT_TASKS.find((p) => p.id === id);
}

export function toolScenarioById(id: string) {
  return TOOL_SCENARIOS.find((t) => t.id === id);
}

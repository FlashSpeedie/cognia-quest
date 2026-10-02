import type { AcademyLesson } from "../../types";
import { LESSON_SEGMENTS } from "../module";

export const lesson2: AcademyLesson = {
  meta: {
    id: "m1-l2",
    slug: "the-ml-roadmap",
    order: 2,
    title: "The Machine Learning Roadmap",
    minutes: 30,
    summary:
      "The broad skill areas behind practical machine learning - mathematics, statistics, ML, Python and introductory NLP - and how they stack on top of each other.",
    goals: [
      "Name the skill areas that make up practical machine learning",
      "Explain the learning stack from data to applications",
      "Describe what natural language processing means at an introductory level",
    ],
  },
  moduleId: "module-1",
  video: { segments: LESSON_SEGMENTS["m1-l2"]! },
  sheet: {
    coreIdea: [
      "Machine learning can look like an intimidating wall of subjects: mathematics, statistics, programming, algorithms, evaluation. The encouraging truth is that they form a stack - each layer exists to support the one above it, and you climb them in order, not all at once.",
      "This lesson walks the source video's roadmap through five focused segments: the mathematics foundation, the statistics foundation, machine learning fundamentals, the Python foundation, and an introductory look at natural language processing.",
    ],
    vocabulary: [
      {
        term: "The learning stack",
        body: "Data supports statistics and mathematics, which support machine learning algorithms, which are checked by evaluation, which delivers applications.",
      },
      {
        term: "Statistics",
        body: "The tools for summarizing data and reasoning about uncertainty, spread and relationships between variables.",
      },
      {
        term: "Python",
        body: "The programming language most machine learning practitioners use as their practical workbench, because its ecosystem makes working with data fast.",
      },
      {
        term: "Natural language processing (NLP)",
        body: "Machine learning applied to human language - tasks like translation, transcription, sentiment analysis and conversation.",
      },
    ],
    concepts: [
      {
        title: "The stack, layer by layer",
        body: [
          "Data sits at the bottom because it is the raw material for everything. Machine learning means learning from examples - no examples, no learning. The quality, quantity and honesty of your data set a hard ceiling on everything above it.",
          "Statistics and mathematics form the reasoning layer. You don't need to be a mathematician to start, but you do need working intuitions: how to summarize a dataset, what an average hides, how to reason about uncertainty and relationships between variables.",
          "Machine learning itself is the modeling layer: the algorithms that search for patterns. Python is the practical workbench here - the language most practitioners use because its ecosystem makes working with data fast.",
          "Evaluation is the honesty layer: the metrics and experiments that tell you whether a model actually works - or just looks like it does. Finally, applications are where models meet real people: a fraud alert, a recommendation, a route plan.",
        ],
        diagramId: "learning-stack",
      },
      {
        title: "You don't need to master the math first",
        body: [
          "A common trap is believing you must finish years of mathematics before touching machine learning. In practice you learn the layers together, picking up the statistics a concept at a time, exactly when a real question demands it. This module keeps the focus on ideas - the math can deepen later.",
        ],
      },
      {
        title: "Where language fits: NLP",
        body: [
          "Natural language processing is the branch of machine learning concerned with human language: translating a sentence, judging whether a review sounds positive, transcribing speech, powering a chat assistant. Language is messy - words change meaning with context, sarcasm exists, and there are infinite ways to say the same thing - which is exactly why it deserves its own field.",
        ],
      },
    ],
    example: {
      title: "A slow-day diagnosis",
      body: [
        "A team trains a product-recommendation model on shopping data where a third of the responses were accidentally duplicated, skewing the dataset toward one type of customer. Weeks of swapping algorithms later, results are still poor.",
        "The stack tells you why: the problem was never in the modeling layer. Everything above the data layer inherits its flaws - no algorithm can fully recover from corrupted examples. Fix the data first, then rebuild.",
      ],
    },
    commonConfusion: {
      title: "\u201cMore math first, machine learning later\u201d",
      body: "Students often assume the roadmap is a strict prerequisite chain - finish all the mathematics, only then start ML. The source presents these as foundations you build while practicing, not gates you must clear in order. You need working intuitions from statistics and math, sharpened by real modeling questions - not a completed mathematics degree.",
    },
    thinkAboutIt:
      "A team keeps swapping algorithms but results stay poor, and the data turns out to be riddled with errors. What does the stack tell you about where to invest effort first - and can better mathematics above the data layer fully fix it?",
    keyTakeaways: [
      "Practical machine learning is a stack: data, statistics & mathematics, machine learning, evaluation, applications.",
      "Data is the raw material - its quality sets a hard ceiling on everything above it.",
      "Statistics and math give you the tools to reason about data; you learn them alongside ML, not before it.",
      "Python is the practical workbench most practitioners use for working with data.",
      "NLP is machine learning applied to human language - translation, transcription, chat.",
      "Problems flow down the stack: disappointing results usually trace back to a lower layer.",
    ],
    sourceConnection:
      "This lesson plays five consecutive segments of the source video's roadmap chapter (17:23\u201336:27): the mathematics foundation (17:23\u201322:15), the statistics foundation (22:15\u201326:06), machine learning fundamentals (26:06\u201330:33), the Python foundation (30:33\u201334:42), and introductory NLP (34:42\u201336:27). The stack framing is Cognia Quest's organization of the skill areas LunarTech describes.",
  },
  checkpoints: [
    {
      id: "m1-l2-cp1",
      segmentId: "m1-l2-s1",
      timestampSeconds: 280,
      type: "choice",
      concept: "Why the stack starts with data",
      scenario:
        "Midway through the roadmap, a team builds a product-recommendation model on shopping data where the labels were entered incorrectly for a third of the examples.",
      prompt: "What is the most likely outcome?",
      options: [
        "The model will be fine - algorithms automatically detect bad labels",
        "The model's ceiling is set by the data problem; better algorithms can't fully fix it",
        "Evaluation will quietly repair the mislabeled data",
        "The stack layers are independent, so nothing else is affected",
      ],
      correct: 1,
      explanation:
        "Everything above the data layer inherits its problems. No modeling or evaluation trick can fully recover information that was corrupted before it arrived. This is why practitioners obsess over data quality before reaching for fancier algorithms.",
    },
    {
      id: "m1-l2-cp2",
      segmentId: "m1-l2-s3",
      timestampSeconds: 775,
      type: "order",
      concept: "The learning stack",
      prompt: "Put the layers of the machine learning stack in order, from the bottom (start here) to the top.",
      items: ["Applications", "Evaluation", "Data", "Machine learning", "Statistics & mathematics"],
      correctOrder: [2, 4, 3, 1, 0],
      explanation:
        "Data is the raw material, so it comes first. Statistics and mathematics give you the tools to reason about that data. Machine learning algorithms find the patterns. Evaluation tells you whether the patterns are real. Applications deliver the result to real users - the top of the stack.",
    },
    {
      id: "m1-l2-cp3",
      segmentId: "m1-l2-s5",
      timestampSeconds: 1130,
      type: "choice",
      concept: "Evaluation's role in the stack",
      prompt: "Which layer of the stack answers the question: \"Is this model actually any good?\"",
      options: ["Data", "Statistics & mathematics", "Evaluation", "Applications"],
      correct: 2,
      explanation:
        "Evaluation is the honesty layer. Statistics helps you reason about data, but evaluation is specifically about measuring a model's real performance - the difference between a model that looks smart and one that is.",
    },
  ],
  activity: {
    kind: "roadmap-builder",
    heading: "Optional exercise - Build the roadmap",
    intro: "Assemble the five layers in order. Use the move buttons (or your keyboard) to arrange the stack, then check your work.",
  },
  quizId: "quiz-m1-l2",
  freeResponses: [
    {
      id: "fr-m1-l2-1",
      prompt:
        "Explain the machine learning stack to a friend who has never heard of it: what each layer contributes, and why the order matters.",
      guidance: "Aim for 3-5 sentences. Cover the idea that each layer depends on the ones below it.",
      expectedConcepts: ["data", "statistic", "math", "evaluate", "application", "depend", "stack", "layer"],
      rubric: [
        "Names the layers (data, statistics & mathematics, machine learning, evaluation, applications)",
        "Gives each layer a clear purpose in the student's own words",
        "Explains the dependency: problems flow down, value flows up",
      ],
      minLength: 100,
      maxLength: 1200,
    },
    {
      id: "fr-m1-l2-2",
      prompt:
        "The roadmap includes mathematics and statistics as foundations. Explain what these actually contribute to a machine learning project - and why \"learn all the math first\" is the wrong takeaway.",
      guidance: "Aim for 2-3 sentences. What do statistics tools let you do with data?",
      expectedConcepts: ["statistic", "math", "uncertain", "summarize", "relations", "intuition"],
      rubric: [
        "Explains that math/statistics provide tools for summarizing data and reasoning about uncertainty",
        "Argues against the all-math-first trap: intuitions are built alongside practice",
        "Stays concrete rather than vague",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l2-3",
      prompt:
        "Describe what natural language processing is, and give one reason language is a hard kind of data for machine learning to work with.",
      guidance: "Aim for 2-3 sentences. Think about context, sarcasm, or the many ways to say one thing.",
      expectedConcepts: ["nlp", "language", "text", "context", "meaning", "translate"],
      rubric: [
        "Defines NLP as machine learning applied to human language",
        "Identifies a genuine difficulty (context-dependence, ambiguity, endless phrasings)",
        "Optionally names an NLP task (translation, transcription, chat) correctly",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l2-4",
      prompt:
        "A project keeps disappointing despite trying four different ML algorithms. Using the stack, explain where the investigation should start and why the algorithm layer is the wrong first suspect.",
      guidance: "Aim for 2-3 sentences. The words \"data\" and \"ceiling\" may help.",
      expectedConcepts: ["data", "quality", "ceiling", "layer", "fix", "inherit"],
      rubric: [
        "Points the investigation at the data layer first",
        "Explains that upper layers inherit data flaws - a ceiling no algorithm can overcome",
        "Shows the diagnostic habit: trace problems down the stack",
      ],
      minLength: 80,
      maxLength: 1000,
    },
  ],
  requiredSectionIds: [
    "m1-l2-cp1",
    "m1-l2-cp2",
    "m1-l2-cp3",
    "m1-l2-sheet",
    "m1-l2-refs",
    "m1-l2-quiz",
    "fr-m1-l2-1",
    "fr-m1-l2-2",
    "fr-m1-l2-3",
    "fr-m1-l2-4",
  ],
  optionalSectionIds: ["m1-l2-activity"],
};

import type { AcademyLesson } from "../../types";

export const lesson2: AcademyLesson = {
  meta: {
    id: "m1-l2",
    slug: "the-ml-roadmap",
    order: 2,
    title: "The Machine Learning Roadmap",
    minutes: 15,
    segment: { chapter: 2, chapterTitle: "Machine Learning Roadmap", start: 1043, end: 1566 },
    summary:
      "The broad skill areas behind practical machine learning - and how they stack on top of each other, one layer at a time.",
    goals: [
      "Name the skill areas that make up practical machine learning",
      "Explain the learning stack from data to applications",
      "Describe what natural language processing means at an introductory level",
    ],
  },
  moduleId: "module-1",
  quizId: "quiz-m1-l2",
  intro: [
    {
      kind: "text",
      heading: "One subject, several layers",
      paragraphs: [
        "Machine learning can look like an intimidating wall of subjects: mathematics, statistics, programming, algorithms, evaluation. The source course lays out a roadmap through these areas, and the encouraging truth is that they form a stack - each layer exists to support the one above it. You climb them in order, not all at once.",
        "This lesson is a map, not a mountain. By the end you should be able to name the layers, say what each contributes, and understand why problems usually trace back to a lower layer.",
      ],
    },
  ],
  blocks: [
    {
      kind: "diagram",
      id: "learning-stack",
      caption:
        "The machine learning stack - each layer builds on the one beneath it.",
    },
    {
      kind: "text",
      heading: "The stack, layer by layer",
      paragraphs: [
        "Data sits at the bottom because it is the raw material for everything. Machine learning is learning from examples - no examples, no learning. The quality, quantity and honesty of your data set a hard ceiling on everything above it.",
        "Statistics and mathematics form the reasoning layer. You don't need to be a mathematician to start, but you do need working intuitions: how to summarize a dataset, what an average hides, how to reason about uncertainty and relationships between variables. These are the tools for saying anything meaningful about data.",
        "Machine learning itself is the modeling layer: the algorithms that search for patterns - and the habits of supervised, unsupervised, regression and classification thinking you'll meet in the next lessons. Python is the practical workbench here: the language most practitioners use because its ecosystem makes working with data fast.",
        "Evaluation is the honesty layer: the metrics and experiments that tell you whether a model actually works - or just looks like it does. Without evaluation, everything above is opinion. Finally, applications are where models meet real people: a fraud alert, a recommendation, a route plan.",
      ],
    },
    {
      kind: "callout",
      variant: "tip",
      title: "You don't need to master the math first",
      body: "A common trap is believing you must finish years of mathematics before touching machine learning. In practice you learn the layers together, picking up the statistics a concept at a time, exactly when a real question demands it. This module keeps the focus on ideas - the math can deepen later.",
    },
    {
      kind: "text",
      heading: "Where language fits: NLP",
      paragraphs: [
        "One skill area deserves a special mention: natural language processing, or NLP - the branch of machine learning concerned with human language. Translating a sentence, judging whether a review sounds positive, transcribing speech, powering a chat assistant - all are language problems, and language is messy: words change meaning with context, sarcasm exists, and there are infinite ways to say the same thing.",
        "You'll meet language models properly in a later module. For now, remember the label: NLP = machine learning applied to text and speech.",
      ],
    },
    {
      kind: "definition",
      term: "Natural language processing (NLP)",
      body: "Machine learning applied to human language - tasks like translation, transcription, sentiment analysis and conversation.",
    },
    {
      kind: "callout",
      variant: "think",
      title: "Think about it",
      body: "A team trains a model on survey data where half the responses were accidentally duplicated, skewing the dataset toward one type of customer. Which layer of the stack failed first - and can better mathematics or a cleverer algorithm above it fully fix the problem?",
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l2-cp1",
        type: "order",
        concept: "The learning stack",
        prompt: "Put the layers of the machine learning stack in order, from the bottom (start here) to the top.",
        items: ["Applications", "Evaluation", "Data", "Machine learning", "Statistics & mathematics"],
        correctOrder: [2, 4, 3, 1, 0],
        explanation:
          "Data is the raw material, so it comes first. Statistics and mathematics give you the tools to reason about that data. Machine learning algorithms find the patterns. Evaluation tells you whether the patterns are real. Applications deliver the result to real users - the top of the stack.",
      },
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l2-cp2",
        type: "choice",
        concept: "Evaluation's role in the stack",
        prompt: "Which layer of the stack answers the question: \"Is this model actually any good?\"",
        options: [
          "Data",
          "Statistics & mathematics",
          "Evaluation",
          "Applications",
        ],
        correct: 2,
        explanation:
          "Evaluation is the honesty layer. Statistics helps you reason about data, but evaluation is specifically about measuring a model's real performance - the difference between a model that looks smart and one that is.",
      },
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l2-cp3",
        type: "choice",
        concept: "Why the stack starts with data",
        scenario:
          "A team builds a product-recommendation model on shopping data where the labels were entered incorrectly for a third of the examples.",
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
    },
  ],
  activity: {
    kind: "roadmap-builder",
    heading: "Activity - Build the roadmap",
    intro:
      "Assemble the five layers in order. Use the move buttons (or your keyboard) to arrange the stack, then check your work.",
  },
  freeResponse: {
    id: "fr-m1-l2",
    prompt:
      "Explain the machine learning stack to a friend who has never heard of it: what each layer contributes, and why the order matters.",
    guidance: "Aim for 3-5 sentences. Cover the idea that each layer depends on the ones below it.",
    expectedConcepts: [
      "data",
      "statistic",
      "math",
      "evaluate",
      "application",
      "depend",
      "stack",
      "layer",
    ],
    rubric: [
      "Names the layers (data, statistics & mathematics, machine learning, evaluation, applications)",
      "Gives each layer a clear purpose in the student's own words",
      "Explains the dependency: problems flow down, value flows up",
    ],
    minLength: 100,
    maxLength: 1200,
  },
  requiredSectionIds: ["m1-l2-cp1", "m1-l2-cp2", "m1-l2-cp3", "m1-l2-activity", "m1-l2-quiz", "m1-l2-freeresponse"],
};

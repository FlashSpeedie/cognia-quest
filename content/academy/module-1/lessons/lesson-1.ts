import type { AcademyLesson } from "../../types";

export const lesson1: AcademyLesson = {
  meta: {
    id: "m1-l1",
    slug: "welcome-to-machine-learning",
    order: 1,
    title: "Welcome to Machine Learning",
    minutes: 20,
    segment: { chapter: 1, chapterTitle: "Introduction", start: 0, end: 1043 },
    summary:
      "What machine learning actually is, how it differs from classic rule-based AI, and where it quietly shows up in everyday products.",
    goals: [
      "Explain what machine learning is in simple language",
      "Distinguish AI from machine learning at a foundational level",
      "Recognize common real-world ML applications across industries",
    ],
  },
  moduleId: "module-1",
  quizId: "quiz-m1-l1",
  intro: [
    {
      kind: "text",
      heading: "Two ways to teach a computer",
      paragraphs: [
        "For most of computing history, if you wanted a machine to do something, a person had to write the rules. Want a program to spot fraudulent card payments? Write rules: flag purchases over $500, flag purchases in two countries within an hour, flag new merchants. The trouble is that the real world keeps inventing new situations your rulebook never imagined.",
        "Machine learning flips that arrangement around. Instead of writing rules by hand, you show the machine many examples - thousands of payments, each already labeled \"fraud\" or \"not fraud\" - and let it discover the patterns itself. The pattern it settles on is called a model. The model can then make a judgment call on a payment it has never seen before.",
      ],
    },
  ],
  blocks: [
    {
      kind: "definition",
      term: "Machine learning",
      body: "A way of building software that gets better at a task by finding patterns in examples (data), rather than by following only instructions a programmer wrote by hand.",
    },
    {
      kind: "text",
      heading: "Rules in, or examples in?",
      paragraphs: [
        "Here is the cleanest way to see the difference. Traditional programming: rules plus data go in, answers come out. Machine learning: data plus answers go in, and the system produces the rules - the model - as its output. That model is what you actually deploy.",
        "Think about how you learned to recognize dogs as a toddler. Nobody handed you a definition (\"four legs, fur, barks, roughly knee-high\"). You saw dogs - lots of them - and your brain built the concept on its own. Machine learning works the same way: examples in, understanding out.",
      ],
    },
    {
      kind: "callout",
      variant: "think",
      title: "Think about it",
      body: "Your phone's keyboard suggests the next word as you type. A rules-based version would need a dictionary of every phrase people commonly write. A learned version was shown millions of real sentences and now predicts what usually comes next. Which approach do you think handles slang and new phrases better - and why?",
    },
    {
      kind: "text",
      heading: "AI vs. machine learning",
      paragraphs: [
        "People use \"AI\" and \"machine learning\" almost interchangeably, but they are not the same thing. Artificial intelligence is the broad goal: making machines do things that would require intelligence if a human did them. Machine learning is one powerful way of getting there: learning behavior from data instead of hand-coding it.",
        "The distinction is real, not just academic. A chess engine that dominates grandmasters using hand-crafted evaluation rules written by experts is AI, but not machine learning. A spam filter that learned from millions of labeled emails is both. All machine learning is AI - but not all AI uses machine learning.",
      ],
    },
    {
      kind: "diagram",
      id: "ml-in-products",
      caption:
        "Machine learning in the wild - the same core idea (learn from examples) powers wildly different products.",
    },
    {
      kind: "text",
      heading: "Machine learning is already everywhere",
      paragraphs: [
        "You interact with learned models dozens of times a day, usually without noticing. The examples span nearly every industry:",
        "In healthcare, models help flag unusual patterns in medical images and estimate patient risk so clinicians can prioritize. In finance, card networks watch transactions for spending patterns that look nothing like yours. Retailers forecast demand for thousands of products. Recommendation systems learn your taste in music, videos and shopping to surface things you are likely to enjoy. Marketers predict which customers will respond to an offer. Self-driving systems use learned models to recognize pedestrians, lane markings and obstacles. Language systems translate text, transcribe speech and power chat assistants. In agriculture, models estimate crop health and yields from sensor and image data. Even entertainment uses models to decide what to green-light and what to show you next.",
      ],
    },
    {
      kind: "example",
      title: "Example - the fraud alert",
      body: [
        "At 2:14 AM, your card is charged for electronics in a city you have never visited. Within seconds your bank's app asks: \"Was this you?\"",
        "Nobody wrote a rule for that exact situation. A model compared this transaction against thousands of examples of how you normally spend - and how fraud typically looks - and produced a risk score. That judgment call, made in a fraction of a second on a case never seen before, is machine learning doing its job.",
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "About the source video",
      body: "The original course this lesson draws from also discusses job-market and industry outlook commentary from the year it was recorded. Those statements belong to that moment in time - this lesson sticks to the concepts, which haven't aged a day.",
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l1-cp1",
        type: "choice",
        concept: "What machine learning is",
        prompt: "Which sentence best describes how a machine learning system gets its behavior?",
        options: [
          "A programmer writes step-by-step rules that cover every situation",
          "The system discovers patterns from examples it is shown",
          "It stores every possible answer in a giant lookup table",
          "It asks users to explain what to do each time it runs",
        ],
        correct: 1,
        explanation:
          "Machine learning is defined by learning from examples. Rules written by hand are the traditional programming alternative, and lookup tables can't handle cases never seen before - while a learned model generalizes from its examples.",
      },
    },
    {
      kind: "text",
      heading: "Why this matters for you",
      paragraphs: [
        "Understanding machine learning is quickly becoming basic literacy. Not because everyone will build models - most people won't - but because learned systems increasingly make decisions that affect you: what news you see, whether your loan is approved, whether a medical scan gets a second look.",
        "To question those systems intelligently - to ask whether they are fair, accurate, or appropriate - you first need a mental model of what they are and how they work. That is exactly what this module builds. By the end of these eight lessons you'll be able to explain how machines learn, what can go wrong, and how experts tell a good model from a convincing-looking disaster.",
      ],
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l1-cp2",
        type: "choice",
        concept: "AI vs machine learning",
        prompt: "\"Every artificial intelligence system uses machine learning.\" Is this true or false?",
        options: [
          "True - machine learning is just another name for AI",
          "False - AI is the broader goal; ML is one way to achieve it",
          "True - modern AI is impossible without machine learning",
          "False - machine learning is broader than AI",
        ],
        correct: 1,
        explanation:
          "AI is the umbrella goal; machine learning is one approach under it. Hand-crafted rule-based systems (like classic chess engines) count as AI without using machine learning at all. Note that the reverse does hold: all machine learning is AI.",
      },
    },
    {
      kind: "checkpoint",
      checkpoint: {
        id: "m1-l1-cp3",
        type: "choice",
        concept: "Real-world ML applications",
        scenario:
          "A streaming service analyzes what you watch, how long you watch it, and what you skip - then fills a \"Because you watched...\" row with titles you haven't seen yet.",
        prompt: "Which application of machine learning is this?",
        options: [
          "Recommendation system",
          "Fraud detection",
          "Autonomous driving",
          "Medical diagnosis",
        ],
        correct: 0,
        explanation:
          "This is a recommendation system: a model learned from examples of viewing behavior to predict what a person will enjoy next. The same pattern (learn preferences from examples, predict what fits) powers music, shopping and social feeds.",
      },
    },
  ],
  activity: {
    kind: "applications-spotter",
    heading: "Activity - Spot the machine learning",
    intro:
      "Six real products, one question each: which flavor of ML application is at work? Pick a category for each card, then submit.",
  },
  freeResponse: {
    id: "fr-m1-l1",
    prompt:
      "In your own words: what does it mean for a machine to \"learn\"? Then name one app you use that probably relies on machine learning, and describe the examples you think it learned from.",
    guidance: "Aim for 2-4 sentences. Mention the idea of learning from examples, and be specific about your app.",
    expectedConcepts: [
      "pattern",
      "example",
      "data",
      "predict",
      "label",
      "recommend",
    ],
    rubric: [
      "Explains learning as finding patterns in examples (data) rather than following hand-written rules",
      "Names a plausible real application and the kind of examples it learns from",
      "Uses simple, concrete language a classmate could follow",
    ],
    minLength: 80,
    maxLength: 1200,
  },
  requiredSectionIds: ["m1-l1-cp1", "m1-l1-cp2", "m1-l1-cp3", "m1-l1-activity", "m1-l1-quiz", "m1-l1-freeresponse"],
};

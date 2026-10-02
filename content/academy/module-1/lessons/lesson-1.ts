import type { AcademyLesson } from "../../types";
import { LESSON_SEGMENTS } from "../module";

export const lesson1: AcademyLesson = {
  meta: {
    id: "m1-l1",
    slug: "welcome-to-machine-learning",
    order: 1,
    title: "Welcome to Machine Learning",
    minutes: 20,
    summary:
      "What machine learning actually is, how it differs from classic rule-based AI, and where it quietly shows up in everyday products.",
    goals: [
      "Explain what machine learning is in simple language",
      "Distinguish AI from machine learning at a foundational level",
      "Recognize common real-world ML applications across industries",
    ],
  },
  moduleId: "module-1",
  video: { segments: LESSON_SEGMENTS["m1-l1"]! },
  sheet: {
    coreIdea: [
      "For most of computing history, if you wanted a machine to do something, a person had to write the rules. Machine learning flips that arrangement: instead of writing rules by hand, you show the machine many examples and let it discover the patterns itself. The pattern it settles on is called a model, and that model can make judgment calls on cases it has never seen before.",
      "It's the difference between handing a student a rulebook and handing them a pile of solved problems. The rulebook is traditional programming. The solved problems - and the student who works out the pattern from them - are machine learning.",
    ],
    vocabulary: [
      {
        term: "Machine learning",
        body: "A way of building software that gets better at a task by finding patterns in examples (data), rather than by following only instructions a programmer wrote by hand.",
      },
      {
        term: "Model",
        body: "The learned pattern a machine learning system produces from its examples. The model is what actually makes predictions for new cases.",
      },
      {
        term: "Artificial intelligence (AI)",
        body: "The broad goal: machines doing things that would require intelligence if a human did them. Machine learning is one way of reaching that goal.",
      },
      {
        term: "Rule-based system",
        body: "Software whose behavior comes entirely from instructions experts wrote by hand - AI without learning.",
      },
    ],
    concepts: [
      {
        title: "Rules in, or examples in?",
        body: [
          "Traditional programming: rules plus data go in, answers come out. Machine learning: data plus answers go in, and the system produces the rules - the model - as its output.",
          "Think about how you learned to recognize dogs as a toddler. Nobody handed you a definition (\"four legs, fur, barks, roughly knee-high\"). You saw dogs - lots of them - and your brain built the concept on its own. Machine learning works the same way: examples in, understanding out.",
        ],
      },
      {
        title: "AI vs. machine learning",
        body: [
          "Artificial intelligence is the broad goal: making machines do things that would require intelligence if a human did them. Machine learning is one powerful way of getting there - learning behavior from data instead of hand-coding it.",
          "The distinction is real, not just academic. A chess engine that dominates grandmasters using hand-crafted evaluation rules written by experts is AI, but not machine learning. A spam filter that learned from millions of labeled emails is both. All machine learning is AI - but not all AI uses machine learning.",
        ],
      },
      {
        title: "Machine learning is already everywhere",
        body: [
          "You interact with learned models dozens of times a day, usually without noticing - and the same core idea (learn from examples) powers wildly different products across nearly every industry.",
        ],
        diagramId: "ml-in-products",
      },
    ],
    example: {
      title: "The fraud alert",
      body: [
        "At 2:14 AM, your card is charged for electronics in a city you have never visited. Within seconds your bank's app asks: \"Was this you?\"",
        "Nobody wrote a rule for that exact situation. A model compared this transaction against thousands of examples of how you normally spend - and how fraud typically looks - and produced a risk score. That judgment call, made in a fraction of a second on a case never seen before, is machine learning doing its job.",
      ],
    },
    commonConfusion: {
      title: "\u201cIf it's smart, it must be machine learning\u201d",
      body: "Not necessarily. Intelligence in software can come from carefully hand-written rules (classic chess engines, early expert systems) or from learned patterns. Machine learning is specifically the \u201clearned from examples\u201d route. When you hear about a system being AI, the useful follow-up question is: did humans write its behavior as rules, or did it learn the behavior from data?",
    },
    thinkAboutIt:
      "Your phone's keyboard suggests the next word as you type. A rules-based version would need a dictionary of every phrase people commonly write. A learned version was shown millions of real sentences and now predicts what usually comes next. Which approach handles slang and new phrases better - and why?",
    keyTakeaways: [
      "Machine learning means learning behavior from examples (data) instead of hand-writing every rule.",
      "The learned pattern is called a model; the model is what handles new, never-seen cases.",
      "AI is the broad goal; machine learning is one approach to it. Rule-based systems are AI without ML.",
      "The same core idea powers fraud alerts, recommendations, forecasts, language tools and more across industries.",
      "Questioning learned systems intelligently starts with this mental model - which is exactly what Module 1 builds.",
    ],
    sourceConnection:
      "This lesson plays the conceptual portion of the source video's opening (09:09\u201317:23), where LunarTech explains what machine learning is and tours applications across healthcare, finance, retail, recommendations, autonomous vehicles, language, agriculture and entertainment. The source's career and market commentary from its recording year is intentionally not part of the lesson.",
  },
  checkpoints: [
    {
      id: "m1-l1-cp1",
      segmentId: "m1-l1-s1",
      timestampSeconds: 170,
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
    {
      id: "m1-l1-cp2",
      segmentId: "m1-l1-s1",
      timestampSeconds: 310,
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
    {
      id: "m1-l1-cp3",
      segmentId: "m1-l1-s1",
      timestampSeconds: 430,
      type: "choice",
      concept: "Real-world ML applications",
      scenario:
        "A streaming service analyzes what you watch, how long you watch it, and what you skip - then fills a \"Because you watched...\" row with titles you haven't seen yet.",
      prompt: "Which application of machine learning is this?",
      options: ["Recommendation system", "Fraud detection", "Autonomous driving", "Medical diagnosis"],
      correct: 0,
      explanation:
        "This is a recommendation system: a model learned from examples of viewing behavior to predict what a person will enjoy next. The same pattern (learn preferences from examples, predict what fits) powers music, shopping and social feeds.",
    },
  ],
  activity: {
    kind: "applications-spotter",
    heading: "Optional exercise - Spot the machine learning",
    intro:
      "Six real products, one question each: which flavor of ML application is at work? Pick a category for each card, then submit.",
  },
  quizId: "quiz-m1-l1",
  freeResponses: [
    {
      id: "fr-m1-l1-1",
      prompt:
        "In your own words: what does it mean for a machine to \"learn\"? Then name one app you use that probably relies on machine learning, and describe the examples you think it learned from.",
      guidance: "Aim for 2-4 sentences. Mention the idea of learning from examples, and be specific about your app.",
      expectedConcepts: ["pattern", "example", "data", "predict", "label", "recommend"],
      rubric: [
        "Explains learning as finding patterns in examples (data) rather than following hand-written rules",
        "Names a plausible real application and the kind of examples it learns from",
        "Uses simple, concrete language a classmate could follow",
      ],
      minLength: 80,
      maxLength: 1200,
    },
    {
      id: "fr-m1-l1-2",
      prompt:
        "Using the \"rules vs. examples\" framing, explain the difference between traditional programming and machine learning. For each one, say what goes in and what comes out.",
      guidance: "Aim for 2-3 sentences. The words \"rules\", \"examples\" and \"model\" will help.",
      expectedConcepts: ["rule", "example", "data", "answer", "model", "pattern"],
      rubric: [
        "States that traditional programming takes rules + data in and produces answers",
        "States that machine learning takes data + answers (examples) in and produces the rules/model",
        "Keeps the two directions clearly separated",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l1-3",
      prompt:
        "A classmate says: \"That chess engine beat grandmasters, so it must use machine learning - it's clearly intelligent.\" Gently correct them.",
      guidance: "Aim for 2-3 sentences. The key distinction is AI vs. machine learning.",
      expectedConcepts: ["ai", "artificial intelligence", "rule", "hand", "learn", "approach"],
      rubric: [
        "Identifies the confusion: impressive AI does not have to involve learning",
        "Explains that the engine's behavior can come from expert-written rules",
        "Notes that machine learning is one approach within AI",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l1-4",
      prompt:
        "Pick two different industries mentioned in this lesson (healthcare, finance, retail, recommendations, marketing, autonomous driving, language, agriculture, entertainment). Describe one concrete machine learning use in each.",
      guidance: "Aim for 3-4 sentences. Be concrete: what examples would each system learn from?",
      expectedConcepts: ["example", "data", "predict", "detect", "recommend", "learn"],
      rubric: [
        "Describes a concrete, plausible ML use for the first industry",
        "Describes a concrete, plausible ML use for the second industry",
        "Connects each use to the idea of learning from examples",
      ],
      minLength: 100,
      maxLength: 1200,
    },
  ],
  requiredSectionIds: [
    "m1-l1-cp1",
    "m1-l1-cp2",
    "m1-l1-cp3",
    "m1-l1-sheet",
    "m1-l1-refs",
    "m1-l1-quiz",
    "fr-m1-l1-1",
    "fr-m1-l1-2",
    "fr-m1-l1-3",
    "fr-m1-l1-4",
  ],
  optionalSectionIds: ["m1-l1-activity"],
};

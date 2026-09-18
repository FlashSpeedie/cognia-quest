import type { ModuleDef } from "@/lib/content";

/**
 * Learning path content. Sections reference interactive widgets by name;
 * the lesson renderer maps widget names to React components.
 * Keep prose short: concept → example → interact → check.
 */
export const MODULES: ModuleDef[] = [
  {
    id: "fundamentals",
    slug: "ai-fundamentals",
    order: 1,
    title: "AI Fundamentals",
    tagline: "What AI actually is — and what it isn't.",
    description:
      "Separate the hype from reality. Learn the difference between AI, machine learning, and everyday programs, and why AI sometimes gets things wrong.",
    icon: "brain",
    color: "pulse",
    lessons: [
      {
        id: "fund-what-is-ai",
        slug: "what-is-ai",
        title: "What Is AI?",
        minutes: 6,
        xp: 50,
        outcomes: [
          "Define artificial intelligence in plain language",
          "Tell narrow AI apart from general AI",
          "Explain why AI can look smart without understanding",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "A working definition",
            body: [
              "Artificial intelligence is software that performs tasks we usually associate with human thinking — recognizing faces, understanding speech, translating languages, recommending videos.",
              "Almost all AI today is narrow AI: it is good at one specific job. A chess engine can't drive a car. A chatbot can't recognize your dog. There is no science-fiction 'general' AI doing everything.",
            ],
          },
          {
            id: "not-magic",
            kind: "callout",
            variant: "info",
            title: "AI is not magic — or a mind",
            body: "AI systems find patterns in data. They don't have beliefs, feelings, or an understanding of truth. That matters: a system that sounds confident can still be completely wrong.",
          },
          {
            id: "try-ai-or-not",
            kind: "interactive",
            widget: "ai-or-not",
            heading: "Try it: AI or Not?",
            body: "Sort these systems. Is each one using AI, or just following fixed rules?",
          },
          {
            id: "check",
            kind: "quiz",
            quizId: "quiz-fund-1",
          },
        ],
      },
      {
        id: "fund-ml-vs-rules",
        slug: "learning-vs-rules",
        title: "Learning vs. Rules",
        minutes: 7,
        xp: 50,
        outcomes: [
          "Contrast rule-based programs with machine learning",
          "Explain training and inference in one sentence each",
          "Describe what a 'model' is",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Two ways to build software",
            body: [
              "Classic programs: a human writes explicit rules. 'IF an email contains the word FREE in all caps, flag it as spam.'",
              "Machine learning: instead of writing the rules, you show the computer thousands of examples — spam and not-spam — and it infers the pattern itself. The learned pattern is called a model.",
              "Training is the learning phase: adjusting the model on examples. Inference is using the trained model on new, unseen inputs.",
            ],
          },
          {
            id: "try-model",
            kind: "interactive",
            widget: "what-is-model",
            heading: "See it: examples become a model",
            body: "Change the examples. Watch the model — and its predictions — change.",
          },
          {
            id: "check",
            kind: "quiz",
            quizId: "quiz-fund-2",
          },
        ],
      },
      {
        id: "fund-types",
        slug: "types-of-ai",
        title: "A Tour of AI Types",
        minutes: 8,
        xp: 50,
        outcomes: [
          "Recognize computer vision, NLP, recommender systems, and generative AI",
          "Give a real example of each",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Same word, different jobs",
            body: [
              "Computer vision interprets images: face unlock, tumor screening, self-driving perception.",
              "Natural language processing (NLP) works with text and speech: translation, voice assistants, chatbots.",
              "Recommender systems predict what you'll click next: video feeds, music playlists, shopping suggestions.",
              "Generative AI creates new content — text, images, audio, code — based on patterns learned from training data.",
            ],
          },
          {
            id: "try-match",
            kind: "interactive",
            widget: "ai-types-match",
            heading: "Try it: match the technology",
          },
          {
            id: "check",
            kind: "quiz",
            quizId: "quiz-fund-3",
          },
        ],
      },
      {
        id: "fund-wrong",
        slug: "why-ai-gets-it-wrong",
        title: "Why AI Gets Things Wrong",
        minutes: 7,
        xp: 50,
        outcomes: [
          "List four common reasons AI outputs are wrong",
          "Explain 'garbage in, garbage out'",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Wrong is a feature of the design space, not a bug list",
            body: [
              "AI can be wrong because the training data was incomplete, biased, or outdated. Because the task was ambiguous. Because the model finds plausible-sounding patterns, not verified facts. Or because the world simply changed.",
              "A calculator follows exact rules, so it's always right about arithmetic. AI models trade certainty for flexibility — they can handle messy inputs, but their outputs always carry some uncertainty.",
            ],
          },
          {
            id: "tip",
            kind: "callout",
            variant: "warning",
            title: "The core habit of AI literacy",
            body: "Treat AI output like a claim from a smart but unreliable friend: often helpful, always worth checking when it matters.",
          },
          {
            id: "check",
            kind: "quiz",
            quizId: "quiz-fund-4",
          },
        ],
      },
    ],
  },
  {
    id: "ml",
    slug: "machine-learning",
    order: 2,
    title: "Machine Learning",
    tagline: "How machines learn from data.",
    description:
      "Datasets, features, labels, training, overfitting, and evaluation — the core vocabulary of machine learning, with an interactive pipeline.",
    icon: "cpu",
    color: "volt",
    lessons: [
      {
        id: "ml-data",
        slug: "data-features-labels",
        title: "Data, Features, and Labels",
        minutes: 8,
        xp: 50,
        outcomes: [
          "Define dataset, feature, and label",
          "Choose sensible features for a prediction task",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "The raw ingredients",
            body: [
              "A dataset is a collection of examples. Each example has features — the inputs you measure — and often a label: the answer you want to predict.",
              "Predicting whether a student passes a class? Features might be study hours and sleep. The label is pass/fail. Choosing what to measure — and what to leave out — is a human decision with real consequences.",
            ],
          },
          {
            id: "try-features",
            kind: "interactive",
            widget: "feature-picker",
            heading: "Try it: pick the features",
            body: "Which columns would help predict the outcome? Which should be left out?",
          },
          { id: "check", kind: "quiz", quizId: "quiz-ml-1" },
        ],
      },
      {
        id: "ml-pipeline",
        slug: "the-ml-pipeline",
        title: "The Machine Learning Pipeline",
        minutes: 8,
        xp: 50,
        outcomes: [
          "Order the stages of a machine learning project",
          "Explain why data is split into training and test sets",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "From raw data to predictions",
            body: [
              "Real ML projects follow a pipeline: collect data → clean it → train → validate → test → predict. Each stage can introduce or fix problems.",
              "You never judge a model on the data it trained on — that's like grading a student with the answer key open. A held-out test set measures how the model handles genuinely new cases.",
            ],
          },
          {
            id: "try-pipeline",
            kind: "interactive",
            widget: "ml-pipeline",
            heading: "Explore the pipeline",
            body: "Click each stage to see what happens inside it.",
          },
          { id: "check", kind: "quiz", quizId: "quiz-ml-2" },
        ],
      },
      {
        id: "ml-overfitting",
        slug: "overfitting",
        title: "Overfitting: When Memorizing Backfires",
        minutes: 8,
        xp: 60,
        outcomes: [
          "Explain overfitting in plain language",
          "Describe the trade-off between simple and complex models",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Memorizing ≠ understanding",
            body: [
              "A model that simply memorizes its training examples can score 100% in training and still fail in the real world. That's overfitting: the model learned the noise, not the signal.",
              "There's a sweet spot: too simple misses the pattern; too complex memorizes it. Generalization — doing well on new data — is the actual goal.",
            ],
          },
          {
            id: "try-overfit",
            kind: "interactive",
            widget: "overfitting-lab",
            heading: "Try it: crank up the complexity",
            body: "Watch training accuracy climb while test accuracy falls apart.",
          },
          { id: "check", kind: "quiz", quizId: "quiz-ml-3" },
        ],
      },
      {
        id: "ml-eval",
        slug: "measuring-models",
        title: "Measuring Models",
        minutes: 9,
        xp: 60,
        outcomes: [
          "Read a confusion matrix",
          "Explain false positives and false negatives with examples",
          "Say why accuracy alone can mislead",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Accuracy isn't the whole story",
            body: [
              "If 95% of emails are not spam, a 'model' that labels everything not-spam is 95% accurate — and completely useless.",
              "A confusion matrix breaks predictions into four boxes: true positives, false positives, true negatives, false negatives. Two companion ideas: precision (of the things I flagged, how many were real?) and recall (of all the real cases, how many did I find?).",
            ],
          },
          {
            id: "try-confusion",
            kind: "interactive",
            widget: "confusion-matrix",
            heading: "Try it: explore the confusion matrix",
          },
          { id: "check", kind: "quiz", quizId: "quiz-ml-4" },
        ],
      },
    ],
  },
  {
    id: "genai",
    slug: "generative-ai",
    order: 3,
    title: "Generative AI",
    tagline: "How AI writes, draws, and hallucinates.",
    description:
      "Tokens, language models, image generation, context windows, and why a confident answer can still be wrong.",
    icon: "spark",
    color: "mint",
    lessons: [
      {
        id: "gen-what",
        slug: "what-is-generative-ai",
        title: "What Generative AI Does",
        minutes: 7,
        xp: 50,
        outcomes: [
          "Define generative AI",
          "Name text, image, audio, code, and multimodal generation",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "From recognizing to creating",
            body: [
              "Most classic AI classifies: spam or not, cat or dog. Generative AI produces: paragraphs, pictures, melodies, code.",
              "A large language model (LLM) is trained to predict the next token — roughly, the next chunk of text — given everything so far. Stack that simple move billions of times and you get essays, summaries, and conversations.",
            ],
          },
          {
            id: "try-next",
            kind: "interactive",
            widget: "next-token",
            heading: "Try it: be the language model",
            body: "Pick the most likely next word. Feel how prediction — not understanding — drives the output.",
          },
          { id: "check", kind: "quiz", quizId: "quiz-gen-1" },
        ],
      },
      {
        id: "gen-tokens",
        slug: "tokens-and-context",
        title: "Tokens and Context Windows",
        minutes: 7,
        xp: 50,
        outcomes: [
          "Explain what a token is",
          "Explain what a context window limits",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Text in, chunks processed",
            body: [
              "Models don't read words — they read tokens: fragments like 'un', 'believ', 'able'. An English word is often 1–2 tokens.",
              "The context window is how much the model can 'see' at once: your prompt plus the conversation. Fall outside the window and earlier details are literally invisible to the model.",
            ],
          },
          {
            id: "try-tokens",
            kind: "interactive",
            widget: "token-visualizer",
            heading: "See it: text becomes tokens",
          },
          { id: "check", kind: "quiz", quizId: "quiz-gen-2" },
        ],
      },
      {
        id: "gen-hallucination",
        slug: "hallucinations-and-confidence",
        title: "Hallucinations and Confidence",
        minutes: 8,
        xp: 60,
        outcomes: [
          "Define hallucination in generative AI",
          "Explain why confidence ≠ correctness",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Fluent is not the same as true",
            body: [
              "A hallucination is output that sounds plausible but is factually wrong or invented — fake citations, wrong dates, imagined features.",
              "Language models generate what sounds right, not what is verified. Polished grammar carries zero guarantee. The fix is a habit, not a setting: check important claims against reliable sources.",
            ],
          },
          {
            id: "try-confidence",
            kind: "interactive",
            widget: "confidence-lab",
            heading: "See it: confidence vs. correctness",
            body: "Watch an answer generate — with style that says 'certain' even when the facts say otherwise.",
          },
          {
            id: "try-claims",
            kind: "interactive",
            widget: "hallucination-claims",
            heading: "Try it: verify the claims",
          },
          { id: "check", kind: "quiz", quizId: "quiz-gen-3" },
        ],
      },
    ],
  },
  {
    id: "prompting",
    slug: "prompt-engineering",
    order: 4,
    title: "Prompt Engineering",
    tagline: "Ask better. Get better.",
    description:
      "The skill of giving AI clear task definitions: context, audience, format, constraints, and verification.",
    icon: "chat",
    color: "amber",
    lessons: [
      {
        id: "prompt-anatomy",
        slug: "anatomy-of-a-prompt",
        title: "Anatomy of a Good Prompt",
        minutes: 8,
        xp: 50,
        outcomes: [
          "Name the key parts of a strong prompt",
          "Rewrite a vague prompt into a specific one",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Vague in, vague out",
            body: [
              "'Explain photosynthesis' could produce a textbook chapter or a single sentence — the model guesses. Strong prompts remove the guessing: task, audience, format, length, constraints, and how to handle uncertainty.",
              "You're not tricking the model; you're specifying the job.",
            ],
          },
          {
            id: "try-upgrade",
            kind: "interactive",
            widget: "prompt-upgrade",
            heading: "Try it: upgrade the weak prompt",
            body: "Add the missing ingredients and watch the score respond.",
          },
          { id: "check", kind: "quiz", quizId: "quiz-prompt-1" },
        ],
      },
      {
        id: "prompt-iteration",
        slug: "iterate-and-verify",
        title: "Iterate and Verify",
        minutes: 8,
        xp: 60,
        outcomes: [
          "Use follow-up prompts to improve output",
          "Ask models to show reasoning or cite sources — and still verify",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Prompting is a loop, not a spell",
            body: [
              "First drafts from AI are starting points. Professionals iterate: 'shorter', 'add a counter-argument', 'make it readable for a 9th grader'.",
              "You can ask a model to list sources or show its reasoning — helpful, but not proof. Sources can be invented. Verification means checking the actual source yourself.",
            ],
          },
          { id: "check", kind: "quiz", quizId: "quiz-prompt-2" },
        ],
      },
    ],
  },
  {
    id: "detective",
    slug: "ai-detective",
    order: 5,
    title: "AI Detective",
    tagline: "Catch AI when it slips.",
    description:
      "Build the verification habit: spot hallucinations, bias, missing context, and overconfidence in AI output.",
    icon: "detective",
    color: "rose",
    lessons: [
      {
        id: "det-verification",
        slug: "the-verification-habit",
        title: "The Verification Habit",
        minutes: 8,
        xp: 60,
        outcomes: [
          "Break an AI answer into checkable claims",
          "Decide when a claim needs an outside source",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Every answer is a stack of claims",
            body: [
              "An AI paragraph might contain five factual claims. Some are common knowledge; others are specific: statistics, quotes, dates, citations. The specific ones are where hallucinations hide.",
              "Claim → check → decide. That's the loop. Detectives don't guess; they verify the risky claims and label the rest.",
            ],
          },
          {
            id: "try-claims2",
            kind: "interactive",
            widget: "hallucination-claims",
            heading: "Try it: sort the claims",
          },
          { id: "check", kind: "quiz", quizId: "quiz-det-1" },
        ],
      },
    ],
  },
  {
    id: "ethics",
    slug: "ai-ethics",
    order: 6,
    title: "AI Ethics & Responsible Use",
    tagline: "Powerful tools, real consequences.",
    description:
      "Fairness, privacy, transparency, accountability, and smart rules for using AI in school.",
    icon: "scale",
    color: "mint",
    lessons: [
      {
        id: "eth-dimensions",
        slug: "dimensions-of-responsible-ai",
        title: "Dimensions of Responsible AI",
        minutes: 8,
        xp: 60,
        outcomes: [
          "Define fairness, privacy, transparency, accountability",
          "Give a school-relevant example of each",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Four questions to ask about any AI system",
            body: [
              "Fairness: does it work equally well for everyone affected? Privacy: what data does it collect, and is that necessary? Transparency: do people know AI is being used, and can anyone explain its decisions? Accountability: when it's wrong, who is responsible?",
              "None of these have automatic answers. Responsible AI is mostly humans asking these questions before deployment — not after the news story.",
            ],
          },
          { id: "check", kind: "quiz", quizId: "quiz-eth-1" },
        ],
      },
      {
        id: "eth-school",
        slug: "ai-in-school",
        title: "AI and Academic Integrity",
        minutes: 8,
        xp: 60,
        outcomes: [
          "Distinguish learning-support uses from learning-replacement uses",
          "Apply the rule: check the policy, disclose use, verify output",
        ],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "A powerful tutor or an expensive shortcut?",
            body: [
              "AI can explain a concept five different ways, quiz you, and help plan your studying. It can also write the essay you were assigned to write. One use builds skill; the other borrows the appearance of skill.",
              "Rules differ by class and teacher. The safe defaults: check the assignment's policy, disclose AI use when asked, never submit fabricated sources, and make sure you can explain — in your own words — anything you submit.",
            ],
          },
          {
            id: "try-can-i",
            kind: "interactive",
            widget: "can-i-use-ai",
            heading: "Try it: Can I use AI for this?",
          },
          { id: "check", kind: "quiz", quizId: "quiz-eth-2" },
        ],
      },
    ],
  },
  {
    id: "final",
    slug: "final-mission",
    order: 7,
    title: "Final AI Mission",
    tagline: "Everything, combined.",
    description:
      "The capstone: evaluate a real proposal for a school AI system — data choices, model behavior, bias, prompting, and a deployment call.",
    icon: "trophy",
    color: "volt",
    lessons: [
      {
        id: "final-briefing",
        slug: "mission-briefing",
        title: "Mission Briefing",
        minutes: 5,
        xp: 50,
        outcomes: ["Understand the capstone scenario", "Review the skills it tests"],
        sections: [
          {
            id: "concept",
            kind: "concept",
            heading: "Scenario: the support-prediction system",
            body: [
              "A fictional school wants an AI system to flag students who might need academic support. You'll choose the data, examine the model's behavior, question its fairness, draft the prompt it uses for explanations, and make a recommendation.",
              "There is no single 'right' answer — there are well-reasoned and poorly-reasoned ones.",
            ],
          },
          {
            id: "tip",
            kind: "callout",
            variant: "tip",
            title: "Ready when you are",
            body: "Head to the Final Challenge from the Missions page or your dashboard when you've finished the earlier modules.",
          },
        ],
      },
    ],
  },
];

export function allLessons() {
  return MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleSlug: m.slug, moduleTitle: m.title })));
}

export function moduleBySlug(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}

export function lessonById(id: string) {
  return allLessons().find((l) => l.id === id);
}

export function lessonBySlug(moduleSlug: string, lessonSlug: string) {
  const m = moduleBySlug(moduleSlug);
  return m?.lessons.find((l) => l.slug === lessonSlug);
}

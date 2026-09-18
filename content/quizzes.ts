import type { Quiz } from "@/lib/content";

/** Quiz bank — 12 quizzes / 34 questions (spec §56: 20+). */
export const QUIZZES: Quiz[] = [
  {
    id: "quiz-fund-1",
    title: "What Is AI? — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "Which description best fits today's AI?",
        choices: [
          "Software that does specific thinking-like tasks, like recognizing images or translating text",
          "A machine mind that understands the world like a human",
          "A robot body with human senses",
          "Any program that runs on a computer",
        ],
        correct: [0],
        explanation: "Modern AI is narrow: powerful at specific tasks, without human-style general understanding.",
      },
      {
        id: "q2", kind: "tf",
        prompt: "A chess engine that plays at grandmaster level can also drive a car.",
        choices: ["True", "False"],
        correct: [1],
        explanation: "Narrow AI transfers poorly: the chess system only knows chess.",
      },
      {
        id: "q3", kind: "mcq",
        prompt: "Why can an AI system sound confident but still be wrong?",
        choices: [
          "It generates plausible patterns, not verified facts",
          "It is lying on purpose",
          "It only works offline",
          "Confidence and correctness are the same thing",
        ],
        correct: [0],
        explanation: "AI produces patterns that fit; it doesn't check them against reality unless explicitly designed to.",
      },
    ],
  },
  {
    id: "quiz-fund-2",
    title: "Learning vs. Rules — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "What is a 'model' in machine learning?",
        choices: [
          "The pattern learned from training examples, used to make predictions",
          "The computer's processor",
          "A diagram of the database",
          "The programmer's design sketch",
        ],
        correct: [0],
        explanation: "Training data goes in; a model (the learned pattern) comes out; the model makes predictions.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "'Inference' means:",
        choices: [
          "Using a trained model on new inputs",
          "Deleting bad data",
          "Writing if/else rules by hand",
          "Collecting more examples",
        ],
        correct: [0],
        explanation: "Training = learning from examples. Inference = applying the trained model to new cases.",
      },
      {
        id: "q3", kind: "tf",
        prompt: "In machine learning, a human writes explicit if/else rules for every situation.",
        choices: ["True", "False"],
        correct: [1],
        explanation: "That's traditional programming. ML infers the pattern from examples instead.",
      },
    ],
  },
  {
    id: "quiz-fund-3",
    title: "Types of AI — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "A phone unlock that recognizes your face is an example of:",
        choices: ["Computer vision", "A recommender system", "Text generation", "A spreadsheet"],
        correct: [0],
        explanation: "Interpreting images is computer vision.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "A video app suggesting what to watch next is:",
        choices: [
          "A recommender system",
          "Computer vision",
          "A calculator",
          "An operating system",
        ],
        correct: [0],
        explanation: "Recommenders predict what you'll engage with from your and others' history.",
      },
      {
        id: "q3", kind: "multi",
        prompt: "Which of these are generative AI? (Choose all that apply)",
        choices: [
          "A chatbot writing a poem",
          "Spam filtering",
          "An image generator drawing a dragon",
          "A code assistant completing your function",
        ],
        correct: [0, 2, 3],
        explanation: "Spam filtering classifies; the other three create new content.",
      },
    ],
  },
  {
    id: "quiz-fund-4",
    title: "Why AI Gets It Wrong — Check yourself",
    questions: [
      {
        id: "q1", kind: "multi",
        prompt: "Which can cause AI errors? (Choose all that apply)",
        choices: [
          "Incomplete or biased training data",
          "The world changed since training",
          "Ambiguous tasks",
          "Models intentionally seeking revenge",
        ],
        correct: [0, 1, 2],
        explanation: "Bad data, drift, and ambiguity cause errors. Models don't have intentions.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "'Garbage in, garbage out' means:",
        choices: [
          "Model quality is limited by data quality",
          "Computers need cleaning",
          "AI always produces garbage",
          "More data always fixes everything",
        ],
        correct: [0],
        explanation: "Flawed training data leads to flawed models, no matter how fancy the algorithm.",
      },
    ],
  },
  {
    id: "quiz-ml-1",
    title: "Data, Features, Labels — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "In a dataset predicting pass/fail from study hours, the LABEL is:",
        choices: ["Pass/fail", "Study hours", "The student's name", "The spreadsheet"],
        correct: [0],
        explanation: "The label is the outcome you want to predict; features are the inputs.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "Which would most likely be a POOR feature choice?",
        choices: [
          "A unique student ID number",
          "Homework completion rate",
          "Quiz averages",
          "Attendance rate",
        ],
        correct: [0],
        explanation: "An ID is just a label for a person — it carries no generalizable pattern (and raises privacy issues).",
      },
      {
        id: "q3", kind: "tf",
        prompt: "Choosing which features to include is a human decision that can affect fairness.",
        choices: ["True", "False"],
        correct: [0],
        explanation: "Feature selection encodes judgment — and can bake in proxies for sensitive attributes.",
      },
    ],
  },
  {
    id: "quiz-ml-2",
    title: "The ML Pipeline — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "Why split data into training and test sets?",
        choices: [
          "To measure performance on data the model didn't memorize",
          "To make training faster",
          "To use less disk space",
          "It's tradition",
        ],
        correct: [0],
        explanation: "Held-out test data estimates how the model handles genuinely new cases.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "Put the pipeline in order:",
        choices: [
          "Data → Clean → Train → Validate → Test → Predict",
          "Train → Data → Test → Clean → Predict",
          "Predict → Train → Data → Test",
          "Clean → Predict → Data → Train",
        ],
        correct: [0],
        explanation: "You need clean data before training, and honest evaluation before predicting.",
      },
    ],
  },
  {
    id: "quiz-ml-3",
    title: "Overfitting — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "A model scores 100% on training data but 62% on new data. This is:",
        choices: ["Overfitting", "Perfect learning", "Underfitting", "A hardware error"],
        correct: [0],
        explanation: "Memorizing training specifics that don't generalize is the definition of overfitting.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "The real goal of training is:",
        choices: [
          "Generalization to new, unseen data",
          "100% training accuracy",
          "The most complex model possible",
          "The fastest training time",
        ],
        correct: [0],
        explanation: "Performance on unseen data is what actually matters.",
      },
    ],
  },
  {
    id: "quiz-ml-4",
    title: "Measuring Models — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "A spam filter marks a real email as spam. That's a:",
        choices: ["False positive", "True positive", "True negative", "False negative"],
        correct: [0],
        explanation: "It predicted 'spam' (positive) but was wrong — a false positive.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "95% of emails are legitimate. A filter that labels EVERYTHING legitimate is 95% accurate. What's the lesson?",
        choices: [
          "Accuracy alone can be misleading on imbalanced data",
          "The filter is excellent",
          "Spam filters are impossible",
          "We need more spam",
        ],
        correct: [0],
        explanation: "High accuracy can hide the fact that the model never finds the rare, important cases.",
      },
    ],
  },
  {
    id: "quiz-gen-1",
    title: "Generative AI — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "A large language model fundamentally generates text by:",
        choices: [
          "Predicting likely next tokens, repeatedly",
          "Searching a database of true answers",
          "Thinking about the question like a human",
          "Copying Wikipedia",
        ],
        correct: [0],
        explanation: "LLMs are prediction engines over tokens — fluent output emerges from that loop.",
      },
      {
        id: "q2", kind: "multi",
        prompt: "Generative AI can produce: (choose all)",
        choices: ["Text", "Images", "Code", "Guaranteed truth"],
        correct: [0, 1, 2],
        explanation: "Generation ≠ verification — output needs checking.",
      },
    ],
  },
  {
    id: "quiz-gen-2",
    title: "Tokens & Context — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "A token is:",
        choices: [
          "A chunk of text the model processes, often part of a word",
          "A password",
          "A unit of computer memory",
          "An AI personality",
        ],
        correct: [0],
        explanation: "Models read and write tokens — fragments like 'un' + 'believ' + 'able'.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "If a detail falls outside the context window, the model:",
        choices: [
          "Cannot see it at all",
          "Remembers it vaguely",
          "Will ask about it",
          "Stores it for later",
        ],
        correct: [0],
        explanation: "The context window is the model's entire working memory for the conversation.",
      },
    ],
  },
  {
    id: "quiz-gen-3",
    title: "Hallucinations — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "A hallucination is:",
        choices: [
          "Confident output that is factually wrong or invented",
          "A computer virus",
          "A very long answer",
          "A correct but surprising fact",
        ],
        correct: [0],
        explanation: "Plausible-sounding but false — like a citation to a paper that doesn't exist.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "The safest response to an important AI claim is:",
        choices: [
          "Verify it against a reliable source",
          "Trust polished writing",
          "Assume it's wrong always",
          "Ask the AI if it's sure, and stop there",
        ],
        correct: [0],
        explanation: "Self-reported confidence isn't verification. Check real sources for anything that matters.",
      },
    ],
  },
  {
    id: "quiz-prompt-1",
    title: "Anatomy of a Prompt — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "Which is the STRONGEST prompt?",
        choices: [
          "Summarize this article for a 10-year-old in 5 bullet points, keeping the main statistic.",
          "Summarize this.",
          "Do something with this article.",
          "Article summary please.",
        ],
        correct: [0],
        explanation: "It specifies audience, format, length, and what to preserve.",
      },
      {
        id: "q2", kind: "multi",
        prompt: "Strong prompt ingredients include: (choose all)",
        choices: ["Audience", "Format/length", "Goal", "Random emojis"],
        correct: [0, 1, 2],
        explanation: "Specificity on audience, format, and goal removes guessing.",
      },
    ],
  },
  {
    id: "quiz-prompt-2",
    title: "Iterate and Verify — Check yourself",
    questions: [
      {
        id: "q1", kind: "tf",
        prompt: "If an AI lists sources, they always exist.",
        choices: ["True", "False"],
        correct: [1],
        explanation: "Models can invent realistic-looking citations. Always check that a source actually exists.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "The first AI draft of anything is best treated as:",
        choices: [
          "A starting point to refine",
          "A finished product",
          "Proof of the topic",
          "A final exam submission",
        ],
        correct: [0],
        explanation: "Iteration — shorter, simpler, restructured — is where prompting gets powerful.",
      },
    ],
  },
  {
    id: "quiz-det-1",
    title: "Verification Habit — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "Which claim most needs an outside source?",
        choices: [
          "'A 2023 study of 10,000 students found a 43% increase...'",
          "'Water is made of hydrogen and oxygen.'",
          "'Paris is the capital of France.'",
          "'Ice is cold.'",
        ],
        correct: [0],
        explanation: "Specific statistics and citations are exactly where hallucinations hide.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "The verification loop is:",
        choices: [
          "Identify claims → check risky ones with reliable sources → decide",
          "Read → believe → share",
          "Ask AI → ask AI again → done",
          "Guess → hope → submit",
        ],
        correct: [0],
        explanation: "Break into claims, verify the risky ones, then judge the whole answer.",
      },
    ],
  },
  {
    id: "quiz-eth-1",
    title: "Responsible AI — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "'Transparency' in AI means:",
        choices: [
          "People know AI is being used and decisions can be explained",
          "The code is always public",
          "The AI is invisible",
          "Data is shared with everyone",
        ],
        correct: [0],
        explanation: "Transparency = knowing when AI is involved and being able to ask how it decided.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "When an AI system harms someone, 'accountability' asks:",
        choices: [
          "Who is responsible, and how do they make it right?",
          "How do we delete the logs?",
          "How fast can we ship the next version?",
          "Why users are so sensitive?",
        ],
        correct: [0],
        explanation: "Accountability assigns human responsibility for AI outcomes.",
      },
    ],
  },
  {
    id: "quiz-eth-2",
    title: "AI in School — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "Your teacher banned AI on an essay. Using AI to write it anyway is:",
        choices: [
          "Academic dishonesty — and it skips your own learning",
          "A clever workaround",
          "Fine if you edit a few words",
          "OK if the AI is paid",
        ],
        correct: [0],
        explanation: "Rules differ by class; violating a stated policy while presenting work as your own is dishonest.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "The best general-purpose habits are:",
        choices: [
          "Check the policy, disclose AI use when required, verify output, and be able to explain your work",
          "Never tell anyone",
          "Use AI for everything secretly",
          "Avoid all tools forever",
        ],
        correct: [0],
        explanation: "Policy first, honesty about use, verification of content, and ownership of understanding.",
      },
    ],
  },
];

const EXTRA_QUIZZES: Quiz[] = [
  {
    id: "quiz-fund-5",
    title: "AI All Day — Check yourself",
    questions: [
      {
        id: "q1", kind: "multi",
        prompt: "Which of these everyday features likely use AI? (choose all)",
        choices: ["Face-unlock on your phone", "Autocorrect suggestions", "A kitchen timer", "Your music app's Discover playlist"],
        correct: [0, 1, 3],
        explanation: "Timers follow fixed rules; the others learn patterns from data.",
      },
      {
        id: "q2", kind: "tf",
        prompt: "Good AI features usually announce themselves loudly so you notice them.",
        choices: ["True", "False"],
        correct: [1],
        explanation: "Great AI tends to disappear into the feature — you notice it only when it misbehaves.",
      },
    ],
  },
  {
    id: "quiz-ml-5",
    title: "Classification vs Regression — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "'Will this customer churn?' is an example of:",
        choices: ["Classification (a category: yes/no)", "Regression (a number)", "Neither", "Both simultaneously"],
        correct: [0],
        explanation: "Churn yes/no = categories → classification.",
      },
      {
        id: "q2", kind: "mcq",
        prompt: "'How much will this house sell for?' is:",
        choices: ["Regression — the output is a number", "Classification", "Clustering", "A prompt"],
        correct: [0],
        explanation: "Numeric output (a price) → regression.",
      },
    ],
  },
  {
    id: "quiz-gen-4",
    title: "Multimodal AI — Check yourself",
    questions: [
      {
        id: "q1", kind: "mcq",
        prompt: "An AI-generated photo shows a hand with six fingers. This happens because:",
        choices: [
          "Image models produce statistically plausible pixels, not anatomically verified bodies",
          "The model is broken and needs repair",
          "Someone manually edited the photo",
          "Cameras distort fingers",
        ],
        correct: [0],
        explanation: "Generation optimizes plausibility. Nobody counts the fingers unless a checker does.",
      },
      {
        id: "q2", kind: "tf",
        prompt: "A convincing video clip of a public figure is strong evidence the event happened.",
        choices: ["True", "False"],
        correct: [1],
        explanation: "Deepfakes make video forgeable; source and corroboration matter more than realism.",
      },
    ],
  },
];

QUIZZES.push(...EXTRA_QUIZZES);

export function quizById(id: string) {
  return QUIZZES.find((q) => q.id === id);
}

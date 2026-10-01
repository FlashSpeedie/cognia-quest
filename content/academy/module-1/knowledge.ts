import type { KnowledgeChunk } from "../types";

/**
 * Module 1 tutor knowledge base - original, concise, structured summaries
 * that ground the AI learning assistant. Server-side only: the client never
 * loads this file; the tutor API retrieves only the few relevant chunks per
 * question and keeps the total context bounded.
 */
export const KNOWLEDGE: KnowledgeChunk[] = [
  // ── Lesson 1 ────────────────────────────────────────────────────────────
  {
    id: "m1-what-is-ml",
    moduleId: "module-1",
    lessonId: "m1-l1",
    concept: "What machine learning is",
    summary:
      "Machine learning builds software that improves at a task by finding patterns in examples (data) instead of following only hand-written rules. Traditional programming feeds rules and data in to get answers; machine learning feeds data and answers in, and the system produces the rules - a model - as its output.",
    source: { chapter: 1, start: 0, end: 1043 },
    keywords: ["machine learning", "rules", "traditional programming", "patterns", "examples", "data", "model", "learn", "definition", "what is"],
  },
  {
    id: "m1-ai-vs-ml",
    moduleId: "module-1",
    lessonId: "m1-l1",
    concept: "AI vs machine learning",
    summary:
      "Artificial intelligence is the broad goal: machines doing things that would require intelligence if a human did them. Machine learning is one approach to reaching that goal - learning behavior from data. All machine learning is AI, but not all AI uses machine learning: a hand-crafted rule-based chess engine is AI without ML.",
    source: { chapter: 1, start: 0, end: 1043 },
    keywords: ["ai", "artificial intelligence", "ml", "relationship", "difference", "rule-based", "chess", "subset", "broad"],
  },
  {
    id: "m1-applications",
    moduleId: "module-1",
    lessonId: "m1-l1",
    concept: "Real-world applications of ML",
    summary:
      "Machine learning appears across nearly every industry: healthcare (flagging unusual patterns in medical images, patient risk), finance (fraud detection on transactions), retail (demand forecasting), recommendation systems (music, video, shopping), marketing (response prediction), autonomous vehicles (recognizing pedestrians and obstacles), language systems (translation, transcription, chat), agriculture (crop health and yield estimates), and entertainment (content recommendations).",
    source: { chapter: 1, start: 0, end: 1043 },
    keywords: ["applications", "healthcare", "finance", "fraud", "retail", "recommendation", "marketing", "autonomous", "self-driving", "nlp", "chat", "agriculture", "entertainment", "real world", "examples", "industries", "spam"],
  },
  {
    id: "m1-fraud-example",
    moduleId: "module-1",
    lessonId: "m1-l1",
    concept: "Fraud detection example",
    summary:
      "In the fraud-alert example, nobody writes a rule for each situation: a model compares a new transaction against thousands of examples of normal spending and typical fraud, producing a risk score in a fraction of a second for a case never seen before. That judgment on unseen cases is machine learning in action.",
    source: { chapter: 1, start: 0, end: 1043 },
    keywords: ["fraud", "alert", "transaction", "risk score", "bank", "example", "card"],
  },

  // ── Lesson 2 ──────────────────────────────────────────────────────────
  {
    id: "m1-stack",
    moduleId: "module-1",
    lessonId: "m1-l2",
    concept: "The machine learning stack",
    summary:
      "Practical machine learning is a stack of layers: Data -> Statistics & Mathematics -> Machine Learning -> Evaluation -> Applications. Data is the raw material and sets the ceiling for everything above it. Statistics and mathematics provide the tools for summarizing data and reasoning about uncertainty. Machine learning is the modeling layer (with Python as the common practical workbench). Evaluation is the honesty layer that says whether a model works. Applications deliver models to real users.",
    source: { chapter: 2, start: 1043, end: 1566 },
    keywords: ["stack", "roadmap", "layers", "data", "statistics", "mathematics", "evaluation", "applications", "order", "hierarchy", "python"],
  },
  {
    id: "m1-data-layer",
    moduleId: "module-1",
    lessonId: "m1-l2",
    concept: "Why data quality comes first",
    summary:
      "Problems flow down the stack: a model trained on mislabeled or corrupted data is capped by that flaw, and no better algorithm or metric above the data layer can fully fix it. This is why practitioners obsess over data quality before reaching for fancier algorithms - 'garbage in, garbage out'.",
    source: { chapter: 2, start: 1043, end: 1566 },
    keywords: ["data quality", "garbage", "mislabeled", "corrupted", "bad data", "fix first", "ceiling"],
  },
  {
    id: "m1-nlp-intro",
    moduleId: "module-1",
    lessonId: "m1-l2",
    concept: "Natural language processing",
    summary:
      "Natural language processing (NLP) is machine learning applied to human language: translation, transcription, sentiment analysis, and conversation. Language is hard because meaning depends on context and there are endless ways to say the same thing.",
    source: { chapter: 2, start: 1043, end: 1566 },
    keywords: ["nlp", "natural language", "translation", "text", "speech", "language", "chat", "sentiment"],
  },

  // ── Lesson 3 ──────────────────────────────────────────────────────────
  {
    id: "m1-labeled-data",
    moduleId: "module-1",
    lessonId: "m1-l3",
    concept: "Labeled vs unlabeled data",
    summary:
      "Labeled data comes with the correct answer (the target) attached to each example - emails marked spam/not-spam, houses with their sale prices. Unlabeled data is raw examples without answers. Labels usually require human effort, which makes them expensive; unlabeled data is abundant.",
    source: { chapter: 3, start: 3001, end: 3143 },
    keywords: ["labeled", "unlabeled", "label", "target", "answer key", "annotation", "dataset", "examples with answers"],
  },
  {
    id: "m1-features-target",
    moduleId: "module-1",
    lessonId: "m1-l3",
    concept: "Features and target",
    summary:
      "Features are the input variables a model uses to make predictions - the measurable attributes of each example, like a house's size, age, number of bedrooms and distance to downtown. The target (also called the dependent variable) is the value the model tries to predict, like the sale price.",
    source: { chapter: 3, start: 3001, end: 3143 },
    keywords: ["feature", "features", "target", "dependent variable", "input", "predict", "attribute", "variable"],
  },
  {
    id: "m1-supervised",
    moduleId: "module-1",
    lessonId: "m1-l3",
    concept: "Supervised learning",
    summary:
      "Supervised learning trains on labeled examples: the model studies examples where both features and target are known (spam emails labeled by users, houses with known sale prices, images with confirmed diagnoses) and learns the mapping from features to target. It can then predict the target for new, unseen examples.",
    source: { chapter: 3, start: 3001, end: 3143 },
    keywords: ["supervised", "supervised learning", "labeled examples", "mapping", "train", "predict", "learn from examples"],
  },
  {
    id: "m1-unsupervised",
    moduleId: "module-1",
    lessonId: "m1-l3",
    concept: "Unsupervised learning",
    summary:
      "Unsupervised learning works on unlabeled data, revealing structure without an answer key. The classic tasks are clustering (automatically grouping similar examples - customer segments, similar products, similar articles) and outlier or anomaly detection (finding examples unlike any learned normal pattern, such as suspicious transactions or network traffic).",
    source: { chapter: 3, start: 3001, end: 3143 },
    keywords: ["unsupervised", "unsupervised learning", "clustering", "cluster", "outlier", "anomaly", "detection", "grouping", "segments", "structure"],
  },

  // ── Lesson 4 ──────────────────────────────────────────────────────────
  {
    id: "m1-regression",
    moduleId: "module-1",
    lessonId: "m1-l4",
    concept: "Regression",
    summary:
      "Regression is supervised learning where the target is a continuous numeric value - a house's sale price, a temperature, a commute time in minutes, electricity demand in megawatt-hours. The model's answer is a number that could fall anywhere along a range.",
    source: { chapter: 3, start: 3143, end: 3282 },
    keywords: ["regression", "continuous", "numeric", "number", "price", "predict a value", "output"],
  },
  {
    id: "m1-classification",
    moduleId: "module-1",
    lessonId: "m1-l4",
    concept: "Classification",
    summary:
      "Classification is supervised learning where the target is a category from a fixed set: spam or not spam, benign or malignant, cat/dog/rabbit, on-time or late. The model's answer is a label chosen from the predefined possibilities.",
    source: { chapter: 3, start: 3143, end: 3282 },
    keywords: ["classification", "category", "categorical", "label", "class", "spam", "bucket", "discrete"],
  },
  {
    id: "m1-framing",
    moduleId: "module-1",
    lessonId: "m1-l4",
    concept: "The 10-second test and reframing",
    summary:
      "To pick regression vs classification, ask: is the answer a number that could take many values (regression) or a name from a fixed set of categories (classification)? The same problem can often be framed either way - predicting exact temperature is regression, while predicting hot/warm/cold is classification - and the framing changes which tools and metrics apply.",
    source: { chapter: 3, start: 3143, end: 3282 },
    keywords: ["framing", "reframe", "difference", "which one", "choose", "test", "number or category", "risk score"],
  },

  // ── Lesson 5 ──────────────────────────────────────────────────────────
  {
    id: "m1-metrics-intro",
    moduleId: "module-1",
    lessonId: "m1-l5",
    concept: "Why evaluation metrics exist",
    summary:
      "Evaluation metrics turn a model's performance into a standard, comparable, honest number. There is no single best metric because different mistakes cost different amounts in different situations - the skill is matching the metric to the mistake you most need to avoid.",
    source: { chapter: 3, start: 3282, end: 3702 },
    keywords: ["metric", "metrics", "evaluation", "evaluate", "score", "performance", "measure", "why"],
  },
  {
    id: "m1-regression-metrics",
    moduleId: "module-1",
    lessonId: "m1-l5",
    concept: "Regression metrics (MAE, RMSE, MSE, RSS)",
    summary:
      "For regression, each prediction has an error (predicted minus actual). MAE is the average miss size in the target's own units, with every unit of error counting equally. RMSE squares errors before averaging and then takes the root, punishing large misses extra hard - RMSE much larger than MAE signals a few dramatically wrong predictions. MSE skips the square root (not in target units), and RSS is the raw sum of squared errors, useful as a building block in fitting rather than as a headline. For all of these, lower is better.",
    source: { chapter: 3, start: 3282, end: 3702 },
    keywords: ["mae", "mean absolute error", "rmse", "root mean squared", "mse", "mean squared error", "rss", "residual sum of squares", "error", "miss", "lower is better", "units"],
  },
  {
    id: "m1-accuracy",
    moduleId: "module-1",
    lessonId: "m1-l5",
    concept: "Accuracy and the class-imbalance trap",
    summary:
      "Accuracy is the share of predictions that were simply correct. It is intuitive but dangerous with imbalanced data: if 99% of email is legitimate, a model that never flags anything scores 99% accuracy while catching zero spam. The fix is to count the kinds of right and wrong separately - precision, recall, and F1.",
    source: { chapter: 3, start: 3282, end: 3702 },
    keywords: ["accuracy", "imbalanced", "imbalance", "trap", "99 percent", "useless", "dominant class"],
  },
  {
    id: "m1-precision-recall",
    moduleId: "module-1",
    lessonId: "m1-l5",
    concept: "Precision, recall, and F1",
    summary:
      "Precision asks: of everything the model flagged, how much really deserved flagging? (few false alarms - when it says spam, believe it). Recall asks: of all the real cases, how many did the model catch? (few misses). They pull against each other: flag aggressively and recall rises while precision falls. The F1 score combines both into a single number that is high only when both are high. Choose the metric that matches what a mistake costs: missed intrusions are catastrophic -> prioritize recall; false alarms are the nuisance -> prioritize precision.",
    source: { chapter: 3, start: 3282, end: 3702 },
    keywords: ["precision", "recall", "f1", "false alarm", "missed", "caught", "flagged", "tradeoff", "balance", "cost", "which metric"],
  },
  {
    id: "m1-unsupervised-metrics",
    moduleId: "module-1",
    lessonId: "m1-l5",
    concept: "Clustering quality metrics",
    summary:
      "Without labels, clustering quality can still be measured. Homogeneity asks whether each cluster contains only one kind of thing; completeness asks whether each kind of thing is fully inside one cluster. The silhouette score measures how snugly each example fits its own group versus the nearest other group, rewarding clusters that are tight inside and well separated. Higher is better for all of these.",
    source: { chapter: 3, start: 3282, end: 3702 },
    keywords: ["homogeneity", "completeness", "silhouette", "clustering metric", "cluster quality", "separated", "tight"],
  },

  // ── Lesson 6 ──────────────────────────────────────────────────────────
  {
    id: "m1-splits",
    moduleId: "module-1",
    lessonId: "m1-l6",
    concept: "Training, validation, and test sets",
    summary:
      "The training set is the only data the model studies while learning. The validation set is held back and used during development to compare options and tune choices - it absorbs the information leakage of development decisions. The test set is sealed until the end and used exactly once for the final honest evaluation. Evaluating on training data measures memory, not skill - like a student graded on the answer key they studied.",
    source: { chapter: 3, start: 3702, end: 3907 },
    keywords: ["training set", "validation set", "test set", "split", "hold out", "held out", "unseen", "leakage", "why split"],
  },
  {
    id: "m1-workflow",
    moduleId: "module-1",
    lessonId: "m1-l6",
    concept: "The ML workflow",
    summary:
      "The workflow runs: 1) prepare the data (clean, format, gather examples), 2) split into training/validation/test sets, 3) train a model on the training set, 4) validate and tune choices on the validation set, 5) evaluate once on the untouched test set, 6) judge whether the model is good enough. Generalization to unseen data - the real-world goal the whole pipeline serves - is what the final evaluation estimates.",
    source: { chapter: 3, start: 3702, end: 3907 },
    keywords: ["workflow", "steps", "order", "pipeline", "prepare", "split", "train", "validate", "tune", "test", "evaluate", "process"],
  },
  {
    id: "m1-generalization",
    moduleId: "module-1",
    lessonId: "m1-l6",
    concept: "Generalization",
    summary:
      "Generalization is how well a model's learned patterns hold up on data it has never seen. It is the only performance that matters, because deployed models live entirely on new data - new emails, transactions, patients, houses. The test set matters precisely because it is the closest honest rehearsal for that future. Reusing the test set for tuning inflates its estimate and destroys its honesty.",
    source: { chapter: 3, start: 3702, end: 3907 },
    keywords: ["generalization", "generalize", "unseen data", "new data", "real world", "test", "future", "honest estimate"],
  },

  // ── Lesson 7 ──────────────────────────────────────────────────────────
  {
    id: "m1-bias",
    moduleId: "module-1",
    lessonId: "m1-l7",
    concept: "Bias",
    summary:
      "Bias is error from the model being too simple to capture the real pattern: it misses the truth systematically, in the same direction, regardless of which examples it trains on - like a straight line forced through data that actually curves. In the dartboard analogy: darts clustered tightly but far from the bullseye.",
    source: { chapter: 4, start: 3915, end: 4341 },
    keywords: ["bias", "too simple", "oversimpl", "systematic", "miss the pattern", "straight line", "dartboard"],
  },
  {
    id: "m1-variance",
    moduleId: "module-1",
    lessonId: "m1-l7",
    concept: "Variance",
    summary:
      "Variance is error from the model being too sensitive to its particular training sample: retrain on a different sample of the same phenomenon and you get a noticeably different model. In the dartboard analogy: darts scattered wildly - unpredictable on any single throw even if centered.",
    source: { chapter: 4, start: 3915, end: 4341 },
    keywords: ["variance", "sensitive", "sample", "different sample", "scattered", "unstable", "reacts to noise"],
  },
  {
    id: "m1-tradeoff",
    moduleId: "module-1",
    lessonId: "m1-l7",
    concept: "The bias-variance trade-off",
    summary:
      "Model flexibility moves bias and variance in opposite directions: as flexibility rises, bias falls (the model can capture more of the true pattern) while variance rises (the same bendiness makes it wrap around sample noise). The sweet spot is problem-dependent: enough flexibility to capture the pattern, not enough to chase noise.",
    source: { chapter: 4, start: 3915, end: 4341 },
    keywords: ["tradeoff", "trade-off", "flexibility", "complexity", "sweet spot", "balance", "dial", "spectrum"],
  },
  {
    id: "m1-irreducible",
    moduleId: "module-1",
    lessonId: "m1-l7",
    concept: "Reducible vs irreducible error",
    summary:
      "Reducible error exists because of modeling choices - bias and variance are both reducible with better choices. Irreducible error is noise built into the world itself: a buyer's mood, a coin flip, factors no dataset captured. No model can eliminate it; it is the floor that sets the best achievable performance.",
    source: { chapter: 4, start: 3915, end: 4341 },
    keywords: ["irreducible", "reducible", "noise", "floor", "unmeasured", "randomness", "cannot eliminate"],
  },

  // ── Lesson 8 ──────────────────────────────────────────────────────────
  {
    id: "m1-overfitting",
    moduleId: "module-1",
    lessonId: "m1-l8",
    concept: "Overfitting",
    summary:
      "Overfitting happens when a model learns its training data too closely - including noise and quirks that will never repeat - producing strong training performance but weak performance on new data. It is the study-guide trap: the student who memorized the answer key aces the practice exam and collapses on the real one. The fingerprint is a large training/test performance gap. Overfitting is the practical face of high variance.",
    source: { chapter: 5, start: 4349, end: 6063 },
    keywords: ["overfitting", "overfit", "memoriz", "training performance", "test performance", "gap", "noise", "quirks", "collapse", "diagnose"],
  },
  {
    id: "m1-underfitting",
    moduleId: "module-1",
    lessonId: "m1-l8",
    concept: "Underfitting",
    summary:
      "Underfitting is the opposite failure: the model is too simple to capture even the real pattern, performing poorly on training data and new data alike. It is high bias made visible. The 10-second diagnostic: training great + test poor = overfitting; both poor = underfitting; both good = healthy.",
    source: { chapter: 5, start: 4349, end: 6063 },
    keywords: ["underfitting", "underfit", "too simple", "both poor", "miss pattern", "diagnostic"],
  },
  {
    id: "m1-regularization",
    moduleId: "module-1",
    lessonId: "m1-l8",
    concept: "Regularization",
    summary:
      "Regularization is a catch-all term for techniques that penalize complexity during training - a complexity tax. The model is nudged toward smoother behavior and discouraged from contorting itself around tiny quirks, keeping only patterns strong enough to be worth their cost.",
    source: { chapter: 5, start: 4349, end: 6063 },
    keywords: ["regularization", "penalty", "penalize", "complexity tax", "smooth", "simpler", "shrink"],
  },
  {
    id: "m1-anti-overfitting",
    moduleId: "module-1",
    lessonId: "m1-l8",
    concept: "Strategies to reduce overfitting",
    summary:
      "Six practical anti-overfitting strategies: use a simpler model (less flexibility to wrap around noise); get more data (true patterns repeat and dominate while quirks cancel); regularization (penalize complexity during training); resampling and cross-validation (rotate which data is held out so estimates are reliable and lucky splits can't fool you); early stopping (stop training when held-out performance peaks, before memorizing starts); and ensemble methods (average several models so their individual quirks cancel, leaving the shared real pattern).",
    source: { chapter: 5, start: 4349, end: 6063 },
    keywords: ["reduce overfitting", "more data", "simpler model", "cross-validation", "cross validation", "early stopping", "ensemble", "resampling", "strategies", "fix", "prevent"],
  },
  {
    id: "m1-cross-validation",
    moduleId: "module-1",
    lessonId: "m1-l8",
    concept: "Cross-validation",
    summary:
      "Cross-validation rotates which portion of the data is held out and checks performance across several splits, producing far more reliable estimates than one lucky train/test split - and making it obvious when a model only performs well on one convenient split.",
    source: { chapter: 5, start: 4349, end: 6063 },
    keywords: ["cross-validation", "cross validation", "rotate", "splits", "reliable estimate", "resampling", "folds"],
  },
];

/** Server-side retrieval: score chunks against the question, keep the best few. */
export function retrieveKnowledge(
  moduleId: string,
  lessonId: string | undefined,
  question: string,
  opts: { max?: number; maxChars?: number } = {},
): KnowledgeChunk[] {
  const max = opts.max ?? 6;
  const maxChars = opts.maxChars ?? 6000;
  const words = new Set(
    question
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );

  const scored = KNOWLEDGE.filter((k) => k.moduleId === moduleId).map((k) => {
    let score = 0;
    for (const kw of k.keywords) {
      const q = question.toLowerCase();
      if (q.includes(kw)) score += kw.includes(" ") ? 3 : 2;
      // whole-word overlap for short keywords
      const kwWords = kw.split(/\s+/);
      for (const w of kwWords) {
        if (words.has(w)) score += 1;
      }
    }
    if (lessonId && k.lessonId === lessonId) score += 2; // gentle current-lesson boost
    return { k, score };
  });

  const selected: KnowledgeChunk[] = [];
  let total = 0;
  for (const { k, score } of scored.sort((a, b) => b.score - a.score)) {
    if (selected.length >= max) break;
    if (score <= 0) break; // only relevant chunks - never pad with noise
    const projected = total + k.summary.length;
    if (projected > maxChars && selected.length > 0) continue;
    selected.push(k);
    total += k.summary.length;
  }
  return selected;
}

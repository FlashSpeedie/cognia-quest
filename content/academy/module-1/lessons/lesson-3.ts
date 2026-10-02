import type { AcademyLesson } from "../../types";
import { LESSON_SEGMENTS } from "../module";

export const lesson3: AcademyLesson = {
  meta: {
    id: "m1-l3",
    slug: "supervised-vs-unsupervised",
    order: 3,
    title: "Supervised vs. Unsupervised Learning",
    minutes: 20,
    summary:
      "The first big fork in the road: learning with an answer key (supervised) versus finding hidden structure without one (unsupervised).",
    goals: [
      "Explain the difference between labeled and unlabeled data",
      "Define features and the target variable",
      "Explain supervised and unsupervised learning",
      "Recognize clustering and outlier detection as unsupervised tasks",
    ],
  },
  moduleId: "module-1",
  video: { segments: LESSON_SEGMENTS["m1-l3"]! },
  sheet: {
    coreIdea: [
      "Machine learning splits into two great families, and the split comes down to one question: when the model studied its examples, was there an answer key?",
      "With an answer key, a student can check every attempt and gradually learn what separates right answers from wrong ones. Without one, the best a student can do is organize the problems - notice which ones look alike, and which one looks like nothing else. Both are learning; they're just learning different things.",
    ],
    vocabulary: [
      {
        term: "Labeled data",
        body: "Examples that come with the correct answer attached - each email marked \"spam\" or \"not spam\", each house with its actual sale price.",
      },
      {
        term: "Unlabeled data",
        body: "Examples without answers attached - just the raw items. There is still plenty to learn from them, but nothing to check against.",
      },
      {
        term: "Features",
        body: "The input variables a model uses to make its prediction - the measurable attributes of each example. In a house-price model: size, age, location, number of bedrooms.",
      },
      {
        term: "Target (dependent variable)",
        body: "The value the model is trying to predict - the price, the label, the diagnosis. The features describe the example; the target is the answer.",
      },
    ],
    concepts: [
      {
        title: "Supervised learning: learning with the answer key",
        body: [
          "Supervised learning trains on labeled examples. Each example is described by features - the inputs the model gets to see - and a target: the answer we want it to predict.",
          "Take house-price prediction. Features: size, age, number of bedrooms, distance to downtown. Target: the sale price. The model studies thousands of examples where all of these are known, and learns how the features relate to the target. Show it a house it has never seen, and it produces a price estimate.",
          "Spam detection works the same way: the features are the words and patterns in a message, and the target is the label - spam or not spam - that humans attached to the training examples. A doctor-confirmed diagnosis, a verified fraud case, a real sale price: whenever humans (or reality itself) can supply the answer, supervision is possible.",
        ],
      },
      {
        title: "Unsupervised learning: finding structure without answers",
        body: [
          "Unsupervised learning works on unlabeled data. With no answer key, the model's job is not to predict a target - it is to reveal structure that humans can't easily see in thousands of examples.",
          "The most common unsupervised task is clustering: automatically grouping similar examples together. A streaming service might discover, without anyone naming the groups, that its viewers naturally fall into clusters - late-night comedy watchers, documentary binge-watchers, workout-music listeners. Retailers use the same idea to group similar products.",
          "The other classic unsupervised task is outlier detection - sometimes called anomaly detection: finding the examples that don't fit any pattern. A bank doesn't always have labels for fraud, but fraudulent transactions behave unlike everything else, so an unsupervised model can flag them as outliers worth a human's attention.",
        ],
        diagramId: "supervised-vs-unsupervised",
      },
      {
        title: "Same data, two different questions",
        body: [
          "Suppose a music app has listening data for a million users. Question one: \"Which users will like this new album?\" - a supervised question, if the app has labeled examples of who liked similar albums before. Question two: \"What kinds of listeners even exist?\" - an unsupervised question; no labels exist for \"kinds of listeners\" until clustering reveals them.",
          "Same data, different question, different family of learning. That's the practical skill: hear a problem, and ask - does this come with an answer key?",
        ],
      },
    ],
    example: {
      title: "The answer key decides",
      body: [
        "Spam filter trained on 100,000 emails that real users already marked as \"spam\" or \"not spam\" - supervised: the training examples include known target labels.",
        "News site organizing 50,000 articles with no categories, grouping similar ones together - unsupervised: clustering reveals structure directly from the data, with no predefined labels to learn from.",
      ],
    },
    commonConfusion: {
      title: "\u201cUnsupervised means the model is unguided or worse\u201d",
      body: "Unsupervised doesn't mean weaker or untrained - it means no answer key exists. Clustering and outlier detection answer questions supervision can't (\"what structure is hiding here?\"). And it works with the most abundant resource there is: unlabeled data, which is nearly free to collect while labels usually require human effort.",
    },
    thinkAboutIt:
      "Labels are expensive - a real human usually has to produce them. Unlabeled data is nearly free - the world produces it constantly. Given that, why do you think so much practical machine learning is still supervised? What might that mean about which problems are easiest to solve?",
    keyTakeaways: [
      "Supervised learning trains on labeled examples to predict a known target.",
      "Unsupervised learning finds structure in unlabeled data: groups (clustering) and oddities (outlier detection).",
      "Features are the inputs; the target is the answer being predicted.",
      "The same data can serve either family - the question decides.",
      "Labels cost human effort; unlabeled data is abundant. Which you have shapes what you can attempt.",
    ],
    sourceConnection:
      "This lesson plays the source segment 50:01\u201352:23 (Chapter 3 - ML Basics), where LunarTech introduces supervised learning with labeled data and unsupervised learning with unlabeled data, including clustering and outlier detection.",
  },
  checkpoints: [
    {
      id: "m1-l3-cp1",
      segmentId: "m1-l3-s1",
      timestampSeconds: 62,
      type: "choice",
      concept: "Supervised learning",
      scenario:
        "A spam filter is trained on 100,000 emails that real users already marked as \"spam\" or \"not spam\".",
      prompt: "Which kind of learning is this?",
      options: [
        "Supervised - the training examples include known target labels",
        "Unsupervised - no answers were involved",
        "Supervised - because email is text",
        "Unsupervised - because spam is rare",
      ],
      correct: 0,
      explanation:
        "This is supervised learning because the training data includes labels (spam / not spam) produced by real users. The model learns the mapping from the email's features to that target label.",
    },
    {
      id: "m1-l3-cp2",
      segmentId: "m1-l3-s1",
      timestampSeconds: 108,
      type: "choice",
      concept: "Unsupervised learning",
      scenario:
        "A news site wants to organize 50,000 articles, but nobody has assigned categories. A model groups articles so that similar ones land together.",
      prompt: "Which kind of learning is this?",
      options: [
        "Supervised - articles have implicit categories",
        "Unsupervised - clustering similar examples without predefined labels",
        "Supervised - because the articles were hand-written",
        "It isn't machine learning at all",
      ],
      correct: 1,
      explanation:
        "This is unsupervised clustering: there are no pre-existing labels to learn from, so the model's job is to reveal structure - groups of similar articles - directly from the data.",
    },
    {
      id: "m1-l3-cp3",
      segmentId: "m1-l3-s1",
      timestampSeconds: 130,
      type: "multi",
      concept: "Classifying tasks",
      prompt: "Select every task that is supervised learning.",
      options: [
        "Predicting house prices from past sales that include the final price",
        "Grouping customers into segments without any predefined categories",
        "Detecting spam using emails humans already labeled",
        "Flagging unusual network traffic as outliers, with no labeled attacks",
      ],
      correct: [0, 2],
      explanation:
        "House-price prediction and labeled spam detection are supervised: both train on examples with known answers (prices, spam labels). Customer segmentation and outlier detection on unlabeled traffic are unsupervised: they reveal structure rather than predict a known target.",
    },
  ],
  activity: {
    kind: "supervised-sorter",
    heading: "Optional exercise - Supervised or unsupervised?",
    intro:
      "Five real situations. For each one, decide whether it learns from labeled examples or finds structure without labels - then read why.",
  },
  quizId: "quiz-m1-l3",
  freeResponses: [
    {
      id: "fr-m1-l3-1",
      prompt:
        "Explain the difference between supervised and unsupervised learning. Then invent one example of your own for each - a task that needs labels, and a task that finds structure without them.",
      guidance: "Aim for 3-5 sentences. The phrases \"answer key\" or \"labeled\" often help make the distinction click.",
      expectedConcepts: ["label", "target", "cluster", "group", "outlier", "anomaly", "answer", "structure"],
      rubric: [
        "States the core distinction: supervised learns from labeled examples to predict a target; unsupervised finds structure in unlabeled data",
        "Gives a correct original example for supervised learning",
        "Gives a correct original example for unsupervised learning (clustering or outlier detection)",
      ],
      minLength: 100,
      maxLength: 1200,
    },
    {
      id: "fr-m1-l3-2",
      prompt:
        "For a house-price prediction model, define features and target in your own words - then name at least three features you would give such a model and explain why they might matter.",
      guidance: "Aim for 2-4 sentences. Features are the inputs; the target is the answer.",
      expectedConcepts: ["feature", "target", "input", "predict", "price", "size"],
      rubric: [
        "Defines features as the input attributes and the target as the predicted answer",
        "Names at least three sensible features",
        "Gives a plausible reason at least one feature matters",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l3-3",
      prompt:
        "A bank wants to catch suspicious transactions but has no confirmed list of fraud cases. Explain why this pushes them toward unsupervised outlier detection - and what would have to exist for supervised classification to become possible instead.",
      guidance: "Aim for 2-3 sentences. Think about what supervision requires.",
      expectedConcepts: ["label", "outlier", "anomaly", "unsupervised", "normal", "supervised"],
      rubric: [
        "Connects the absence of labels to the unsupervised choice",
        "Explains outlier detection: learn normal, flag the abnormal",
        "Identifies what enables supervision: labeled/confirmed fraud examples",
      ],
      minLength: 80,
      maxLength: 1000,
    },
    {
      id: "fr-m1-l3-4",
      prompt:
        "One classmate claims clustering \"is just classification with different words.\" Explain the difference in a way that would change their mind.",
      guidance: "Aim for 2-3 sentences. Who defined the groups, and when?",
      expectedConcepts: ["cluster", "label", "predefined", "group", "emerge", "category"],
      rubric: [
        "Contrasts predefined labels (classification) with groups that emerge from the data (clustering)",
        "Uses a concrete example to make the distinction land",
        "Avoids just restating the claim",
      ],
      minLength: 80,
      maxLength: 1000,
    },
  ],
  requiredSectionIds: [
    "m1-l3-cp1",
    "m1-l3-cp2",
    "m1-l3-cp3",
    "m1-l3-sheet",
    "m1-l3-refs",
    "m1-l3-quiz",
    "fr-m1-l3-1",
    "fr-m1-l3-2",
    "fr-m1-l3-3",
    "fr-m1-l3-4",
  ],
  optionalSectionIds: ["m1-l3-activity"],
};

import type { GlossaryTerm } from "@/lib/content";

/** Glossary (spec §66). */
export const GLOSSARY: GlossaryTerm[] = [
  { term: "algorithm", definition: "A precise set of steps to solve a problem — like a recipe. Algorithms power AI, but 'algorithm' just means a procedure.", example: "A sorting algorithm arranges names alphabetically.", related: ["model", "training"] },
  { term: "model", definition: "The pattern a machine learning system learns from data; what actually makes predictions.", example: "A spam filter's model decides if an email is spam.", related: ["training", "inference"] },
  { term: "training", definition: "The phase where a model adjusts itself to fit examples in a dataset.", example: "Showing 10,000 labeled photos so a model learns 'cat'.", related: ["dataset", "model"] },
  { term: "inference", definition: "Using a trained model on new inputs to get predictions.", example: "Uploading a new photo and getting 'cat: 92%'.", related: ["model", "training"] },
  { term: "dataset", definition: "A collection of examples used to train or evaluate a model.", example: "50,000 labeled images of street signs.", related: ["feature", "label"] },
  { term: "feature", definition: "An input variable a model uses — one measured property of an example.", example: "For house prices: square footage, bedrooms, school district.", related: ["label", "dataset"] },
  { term: "label", definition: "The answer attached to a training example; what the model learns to predict.", example: "'Spam' or 'not spam' on each training email.", related: ["feature", "classification"] },
  { term: "classification", definition: "Predicting a category.", example: "Hot dog or not hot dog.", related: ["regression", "label"] },
  { term: "regression", definition: "Predicting a number.", example: "Estimating a house's price.", related: ["classification"] },
  { term: "neural network", definition: "A family of models built from layers of simple units that transform inputs step by step; the engine behind most modern AI.", related: ["model", "training"] },
  { term: "prompt", definition: "The input you give a generative model — instructions, context, questions.", example: "'Explain osmosis to a 10-year-old in 100 words.'", related: ["token", "hallucination"] },
  { term: "token", definition: "A chunk of text a language model reads or writes — often part of a word.", example: "'unbelievable' might be 3 tokens: un · believ · able.", related: ["prompt"] },
  { term: "hallucination", definition: "Confident AI output that is false or invented.", example: "A citation to a research paper that doesn't exist.", related: ["prompt", "bias"] },
  { term: "bias", definition: "Systematic skew in data or model behavior that disadvantages some groups or answers.", example: "A hiring model trained on past hires may repeat past discrimination.", related: ["dataset", "overfitting"] },
  { term: "privacy", definition: "Control over how personal data is collected, used, and shared.", related: ["dataset"] },
  { term: "overfitting", definition: "When a model memorizes training data, including its noise, and fails on new data.", example: "100% on practice test, 60% on the real one.", related: ["validation", "test set"] },
  { term: "validation", definition: "Tuning and checking a model on data held out from training.", example: "Picking the best settings using the validation split.", related: ["test set", "overfitting"] },
  { term: "test set", definition: "Data locked away until the very end to honestly measure generalization.", example: "The final exam your model never saw in class.", related: ["validation", "overfitting"] },
  { term: "recommendation system", definition: "AI that predicts what content you'll engage with next.", example: "Your video feed's next autoplay.", related: ["model"] },
  { term: "generative AI", definition: "AI that creates new content: text, images, audio, code.", example: "An image model drawing 'a robot librarian'.", related: ["prompt", "hallucination"] },
  { term: "context window", definition: "How much text a language model can consider at once.", example: "Details from 50 messages ago may have fallen out of the window.", related: ["token", "prompt"] },
  { term: "false positive", definition: "Flagging something that isn't actually the thing.", example: "A spam filter jailing your friend's email.", related: ["classification"] },
  { term: "false negative", definition: "Missing something that is the thing.", example: "Spam landing in your inbox.", related: ["false positive", "classification"] },
  { term: "data minimization", definition: "Collecting only the data a feature genuinely needs.", example: "A flashlight app shouldn't want your contacts.", related: ["privacy"] },
];

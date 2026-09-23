import type { Career } from "@/lib/content";

/** AI Career Explorer (spec §65). */
export const CAREERS: Career[] = [
  {
    title: "AI Engineer",
    icon: "🛠️",
    what: "Builds AI-powered products: connects models to data, APIs, and user interfaces, then makes them reliable at scale.",
    skills: ["Programming (Python)", "APIs & cloud", "Prompt design", "Testing"],
    subjects: ["Computer Science", "Math", "Engineering electives"],
  },
  {
    title: "Data Scientist",
    icon: "📊",
    what: "Finds patterns in data to answer real questions, from sports analytics to public health.",
    skills: ["Statistics", "Visualization", "SQL", "Experiment design"],
    subjects: ["Statistics", "Math", "Any science lab"],
  },
  {
    title: "Machine Learning Engineer",
    icon: "🧠",
    what: "Trains, evaluates, and ships models - the people closest to the training loop.",
    skills: ["Linear algebra", "ML frameworks", "Data pipelines", "Optimization"],
    subjects: ["Computer Science", "Math", "Physics"],
  },
  {
    title: "Robotics Engineer",
    icon: "🤖",
    what: "Gives AI a body: sensors, movement, and control for machines that act in the physical world.",
    skills: ["Electronics", "Control systems", "CAD", "Programming"],
    subjects: ["Physics", "Engineering", "Computer Science"],
  },
  {
    title: "AI Product Designer",
    icon: "🎨",
    what: "Designs how people interact with AI - the interfaces, guardrails, and moments of trust.",
    skills: ["UX research", "Prototyping", "Psychology", "Visual design"],
    subjects: ["Art/Design", "Psychology", "Computer Science"],
  },
  {
    title: "AI Safety Researcher",
    icon: "🛡️",
    what: "Studies how advanced AI systems can fail or be misused, and designs ways to keep them beneficial.",
    skills: ["ML fundamentals", "Critical thinking", "Formal reasoning", "Writing"],
    subjects: ["Computer Science", "Philosophy", "Math"],
  },
  {
    title: "Data Analyst",
    icon: "📈",
    what: "Turns raw numbers into decisions for businesses, teams, and governments.",
    skills: ["Spreadsheets", "SQL", "Dashboards", "Storytelling with data"],
    subjects: ["Math", "Statistics", "Economics"],
  },
  {
    title: "AI Policy Researcher",
    icon: "⚖️",
    what: "Writes the rules: studies how laws and institutions should govern AI so the public is protected.",
    skills: ["Research", "Writing", "Ethics", "Economics"],
    subjects: ["Civics/Government", "English", "Debate"],
  },
  {
    title: "Computational Linguist",
    icon: "💬",
    what: "Studies language with computers - how models process it and how to make that fair and accurate.",
    skills: ["Linguistics", "Programming", "Statistics"],
    subjects: ["English", "World Languages", "Computer Science"],
  },
];

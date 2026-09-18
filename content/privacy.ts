import type { PrivacyScenario } from "@/lib/content";

/** Privacy Challenge scenarios (spec §22/§56: 10). */
export const PRIVACY_SCENARIOS: PrivacyScenario[] = [
  {
    id: "priv-tutor",
    title: "The Eager Tutor",
    app: "AI Math Tutor",
    context: "An AI tutor explains math problems step by step. It asks for the following permissions. Which does it actually need?",
    dataRequests: [
      { id: "d1", label: "The math problem you type", needed: true, reason: "It can't explain a problem it can't see." },
      { id: "d2", label: "Your grade level", needed: true, reason: "Legitimately changes the explanation depth." },
      { id: "d3", label: "Your full name", needed: false, reason: "A nickname works fine; names add risk without adding math help." },
      { id: "d4", label: "Your home address", needed: false, reason: "Completely unrelated to tutoring." },
      { id: "d5", label: "Your browsing history", needed: false, reason: "Tracking isn't tutoring." },
      { id: "d6", label: "Your parents' income", needed: false, reason: "Sensitive and irrelevant to explaining fractions." },
    ],
    principle: "Data minimization: collect only what's needed for the stated purpose.",
  },
  {
    id: "priv-fitness",
    title: "The Step Counter",
    app: "School Fitness Challenge App",
    context: "A PE class app tracks a class step-count competition. What does it need?",
    dataRequests: [
      { id: "d1", label: "Daily step count", needed: true, reason: "The core feature." },
      { id: "d2", label: "A team name or nickname", needed: true, reason: "Needed for the leaderboard display." },
      { id: "d3", label: "Your GPS location all day", needed: false, reason: "Steps can be counted on-device without location." },
      { id: "d4", label: "Your heart rate history", needed: false, reason: "Not needed for a step competition." },
      { id: "d5", label: "Your contacts list", needed: false, reason: "Friend invites don't require uploads of your contacts." },
    ],
    principle: "Sensor data beyond the feature's need is surveillance, not fitness.",
  },
  {
    id: "priv-photo",
    title: "The Yearbook Generator",
    app: "AI Yearbook Designer",
    context: "An app arranges class photos into yearbook pages using face detection.",
    dataRequests: [
      { id: "d1", label: "The class photos you upload", needed: true, reason: "Required for the layout work." },
      { id: "d2", label: "Consent from people in the photos", needed: true, reason: "Ethically and often legally required." },
      { id: "d3", label: "A permanent copy of every face for 'future features'", needed: false, reason: "Retain only what's needed, only as long as needed." },
      { id: "d4", label: "Students' home addresses", needed: false, reason: "Unrelated to photo layout." },
      { id: "d5", label: "Rights to sell the photos to advertisers", needed: false, reason: "Student photos are not an ad asset." },
    ],
    principle: "Consent and retention limits: collect with permission, delete when done.",
  },
  {
    id: "priv-study",
    title: "The Study Planner",
    app: "AI Study Coach",
    context: "An app builds you a revision schedule for finals week.",
    dataRequests: [
      { id: "d1", label: "Your exam dates and subjects", needed: true, reason: "The schedule needs its raw material." },
      { id: "d2", label: "Roughly how many hours you can study daily", needed: true, reason: "Needed to make a realistic plan." },
      { id: "d3", label: "Your exact grades in each subject", needed: false, reason: "Self-reported confidence per topic would suffice." },
      { id: "d4", label: "Your school login password", needed: false, reason: "Never hand passwords to third-party apps." },
      { id: "d5", label: "Your friends' study habits", needed: false, reason: "Others' data isn't yours to give." },
    ],
    principle: "Never share credentials; share the minimum about others (nothing).",
  },
  {
    id: "priv-game",
    title: "The Quiz Game",
    app: "Classroom Trivia Battle",
    context: "A review-game platform for class quizzes.",
    dataRequests: [
      { id: "d1", label: "A display name", needed: true, reason: "Needed to show scores; a nickname is fine." },
      { id: "d2", label: "Quiz answers during the game", needed: true, reason: "That's the game." },
      { id: "d3", label: "Your device microphone always on", needed: false, reason: "Buzzers don't need constant audio." },
      { id: "d4", label: "Ad-tracking ID", needed: false, reason: "Classroom tools shouldn't profile students for ads." },
      { id: "d5", label: "Your date of birth", needed: false, reason: "Not needed to buzz in." },
    ],
    principle: "Classroom tools shouldn't come with advertising trackers.",
  },
  {
    id: "priv-music",
    title: "The Focus DJ",
    app: "Study Beats (music generator)",
    context: "An AI app generates focus playlists.",
    dataRequests: [
      { id: "d1", label: "What genres help you focus", needed: true, reason: "Direct input for its core feature." },
      { id: "d2", label: "Whether the playlist helped (optional feedback)", needed: true, reason: "Improves the feature; optional is the key word." },
      { id: "d3", label: "Your location", needed: false, reason: "Music generation doesn't need it." },
      { id: "d4", label: "Your calendar contents", needed: false, reason: "Knowing your schedule isn't needed to make lo-fi beats." },
    ],
    principle: "Optional feedback is fine; ambient data collection is not.",
  },
  {
    id: "priv-translate",
    title: "The Translator",
    app: "Language Helper",
    context: "An AI translation tool for language class.",
    dataRequests: [
      { id: "d1", label: "The text you want translated", needed: true, reason: "Core feature." },
      { id: "d2", label: "The target language", needed: true, reason: "Obviously required." },
      { id: "d3", label: "A history of everything you've ever typed, forever", needed: false, reason: "Retention far beyond need; session-only would do." },
      { id: "d4", label: "Access to your photos", needed: false, reason: "No relation to text translation." },
    ],
    principle: "Purpose limitation: data collected for translation shouldn't live forever.",
  },
  {
    id: "priv-counselor",
    title: "The College Matcher",
    app: "College Match",
    context: "An app suggests colleges that fit your interests.",
    dataRequests: [
      { id: "d1", label: "Your interests and intended major", needed: true, reason: "Needed to match programs." },
      { id: "d2", label: "Your general GPA band (e.g., 3.0–3.5)", needed: true, reason: "Used for reach/match/safety suggestions; bands beat exact numbers." },
      { id: "d3", label: "Your Social Security number", needed: false, reason: "Never needed for matching; huge identity-theft risk." },
      { id: "d4", label: "Your family medical history", needed: false, reason: "Deeply sensitive and irrelevant." },
      { id: "d5", label: "Permission to text your parents anytime", needed: false, reason: "Contact consent should be specific and limited." },
    ],
    principle: "The more sensitive the data, the stronger the justification must be.",
  },
  {
    id: "priv-notes",
    title: "The Note summarizer",
    app: "Notes Condenser",
    context: "An app summarizes your class notes into study sheets.",
    dataRequests: [
      { id: "d1", label: "The notes you paste in", needed: true, reason: "It summarizes what you give it." },
      { id: "d2", label: "Your school email", needed: false, reason: "Not needed for summarizing; a local save would do." },
      { id: "d3", label: "Access to all files on your device", needed: false, reason: "Massive overreach; paste-only is enough." },
      { id: "d4", label: "Your camera roll", needed: false, reason: "Unrelated." },
    ],
    principle: "Prefer paste/share flows over broad device access.",
  },
  {
    id: "priv-club",
    title: "The Club Recommender",
    app: "Club Finder",
    context: "An app suggests after-school clubs.",
    dataRequests: [
      { id: "d1", label: "Your hobbies", needed: true, reason: "Directly drives recommendations." },
      { id: "d2", label: "Your grade level", needed: true, reason: "Some clubs are grade-specific." },
      { id: "d3", label: "Your exact address", needed: false, reason: "Suggestions don't need your doorstep." },
      { id: "d4", label: "Your religious beliefs", needed: false, reason: "Sensitive data, not needed for club matching." },
      { id: "d5", label: "Continuous clipboard access", needed: false, reason: "Clipboard snooping is a known privacy abuse." },
    ],
    principle: "Sensitive traits require exceptional justification — which hobby-matching doesn't have.",
  },
];

export function privacyScenarioById(id: string) {
  return PRIVACY_SCENARIOS.find((p) => p.id === id);
}

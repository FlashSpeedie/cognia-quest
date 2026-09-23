import type { EthicsCase } from "@/lib/content";

/** AI Ethics Court cases (spec §21/§56: 10 scenarios). */
export const ETHICS_CASES: EthicsCase[] = [
  {
    id: "ethics-support",
    title: "The Early-Warning System",
    setting: "Ridgeview High School",
    scenario:
      "Ridgeview wants an AI system that predicts which students might fail classes, so counselors can offer help early. It would use grades, attendance, and assignment completion.",
    benefits: [
      "Earlier support for struggling students",
      "Counselor time focused where it's needed",
      "Could raise graduation rates",
    ],
    risks: [
      "Students might be labeled before they've had a chance",
      "Predictions can be wrong - and sticky",
      "Families may not know they're being scored",
    ],
    factors: [
      { id: "f1", label: "Will students and families be told the system exists and how it works?", category: "transparency", important: true, explanation: "People affected by scoring deserve to know about it." },
      { id: "f2", label: "What happens when the prediction is wrong? (False alarms and missed students)", category: "accuracy", important: true, explanation: "Every predictor makes errors; plan for both directions of error." },
      { id: "f3", label: "Could the label change how teachers treat a student?", category: "fairness", important: true, explanation: "A prediction about struggle can become a self-fulfilling label." },
      { id: "f4", label: "Is a counselor making final decisions, with the AI only as a flag?", category: "human-review", important: true, explanation: "Human oversight keeps the system advisory, not decisive." },
      { id: "f5", label: "What data is stored, for how long, and who can see it?", category: "privacy", important: true, explanation: "Student records are sensitive; minimization and retention rules matter." },
      { id: "f6", label: "Has the model been checked for accuracy across different student groups?", category: "fairness", important: true, explanation: "Aggregate accuracy can hide group-level failures." },
      { id: "f7", label: "Will the school logo look modern on the dashboard?", category: "transparency", important: false, explanation: "Branding has nothing to do with responsible deployment." },
      { id: "f8", label: "Could the vendor share anonymized data with advertisers?", category: "privacy", important: true, explanation: "Third-party data use needs explicit prohibition in contracts." },
      { id: "f9", label: "Is there a way for a student to contest a prediction?", category: "human-review", important: true, explanation: "A dispute path is a core accountability mechanism." },
      { id: "f10", label: "Does the system use machine learning or blockchain?", category: "safety", important: false, explanation: "The buzzword doesn't matter; the checks and effects do." },
    ],
    debrief:
      "Strong reviews cover transparency (do people know?), accuracy (what when it's wrong?), fairness (who might be misjudged?), human review (who decides?), and privacy (what's collected?). Notice that the goal isn't 'allow' or 'ban' - it's a checklist that must be satisfied before deployment.",
  },
  {
    id: "ethics-grading",
    title: "The Essay-Grading Pilot",
    setting: "Lakeside Middle School",
    scenario:
      "An English department proposes AI grading for first drafts of essays to give students faster feedback. Teachers would still grade final versions.",
    benefits: ["Instant feedback on drafts", "More revision cycles", "Teachers save hours"],
    risks: ["AI may misjudge creative writing", "Feedback may be generic", "Students might write to please the model"],
    factors: [
      { id: "f1", label: "Does the tool explain WHY it scored an essay as it did?", category: "transparency", important: true, explanation: "Feedback without reasoning teaches little." },
      { id: "f2", label: "Was it tested on many writing styles, including multilingual students?", category: "fairness", important: true, explanation: "Graders trained on one style can penalize others." },
      { id: "f3", label: "Can a teacher override or correct the AI feedback?", category: "human-review", important: true, explanation: "Teachers must stay the final authority." },
      { id: "f4", label: "Are student essays uploaded to the vendor's servers? Under what agreement?", category: "privacy", important: true, explanation: "Student writing is student data." },
      { id: "f5", label: "What is the tool's error rate on creative or unusual formats?", category: "accuracy", important: true, explanation: "Poems and humor are where rubric models stumble." },
      { id: "f6", label: "Will students know when AI, not a teacher, gave feedback?", category: "transparency", important: true, explanation: "Students deserve to know who - or what - is grading them." },
      { id: "f7", label: "Is the vendor's logo tasteful?", category: "transparency", important: false, explanation: "Aesthetics are not an ethics dimension." },
      { id: "f8", label: "Could over-reliance on the tool shrink teachers' grading skills?", category: "safety", important: true, explanation: "Skill erosion is a real long-term dependency risk." },
    ],
    debrief:
      "Draft feedback is one of the better AI uses - low stakes, high frequency - IF reasoning is visible, humans can override, student writing is protected, and group-level accuracy is checked.",
  },
  {
    id: "ethics-face",
    title: "Hallway Cameras",
    setting: "Metro Tech High",
    scenario:
      "After a security incident, the district proposes cameras with facial recognition to identify intruders and track attendance automatically.",
    benefits: ["Faster response to intruders", "Automatic attendance", "May deter incidents"],
    risks: ["Constant surveillance changes school culture", "Face recognition is less accurate for some groups", "Data breaches would expose biometric data"],
    factors: [
      { id: "f1", label: "Is the recognition accuracy equal across skin tones and ages?", category: "fairness", important: true, explanation: "Documented accuracy gaps exist across demographic groups." },
      { id: "f2", label: "Who can access the face database, and when is data deleted?", category: "privacy", important: true, explanation: "Biometric data is permanently sensitive - you can't change your face like a password." },
      { id: "f3", label: "Were students and parents asked or informed?", category: "transparency", important: true, explanation: "Consent/notice is foundational for surveillance." },
      { id: "f4", label: "Is there a human check before any action based on a 'match'?", category: "human-review", important: true, explanation: "False matches can accuse innocent students." },
      { id: "f5", label: "What is the false-match rate in real hallway conditions?", category: "accuracy", important: true, explanation: "Lighting, angles, and crowds degrade accuracy." },
      { id: "f6", label: "Could the footage be repurposed later (discipline, tracking)?", category: "safety", important: true, explanation: "Mission creep turns safety systems into discipline systems." },
      { id: "f7", label: "Do the cameras come in black or white?", category: "safety", important: false, explanation: "Hardware color is irrelevant." },
    ],
    debrief:
      "Surveillance tools concentrate every dimension at once: fairness (accuracy gaps), privacy (biometrics), transparency (notice), human review (before consequences), and safety (mission creep).",
  },
  {
    id: "ethics-admissions",
    title: "The Admissions Sorter",
    setting: "Central Magnet Program",
    scenario:
      "A competitive magnet program considers using AI to pre-screen 3,000 applications, passing a shortlist to human reviewers.",
    benefits: ["Handles volume", "Consistent criteria", "Faster decisions"],
    risks: ["Proxy discrimination (zip codes, school names)", "No nuance for unusual stories", "Errors get scaled to 3,000 applicants"],
    factors: [
      { id: "f1", label: "Which features does the model use - could any proxy for race or income?", category: "fairness", important: true, explanation: "Zip codes and school names famously proxy demographics." },
      { id: "f2", label: "Can rejected applicants learn why ask for human review?", category: "human-review", important: true, explanation: "Contestability is essential for high-stakes gates." },
      { id: "f3", label: "Was the model validated for accuracy on past cycles with known outcomes?", category: "accuracy", important: true, explanation: "Backtesting reveals whether it predicts the right thing." },
      { id: "f4", label: "Do applicants know AI screens them?", category: "transparency", important: true, explanation: "Notice is a minimum obligation for consequential decisions." },
      { id: "f5", label: "What happens to applicants who fit no historical pattern?", category: "fairness", important: true, explanation: "Models trained on history reproduce its blind spots." },
      { id: "f6", label: "Is applicant data retained or sold after decisions?", category: "privacy", important: true, explanation: "Application data is sensitive; retention needs rules." },
      { id: "f7", label: "Would a newer GPU make it faster?", category: "safety", important: false, explanation: "Speed is not an ethics safeguard." },
    ],
    debrief:
      "High-stakes + high-volume is exactly where you want the stiffest checks: proxy audits, human review, backtesting, and contestability.",
  },
  {
    id: "ethics-discipline",
    title: "The Behavior Predictor",
    setting: "Franklin Unified",
    scenario:
      "A vendor offers 'PredictDiscipline': it flags students 'at risk' of future disciplinary incidents so staff can intervene early.",
    benefits: ["Targeted counseling", "Potentially fewer suspensions"],
    risks: ["Labels children as future troublemakers", "Historical discipline data reflects past bias", "Self-fulfilling prophecies"],
    factors: [
      { id: "f1", label: "Does historical discipline data contain biased enforcement patterns?", category: "fairness", important: true, explanation: "If past enforcement was unequal, predictions inherit it." },
      { id: "f2", label: "Are predictions ever used punitively rather than supportively?", category: "safety", important: true, explanation: "The same flag can trigger help or punishment." },
      { id: "f3", label: "Do families know, and can they opt out?", category: "transparency", important: true, explanation: "No covert behavioral scoring of minors." },
      { id: "f4", label: "Who sees the risk list and what are they trained to do with it?", category: "human-review", important: true, explanation: "Untrained use of risk labels is how labels become sentences." },
      { id: "f5", label: "How often is the model wrong, and for whom?", category: "accuracy", important: true, explanation: "Group-level error rates matter more than averages." },
      { id: "f6", label: "Is behavioral data deleted when a student leaves?", category: "privacy", important: true, explanation: "Permanent records of childhood predictions are dangerous." },
      { id: "f7", label: "Does the dashboard support dark mode?", category: "transparency", important: false, explanation: "UI themes are not ethics." },
    ],
    debrief:
      "Predicting human behavior for intervention sounds helpful but risks encoding past bias as future destiny. The fairest answer is often to fund support for everyone instead of scoring individuals.",
  },
  {
    id: "ethics-tutor",
    title: "The 24/7 Tutor Bot",
    setting: "Online Learning Platform",
    scenario:
      "A tutoring startup offers a free AI tutor funded by ads. It can see each student's questions, mistakes, and session times.",
    benefits: ["Free help for everyone", "Patient, always available", "Adapts to each student"],
    risks: ["Ad incentives vs. student interests", "Long-term behavioral profiling", "Answers may embed sponsored framing"],
    factors: [
      { id: "f1", label: "Are study patterns used to target ads?", category: "privacy", important: true, explanation: "Tutoring conversations reveal struggles - sensitive ground for profiling." },
      { id: "f2", label: "Do students know the platform is ad-funded and what that means?", category: "transparency", important: true, explanation: "The business model shapes the product's incentives." },
      { id: "f3", label: "Is the tutor's accuracy monitored on core subjects?", category: "accuracy", important: true, explanation: "A patient wrong tutor is still wrong." },
      { id: "f4", label: "Is there a human escalation path when the AI is stuck or harmful?", category: "human-review", important: true, explanation: "Students need somewhere to go past the bot." },
      { id: "f5", label: "Could engagement optimization keep students hooked rather than helped?", category: "safety", important: true, explanation: "Ad-funded products optimize for time-on-platform." },
      { id: "f6", label: "Is the AI tutor's mascot friendly?", category: "transparency", important: false, explanation: "Mascot cuteness is not an ethics question." },
    ],
    debrief:
      "'Free' services are paid for somehow. When the payer is advertisers, the student's interest is no longer the only interest in the room.",
  },
  {
    id: "ethics-art",
    title: "The Art Show Entry",
    setting: "Regional Student Art Show",
    scenario:
      "A student submits an AI-generated image to an art competition without disclosing it. The judges can't tell. Organizers must set a policy.",
    benefits: ["AI tools widen creative access", "Hard to detect reliably anyway", "New medium, new art forms"],
    risks: ["Unfair to hand-drawing entrants", "Undermines the skill the contest judges", "Normalizes undisclosed AI use"],
    factors: [
      { id: "f1", label: "Should disclosure of AI use be required?", category: "transparency", important: true, explanation: "Disclosure preserves honest comparison." },
      { id: "f2", label: "What skill is the contest actually measuring?", category: "fairness", important: true, explanation: "Policy depends on whether the contest judges craft or concept." },
      { id: "f3", label: "Could separate categories keep competition fair?", category: "fairness", important: true, explanation: "Separate lanes can include AI work without displacing traditional work." },
      { id: "f4", label: "Who decides - and who reviews disputes?", category: "human-review", important: true, explanation: "Enforcement needs a fair human process." },
      { id: "f5", label: "If detection tools are used, how accurate are they?", category: "accuracy", important: true, explanation: "AI detectors are unreliable; false accusations hurt real students." },
      { id: "f6", label: "Were training images used with artists' consent?", category: "privacy", important: true, explanation: "The upstream ethics of the model matters too." },
      { id: "f7", label: "Is the trophy shiny?", category: "safety", important: false, explanation: "Trophy finish: not an ethics dimension." },
    ],
    debrief:
      "Contests are mini-societies: define what's being judged, require disclosure, create fair categories, and be humble about detection accuracy.",
  },
  {
    id: "ethics-health",
    title: "The Wellness Chatbot",
    setting: "Student Wellness App",
    scenario:
      "The school offers a mental-health chatbot for stress check-ins. It promises 'supportive conversations' and alerts counselors if it detects 'risk language'.",
    benefits: ["Always-available listening", "May catch crises earlier", "Reduces stigma of asking for help"],
    risks: ["Chatbots aren't therapists", "False alarms or missed alarms", "Sensitive conversations stored on servers"],
    factors: [
      { id: "f1", label: "Is it clearly communicated that the bot is not a therapist?", category: "transparency", important: true, explanation: "Students must know the limits of the listener." },
      { id: "f2", label: "How accurate is crisis detection - both false alarms and misses?", category: "accuracy", important: true, explanation: "Both error types have real costs here." },
      { id: "f3", label: "Who reads flagged conversations and how fast do they respond?", category: "human-review", important: true, explanation: "A flag with no fast human follow-up is a liability, not a safeguard." },
      { id: "f4", label: "How long are conversations stored and who can access them?", category: "privacy", important: true, explanation: "Mental-health conversations are among the most sensitive data a school can hold." },
      { id: "f5", label: "Could students be penalized (discipline, stigma) based on flagged chats?", category: "safety", important: true, explanation: "If disclosure leads to punishment, students learn to stay silent." },
      { id: "f6", label: "Does detection work equally well across dialects and slang?", category: "fairness", important: true, explanation: "Risk language varies by culture; models tuned on one dialect miss others." },
      { id: "f7", label: "Is the chat bubble rounded?", category: "safety", important: false, explanation: "Design polish isn't the ethics question." },
    ],
    debrief:
      "Wellness tech sits near the top of the stakes ladder. Transparency about limits, fast human response, strict data rules, and verified detection accuracy are non-negotiable.",
  },
  {
    id: "ethics-lunch",
    title: "The Lunch-Line Optimizer",
    setting: "Ridgeline Cafeterias",
    scenario:
      "A vendor proposes AI to predict cafeteria demand by student, cutting food waste - using purchase history tied to student IDs.",
    benefits: ["Less food waste", "Faster lines", "Cost savings for the district"],
    risks: ["Eating habits are personal data", "Free-lunch status is sensitive", "Profiling students by diet"],
    factors: [
      { id: "f1", label: "Could aggregate, anonymous counts work instead of per-student tracking?", category: "privacy", important: true, explanation: "Data minimization: try the least-invasive version that achieves the goal." },
      { id: "f2", label: "Is free/reduced-lunch status exposed anywhere?", category: "privacy", important: true, explanation: "Socioeconomic status of minors is highly sensitive." },
      { id: "f3", label: "Are predictions for portions validated against actual waste?", category: "accuracy", important: true, explanation: "Measure whether the system does what it claims." },
      { id: "f4", label: "Who approves changes to what food is offered?", category: "human-review", important: true, explanation: "Menus affect health; dietitians should stay in charge." },
      { id: "f5", label: "Could predictions under-stock culturally specific meals?", category: "fairness", important: true, explanation: "Majority preferences can starve variety - some students lose their options." },
      { id: "f6", label: "Is pizza day on Friday?", category: "safety", important: false, explanation: "The lunch calendar is not an ethics dimension." },
    ],
    debrief:
      "Often the privacy-respecting question is: do we need per-person tracking at all? Aggregate predictions may capture most of the benefit with far less risk.",
  },
];

export function ethicsCaseById(id: string) {
  return ETHICS_CASES.find((c) => c.id === id);
}

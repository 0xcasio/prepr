// TypeScript interfaces for all coaching_state.md sections

export interface CoachingState {
  name: string; // from "# Coaching State — Name"
  lastUpdated: string;
  profile: Profile;
  resumeAnalysis: ResumeAnalysis;
  storybank: StorybankEntry[];
  storyDetails: StoryDetail[]; // ordered as they appear in file
  scoreHistory: ScoreHistory;
  outcomeLog: OutcomeEntry[];
  interviewIntelligence: InterviewIntelligence;
  drillProgression: DrillProgression;
  interviewLoops: InterviewLoop[]; // ordered as they appear in file
  activeStrategy: CoachingStrategy;
  metaCheckLog: MetaCheckEntry[];
  sessionLog: SessionLog;
  coachingNotes: CoachingNote[];
}

export interface Profile {
  targetRoles: string;
  seniorityBand: string;
  track: string;
  feedbackDirectness: string; // keep as string to preserve e.g. "5"
  interviewTimeline: string;
  timeAwareMode: string;
  interviewHistory: string;
  biggestConcern: string;
  knownFormats: string;
}

export interface ResumeAnalysis {
  positioningStrengths: string[]; // numbered sub-items as array
  likelyInterviewerConcerns: string[];
  careerNarrativeGaps: string[];
  storySeeds: string[]; // bullet sub-items
}

export interface StorybankEntry {
  id: string; // S001, S002, etc.
  title: string;
  primarySkill: string;
  earnedSecret: string;
  strength: string; // "TBD" or numeric string
  lastUsed: string; // "—" or date
}

export interface StoryDetail {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  earnedSecret: string;
  deployFor: string;
  versionHistory: string;
}

export interface ScoreHistory {
  historicalSummary: string; // "None yet." or narrative text
  recentScores: ScoreEntry[];
}

export interface ScoreEntry {
  date: string;
  type: string;
  context: string;
  sub: string;
  str: string;
  rel: string;
  cred: string;
  diff: string;
  hireSignal: string;
  selfDelta: string;
}

export interface OutcomeEntry {
  date: string;
  company: string;
  role: string;
  round: string;
  result: string;
  notes: string;
}

export interface InterviewIntelligence {
  questionBank: QuestionBankEntry[];
  effectivePatterns: string[];
  ineffectivePatterns: string[];
  recruiterFeedback: RecruiterFeedbackEntry[];
  companyPatterns: CompanyPattern[];
  historicalSummary: string; // "None yet." or narrative
}

export interface QuestionBankEntry {
  date: string;
  company: string;
  role: string;
  roundType: string;
  question: string;
  competency: string;
  score: string;
  outcome: string;
}

export interface RecruiterFeedbackEntry {
  date: string;
  company: string;
  source: string;
  feedback: string;
  linkedDimension: string;
}

export interface CompanyPattern {
  company: string;
  bullets: string[]; // raw bullet lines, preserving keys/values
}

export interface DrillProgression {
  currentStage: string;
  gatesPassed: string; // raw bracket content e.g. "[]" or "[gate1, gate2]"
  revisitQueue: string; // raw bracket content
}

export interface InterviewLoop {
  companyName: string;
  fields: { key: string; value: string }[]; // ordered key-value pairs
}

export interface CoachingStrategy {
  fields: { key: string; value: string }[]; // ordered key-value pairs
}

export interface MetaCheckEntry {
  session: string;
  candidateFeedback: string;
  adjustmentMade: string;
}

export interface SessionLog {
  historicalSummary: string;
  recentSessions: SessionEntry[];
}

export interface SessionEntry {
  date: string;
  commandsRun: string;
  keyOutcomes: string;
}

export interface CoachingNote {
  raw: string; // full bullet line, e.g. "- 2026-02-26: text..."
}

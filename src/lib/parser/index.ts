import { CoachingState } from './types';
import { splitTopSections } from './utils';
import { parseProfile } from './sections/profile';
import { parseResume } from './sections/resume';
import { parseStorybankTable, parseStoryDetails } from './sections/storybank';
import { parseScoreHistory } from './sections/scores';
import { parseOutcomeLog } from './sections/outcomes';
import { parseInterviewIntelligence } from './sections/intelligence';
import { parseDrillProgression } from './sections/drills';
import { parseInterviewLoops } from './sections/loops';
import { parseCoachingStrategy } from './sections/strategy';
import { parseMetaCheckLog } from './sections/meta';
import { parseSessionLog } from './sections/sessions';
import { parseCoachingNotes } from './sections/notes';

export function parse(markdown: string): CoachingState {
  // Extract name from "# Coaching State — Name"
  const nameMatch = markdown.match(/^# Coaching State\s+[—–-]+\s+(.+)/m);
  const name = nameMatch ? nameMatch[1].trim() : '';

  // Extract last updated
  const lastUpdatedMatch = markdown.match(/^Last updated:\s*(.+)/m);
  const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : '';

  const sections = splitTopSections(markdown);

  const storybankText = sections.get('Storybank') ?? '';

  return {
    name,
    lastUpdated,
    profile: parseProfile(sections.get('Profile') ?? ''),
    resumeAnalysis: parseResume(sections.get('Resume Analysis') ?? ''),
    storybank: parseStorybankTable(storybankText),
    storyDetails: parseStoryDetails(storybankText),
    scoreHistory: parseScoreHistory(sections.get('Score History') ?? ''),
    outcomeLog: parseOutcomeLog(sections.get('Outcome Log') ?? ''),
    interviewIntelligence: parseInterviewIntelligence(sections.get('Interview Intelligence') ?? ''),
    drillProgression: parseDrillProgression(sections.get('Drill Progression') ?? ''),
    interviewLoops: parseInterviewLoops(sections.get('Interview Loops (active)') ?? ''),
    activeStrategy: parseCoachingStrategy(sections.get('Active Coaching Strategy') ?? ''),
    metaCheckLog: parseMetaCheckLog(sections.get('Meta-Check Log') ?? ''),
    sessionLog: parseSessionLog(sections.get('Session Log') ?? ''),
    coachingNotes: parseCoachingNotes(sections.get('Coaching Notes') ?? ''),
  };
}

export type { CoachingState } from './types';

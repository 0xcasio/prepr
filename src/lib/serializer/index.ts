import { CoachingState } from '../parser/types';
import { serializeProfile } from './sections/profile';
import { serializeResume } from './sections/resume';
import { serializeStorybankTable, serializeStoryDetails } from './sections/storybank';
import { serializeScoreHistory } from './sections/scores';
import { serializeOutcomeLog } from './sections/outcomes';
import { serializeInterviewIntelligence } from './sections/intelligence';
import { serializeDrillProgression } from './sections/drills';
import { serializeInterviewLoops } from './sections/loops';
import { serializeCoachingStrategy } from './sections/strategy';
import { serializeMetaCheckLog } from './sections/meta';
import { serializeSessionLog } from './sections/sessions';
import { serializeCoachingNotes } from './sections/notes';

export function serialize(state: CoachingState): string {
  const sections: string[] = [];

  sections.push(`# Coaching State — ${state.name}`);
  sections.push(`Last updated: ${state.lastUpdated}`);
  sections.push(`\n## Profile\n${serializeProfile(state.profile)}`);
  sections.push(`\n## Resume Analysis\n${serializeResume(state.resumeAnalysis)}`);

  const storybankTable = serializeStorybankTable(state.storybank);
  const storyDetails = serializeStoryDetails(state.storyDetails);
  sections.push(`\n## Storybank\n${storybankTable}\n\n${storyDetails}`);

  sections.push(`\n## Score History\n${serializeScoreHistory(state.scoreHistory)}`);
  sections.push(`\n## Outcome Log\n${serializeOutcomeLog(state.outcomeLog)}`);
  sections.push(`\n## Interview Intelligence\n\n${serializeInterviewIntelligence(state.interviewIntelligence)}`);
  sections.push(`\n## Drill Progression\n${serializeDrillProgression(state.drillProgression)}`);
  sections.push(`\n## Interview Loops (active)\n${serializeInterviewLoops(state.interviewLoops)}`);
  sections.push(`\n## Active Coaching Strategy\n${serializeCoachingStrategy(state.activeStrategy)}`);
  sections.push(`\n## Meta-Check Log\n${serializeMetaCheckLog(state.metaCheckLog)}`);
  sections.push(`\n## Session Log\n${serializeSessionLog(state.sessionLog)}`);
  sections.push(`\n## Coaching Notes\n${serializeCoachingNotes(state.coachingNotes)}`);

  return sections.join('\n') + '\n';
}

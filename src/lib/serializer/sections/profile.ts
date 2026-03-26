import { Profile } from '../../parser/types';

export function serializeProfile(profile: Profile): string {
  return [
    `- Target role(s): ${profile.targetRoles}`,
    `- Seniority band: ${profile.seniorityBand}`,
    `- Track: ${profile.track}`,
    `- Feedback directness: ${profile.feedbackDirectness}`,
    `- Interview timeline: ${profile.interviewTimeline}`,
    `- Time-aware coaching mode: ${profile.timeAwareMode}`,
    `- Interview history: ${profile.interviewHistory}`,
    `- Biggest concern: ${profile.biggestConcern}`,
    `- Known interview formats: ${profile.knownFormats}`,
  ].join('\n');
}

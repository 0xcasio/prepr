import { Profile } from '../types';
import { parseBulletList } from '../utils';

const KEY_MAP: Record<string, keyof Profile> = {
  'Target role(s)': 'targetRoles',
  'Seniority band': 'seniorityBand',
  'Track': 'track',
  'Feedback directness': 'feedbackDirectness',
  'Interview timeline': 'interviewTimeline',
  'Time-aware coaching mode': 'timeAwareMode',
  'Interview history': 'interviewHistory',
  'Biggest concern': 'biggestConcern',
  'Known interview formats': 'knownFormats',
};

export function parseProfile(text: string): Profile {
  const bullets = parseBulletList(text);
  const profile: Partial<Profile> = {};
  for (const { key, value } of bullets) {
    const field = KEY_MAP[key];
    if (field) (profile as Record<string, string>)[field] = value;
  }
  return {
    targetRoles: profile.targetRoles ?? '',
    seniorityBand: profile.seniorityBand ?? '',
    track: profile.track ?? '',
    feedbackDirectness: profile.feedbackDirectness ?? '',
    interviewTimeline: profile.interviewTimeline ?? '',
    timeAwareMode: profile.timeAwareMode ?? '',
    interviewHistory: profile.interviewHistory ?? '',
    biggestConcern: profile.biggestConcern ?? '',
    knownFormats: profile.knownFormats ?? '',
  };
}

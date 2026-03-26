import { CoachingNote } from '../types';

export function parseCoachingNotes(text: string): CoachingNote[] {
  return text
    .split('\n')
    .filter(l => l.trimStart().startsWith('- '))
    .map(l => ({ raw: l.trimEnd() }));
}

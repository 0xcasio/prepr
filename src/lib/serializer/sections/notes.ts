import { CoachingNote } from '../../parser/types';

export function serializeCoachingNotes(notes: CoachingNote[]): string {
  return notes.map(n => n.raw).join('\n');
}

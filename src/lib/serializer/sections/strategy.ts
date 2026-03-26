import { CoachingStrategy } from '../../parser/types';

export function serializeCoachingStrategy(s: CoachingStrategy): string {
  return s.fields.map(f => `- ${f.key}: ${f.value}`).join('\n');
}

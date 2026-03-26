import { CoachingStrategy } from '../types';

export function parseCoachingStrategy(text: string): CoachingStrategy {
  const lines = text.split('\n');
  const fields: { key: string; value: string }[] = [];
  let current: { key: string; value: string } | null = null;

  for (const line of lines) {
    if (line.trim() === '') {
      if (current) {
        fields.push(current);
        current = null;
      }
      continue;
    }

    const topMatch = line.match(/^- (.+?):\s*(.*)/);
    if (topMatch && !line.startsWith('  ')) {
      if (current) fields.push(current);
      current = { key: topMatch[1], value: topMatch[2] };
      continue;
    }

    if (current && line.startsWith('  ')) {
      current.value = current.value
        ? current.value + '\n' + line.trimEnd()
        : line.trimEnd();
      continue;
    }

    if (current) {
      current.value = current.value
        ? current.value + '\n' + line.trimEnd()
        : line.trimEnd();
    }
  }
  if (current) fields.push(current);

  return { fields };
}

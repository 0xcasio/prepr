import { StorybankEntry, StoryDetail } from '../../parser/types';
import { serializeMarkdownTable } from '../utils';

export function serializeStorybankTable(entries: StorybankEntry[]): string {
  const headers = ['ID', 'Title', 'Primary Skill', 'Earned Secret', 'Strength', 'Last Used'];
  const rows = entries.map(e => [e.id, e.title, e.primarySkill, e.earnedSecret, e.strength, e.lastUsed]);
  return serializeMarkdownTable(headers, rows);
}

export function serializeStoryDetails(details: StoryDetail[]): string {
  if (details.length === 0) return '';

  const parts = details.map(d => {
    return [
      `#### ${d.id} — ${d.title}`,
      `- Situation: ${d.situation}`,
      `- Task: ${d.task}`,
      `- Action: ${d.action}`,
      `- Result: ${d.result}`,
      `- Earned Secret: ${d.earnedSecret}`,
      `- Deploy for: ${d.deployFor}`,
      `- Version history: ${d.versionHistory}`,
    ].join('\n');
  });

  return '### Story Details\n' + parts.join('\n\n');
}

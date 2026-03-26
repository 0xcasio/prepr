import { OutcomeEntry } from '../types';
import { parseMarkdownTable } from '../utils';

export function parseOutcomeLog(text: string): OutcomeEntry[] {
  const rows = parseMarkdownTable(text);
  return rows.map(r => ({
    date: r['Date'] ?? '',
    company: r['Company'] ?? '',
    role: r['Role'] ?? '',
    round: r['Round'] ?? '',
    result: r['Result'] ?? '',
    notes: r['Notes'] ?? '',
  }));
}

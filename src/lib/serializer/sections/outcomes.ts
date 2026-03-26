import { OutcomeEntry } from '../../parser/types';
import { serializeMarkdownTable } from '../utils';

export function serializeOutcomeLog(entries: OutcomeEntry[]): string {
  const headers = ['Date', 'Company', 'Role', 'Round', 'Result', 'Notes'];
  const rows = entries.map(e => [e.date, e.company, e.role, e.round, e.result, e.notes]);
  return serializeMarkdownTable(headers, rows);
}

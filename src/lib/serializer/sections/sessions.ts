import { SessionLog } from '../../parser/types';
import { serializeMarkdownTable } from '../utils';

export function serializeSessionLog(s: SessionLog): string {
  const headers = ['Date', 'Commands Run', 'Key Outcomes'];
  const rows = s.recentSessions.map(e => [e.date, e.commandsRun, e.keyOutcomes]);
  const table = serializeMarkdownTable(headers, rows);

  return [
    `### Historical Summary`,
    s.historicalSummary || 'None.',
    `\n### Recent Sessions`,
    table,
  ].join('\n');
}

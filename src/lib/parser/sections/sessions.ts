import { SessionLog, SessionEntry } from '../types';
import { splitSubsections, parseMarkdownTable } from '../utils';

export function parseSessionLog(text: string): SessionLog {
  const subsections = splitSubsections(text);

  let historicalSummary = '';
  let recentSessions: SessionEntry[] = [];

  for (const { title, body } of subsections) {
    if (title === 'Historical Summary') {
      historicalSummary = body.trim();
    } else if (title === 'Recent Sessions') {
      const rows = parseMarkdownTable(body);
      recentSessions = rows.map(r => ({
        date: r['Date'] ?? '',
        commandsRun: r['Commands Run'] ?? '',
        keyOutcomes: r['Key Outcomes'] ?? '',
      }));
    }
  }

  return { historicalSummary, recentSessions };
}

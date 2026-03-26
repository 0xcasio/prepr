import { ScoreHistory } from '../../parser/types';
import { serializeMarkdownTable } from '../utils';

export function serializeScoreHistory(h: ScoreHistory): string {
  const headers = ['Date', 'Type', 'Context', 'Sub', 'Str', 'Rel', 'Cred', 'Diff', 'Hire Signal', 'Self-Δ'];
  const rows = h.recentScores.map(s => [
    s.date, s.type, s.context, s.sub, s.str, s.rel, s.cred, s.diff, s.hireSignal, s.selfDelta,
  ]);
  const table = serializeMarkdownTable(headers, rows);

  return [
    `### Historical Summary`,
    h.historicalSummary || 'None yet.',
    `\n### Recent Scores`,
    table,
  ].join('\n');
}

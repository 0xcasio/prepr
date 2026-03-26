import { ScoreHistory, ScoreEntry } from '../types';
import { splitSubsections, parseMarkdownTable } from '../utils';

export function parseScoreHistory(text: string): ScoreHistory {
  const subsections = splitSubsections(text);

  let historicalSummary = '';
  let recentScores: ScoreEntry[] = [];

  for (const { title, body } of subsections) {
    if (title === 'Historical Summary') {
      historicalSummary = body.trim();
    } else if (title === 'Recent Scores') {
      const rows = parseMarkdownTable(body);
      recentScores = rows.map(r => ({
        date: r['Date'] ?? '',
        type: r['Type'] ?? '',
        context: r['Context'] ?? '',
        sub: r['Sub'] ?? '',
        str: r['Str'] ?? '',
        rel: r['Rel'] ?? '',
        cred: r['Cred'] ?? '',
        diff: r['Diff'] ?? '',
        hireSignal: r['Hire Signal'] ?? '',
        selfDelta: r['Self-Δ'] ?? '',
      }));
    }
  }

  return { historicalSummary, recentScores };
}

import { describe, it, expect } from 'vitest';
import { parseScoreHistory } from '../../src/lib/parser/sections/scores';

const SAMPLE = `### Historical Summary
Some prior history narrative.

### Recent Scores
| Date | Type | Context | Sub | Str | Rel | Cred | Diff | Hire Signal | Self-Δ |
|------|------|---------|-----|-----|-----|------|------|-------------|--------|
| 2026-02-26 | practice | Background walkthrough | 3 | 3 | 3 | 3 | 3.5 | — | accurate |
| 2026-03-05 | interview | GGP R2 | 4 | 4 | 4 | 4 | 4 | Hire | over |
`;

describe('parseScoreHistory', () => {
  it('parses historical summary', () => {
    const h = parseScoreHistory(SAMPLE);
    expect(h.historicalSummary).toBe('Some prior history narrative.');
  });

  it('parses recent scores table', () => {
    const h = parseScoreHistory(SAMPLE);
    expect(h.recentScores).toHaveLength(2);
    expect(h.recentScores[0].date).toBe('2026-02-26');
    expect(h.recentScores[0].type).toBe('practice');
    expect(h.recentScores[0].diff).toBe('3.5');
    expect(h.recentScores[0].selfDelta).toBe('accurate');
    expect(h.recentScores[1].hireSignal).toBe('Hire');
  });

  it('handles empty summary', () => {
    const h = parseScoreHistory('### Historical Summary\nNone yet.\n\n### Recent Scores\n| Date | Type | Context | Sub | Str | Rel | Cred | Diff | Hire Signal | Self-Δ |\n|------|------|---------|-----|-----|-----|------|------|-------------|--------|\n');
    expect(h.historicalSummary).toBe('None yet.');
    expect(h.recentScores).toHaveLength(0);
  });
});

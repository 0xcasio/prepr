import { MetaCheckEntry } from '../types';
import { parseMarkdownTable } from '../utils';

export function parseMetaCheckLog(text: string): MetaCheckEntry[] {
  const rows = parseMarkdownTable(text);
  return rows.map(r => ({
    session: r['Session'] ?? '',
    candidateFeedback: r['Candidate Feedback'] ?? '',
    adjustmentMade: r['Adjustment Made'] ?? '',
  }));
}

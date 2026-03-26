import { MetaCheckEntry } from '../../parser/types';
import { serializeMarkdownTable } from '../utils';

export function serializeMetaCheckLog(entries: MetaCheckEntry[]): string {
  const headers = ['Session', 'Candidate Feedback', 'Adjustment Made'];
  const rows = entries.map(e => [e.session, e.candidateFeedback, e.adjustmentMade]);
  return serializeMarkdownTable(headers, rows);
}

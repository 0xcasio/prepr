/**
 * Shared helpers for pipeline components.
 * Centralizes field access and status categorization so
 * KanbanBoard, CompanyCard, and CompanyDetail all use the same logic.
 */
import type { InterviewLoop } from './parser/types';

/** Extract a field value from a loop's key-value fields. */
export function field(loop: InterviewLoop, key: string): string {
  return (
    loop.fields.find((f) => f.key.toLowerCase().includes(key.toLowerCase()))
      ?.value ?? ''
  );
}

/** Pipeline columns in display order. */
export const PIPELINE_COLUMNS = [
  'Researched',
  'Applied',
  'Interviewing',
  'Offer',
  'Closed',
] as const;

export type PipelineColumn = (typeof PIPELINE_COLUMNS)[number];

/** Normalize a raw status string to a pipeline column. */
export function statusCategory(raw: string): PipelineColumn {
  const lower = raw.toLowerCase();
  if (
    lower.includes('closed') ||
    lower.includes('rejected') ||
    lower.includes('paused')
  )
    return 'Closed';
  if (lower.includes('offer')) return 'Offer';
  if (
    lower.includes('interviewing') ||
    lower.includes('pending') ||
    lower.includes('assessment')
  )
    return 'Interviewing';
  if (lower.includes('applied')) return 'Applied';
  if (lower.includes('researched')) return 'Researched';
  return 'Interviewing'; // default for active loops
}

/** Determine the fit level from a loop's fit assessment field. */
export function getFit(
  loop: InterviewLoop
): 'strong' | 'moderate' | 'weak' | null {
  const fit = field(loop, 'fit assessment').toLowerCase();
  // Check moderate before strong — "moderate-strong" should map to moderate
  if (fit.includes('moderate')) return 'moderate';
  if (fit.includes('strong')) return 'strong';
  if (fit.includes('weak')) return 'weak';
  return null;
}

/** Check if a loop is closed. */
export function isClosed(loop: InterviewLoop): boolean {
  const status = field(loop, 'status').toLowerCase();
  return (
    status.includes('closed') ||
    status.includes('rejected') ||
    status.includes('paused')
  );
}

/** Get first letter for company avatar. */
export function companyInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/** Parse rounds completed to get count. */
export function roundsCompleted(loop: InterviewLoop): number {
  const rounds = field(loop, 'rounds completed');
  if (!rounds || rounds === '[]') return 0;
  // Count items separated by ], [ pattern or commas within brackets
  const matches = rounds.match(/\[([^\]]*)\]/);
  if (!matches) return 0;
  const content = matches[1];
  if (!content.trim()) return 0;
  // Split by ], [ for multi-round entries or count semicolons + 1
  return rounds.split(/\],\s*\[|;\s*/).length;
}

/** Estimate total rounds from round formats. */
export function totalRounds(loop: InterviewLoop): number | null {
  const formats = field(loop, 'round formats');
  if (!formats) return null;
  const roundLines = formats.match(/Round \d+/gi);
  return roundLines ? roundLines.length : null;
}

/** Shorten a long next-round string for display. */
export function shortenAction(raw: string): string {
  const shortened = raw.split(' — ')[0].split('. ')[0];
  return shortened.length > 60 ? shortened.slice(0, 57) + '...' : shortened;
}

/** Group loops into pipeline columns. */
export function groupByColumn(
  loops: InterviewLoop[]
): Record<PipelineColumn, InterviewLoop[]> {
  const groups: Record<PipelineColumn, InterviewLoop[]> = {
    Researched: [],
    Applied: [],
    Interviewing: [],
    Offer: [],
    Closed: [],
  };

  for (const loop of loops) {
    const status = field(loop, 'status');
    const column = statusCategory(status);
    groups[column].push(loop);
  }

  return groups;
}

/**
 * Derived computations from CoachingState.
 * Computed in the browser — not stored in coaching_state.md.
 */
import type { CoachingState, ScoreEntry, InterviewLoop } from './parser/types';

// ── Score Computations ───────────────────────────────────────────────────────

/** Parse a score string (e.g., "3.5") to a number, or NaN if invalid/empty. */
function parseScore(val: string): number {
  if (!val || val === '—' || val === 'TBD') return NaN;
  const n = parseFloat(val);
  return n;
}

/** Compute the average of the 5 dimension scores for a single entry. */
export function sessionAverage(entry: ScoreEntry): number {
  const scores = [entry.sub, entry.str, entry.rel, entry.cred, entry.diff].map(parseScore);
  const valid = scores.filter((s) => !isNaN(s) && s > 0);
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

/** Compute per-dimension averages across all recent scores. */
export function dimensionAverages(scores: ScoreEntry[]): {
  substance: number;
  structure: number;
  relevance: number;
  credibility: number;
  differentiation: number;
} {
  if (scores.length === 0) {
    return { substance: 0, structure: 0, relevance: 0, credibility: 0, differentiation: 0 };
  }

  const dims = { sub: [] as number[], str: [] as number[], rel: [] as number[], cred: [] as number[], diff: [] as number[] };

  for (const s of scores) {
    const sub = parseScore(s.sub); if (!isNaN(sub)) dims.sub.push(sub);
    const str = parseScore(s.str); if (!isNaN(str)) dims.str.push(str);
    const rel = parseScore(s.rel); if (!isNaN(rel)) dims.rel.push(rel);
    const cred = parseScore(s.cred); if (!isNaN(cred)) dims.cred.push(cred);
    const diff = parseScore(s.diff); if (!isNaN(diff)) dims.diff.push(diff);
  }

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    substance: avg(dims.sub),
    structure: avg(dims.str),
    relevance: avg(dims.rel),
    credibility: avg(dims.cred),
    differentiation: avg(dims.diff),
  };
}

/** Compute the composite average across all sessions. */
export function compositeAverage(scores: ScoreEntry[]): number {
  if (scores.length === 0) return 0;
  const avgs = scores.map(sessionAverage);
  return avgs.reduce((a, b) => a + b, 0) / avgs.length;
}

/**
 * Growth delta: difference between current avg and avg from ~30 days ago.
 * Positive = improving.
 */
export function growthDelta(scores: ScoreEntry[]): number | null {
  if (scores.length < 2) return null;

  const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.slice(-3); // last 3 sessions
  const earliest = sorted.slice(0, 3); // first 3 sessions

  const latestAvg = latest.map(sessionAverage).reduce((a, b) => a + b, 0) / latest.length;
  const earliestAvg = earliest.map(sessionAverage).reduce((a, b) => a + b, 0) / earliest.length;

  return latestAvg - earliestAvg;
}

/**
 * Score trend direction: up, down, or flat.
 * Based on the last 5 session averages.
 */
export function scoreTrend(scores: ScoreEntry[]): 'up' | 'down' | 'flat' {
  if (scores.length < 3) return 'flat';

  const recent = scores.slice(-5).map(sessionAverage);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const delta = last - first;

  if (delta > 0.3) return 'up';
  if (delta < -0.3) return 'down';
  return 'flat';
}

// ── Pipeline Computations ────────────────────────────────────────────────────

/** Helper to get a field value from a loop's fields array. */
function loopField(loop: InterviewLoop, key: string): string {
  return loop.fields.find((f) => f.key.toLowerCase().includes(key.toLowerCase()))?.value ?? '';
}

/** Count interview loops by status category. */
export function pipelineStatusCounts(loops: InterviewLoop[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const loop of loops) {
    const status = loopField(loop, 'status');
    const category = statusCategory(status);
    counts[category] = (counts[category] ?? 0) + 1;
  }
  return counts;
}

/** Normalize a raw status string to a pipeline column. */
function statusCategory(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('closed') || lower.includes('rejected') || lower.includes('paused'))
    return 'Closed';
  if (lower.includes('offer')) return 'Offer';
  if (lower.includes('interviewing') || lower.includes('pending')) return 'Interviewing';
  if (lower.includes('applied')) return 'Applied';
  if (lower.includes('researched')) return 'Researched';
  return 'Interviewing'; // default for active loops
}

export interface UpcomingAction {
  company: string;
  action: string;
  date: string | null;
  type: 'interview' | 'assessment' | 'decision' | 'other';
}

/**
 * Extract upcoming actions from all active (non-closed) loops, sorted by date.
 * Pulls from "Next round" fields.
 */
export function upcomingActions(loops: InterviewLoop[]): UpcomingAction[] {
  const actions: UpcomingAction[] = [];

  for (const loop of loops) {
    const status = loopField(loop, 'status');
    if (status.toLowerCase().includes('closed')) continue;

    const nextRound = loopField(loop, 'next round');
    if (!nextRound || nextRound === 'TBD' || nextRound === '—') continue;

    // Try to extract a date from the nextRound text
    const dateMatch = nextRound.match(/\d{4}-\d{2}-\d{2}/);
    const date = dateMatch ? dateMatch[0] : null;

    // Detect action type from text
    let type: UpcomingAction['type'] = 'other';
    const lower = nextRound.toLowerCase();
    if (lower.includes('assessment') || lower.includes('vervoe') || lower.includes('ccat'))
      type = 'assessment';
    else if (lower.includes('interview') || lower.includes('call') || lower.includes('round'))
      type = 'interview';
    else if (lower.includes('offer') || lower.includes('decision') || lower.includes('awaiting'))
      type = 'decision';

    actions.push({
      company: loop.companyName,
      action: nextRound,
      date,
      type,
    });
  }

  // Sort by date (nulls last)
  return actions.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
}

// ── Storybank Computations ───────────────────────────────────────────────────

export interface StoryDevelopmentStatus {
  id: string;
  title: string;
  isDeveloped: boolean;
}

/**
 * Determine which stories are "developed" (have full STAR + earned secret)
 * vs. "needs work".
 */
export function storyDevelopmentStatuses(state: CoachingState): StoryDevelopmentStatus[] {
  return state.storybank.map((entry) => {
    const detail = state.storyDetails.find((d) => d.id === entry.id);
    const isDeveloped =
      !!detail &&
      detail.situation.length > 10 &&
      detail.task.length > 10 &&
      detail.action.length > 10 &&
      detail.result.length > 10 &&
      detail.earnedSecret !== 'TBD' &&
      detail.earnedSecret.length > 5;

    return { id: entry.id, title: entry.title, isDeveloped };
  });
}

/**
 * Identify competency gaps: competencies appearing in the Question Bank
 * that aren't covered by any story's primary skill.
 */
export function competencyGaps(state: CoachingState): string[] {
  const coveredSkills = new Set(
    state.storybank.map((s) => s.primarySkill.toLowerCase().trim())
  );

  const questionCompetencies = new Set(
    state.interviewIntelligence.questionBank
      .map((q) => q.competency.toLowerCase().trim())
      .filter((c) => c && c !== '—')
  );

  return [...questionCompetencies].filter(
    (comp) => ![...coveredSkills].some((skill) => skill.includes(comp) || comp.includes(skill))
  );
}

// ── Self-Calibration ─────────────────────────────────────────────────────────

export interface CalibrationSummary {
  overCount: number;
  underCount: number;
  accurateCount: number;
  tendency: 'over-rater' | 'under-rater' | 'well-calibrated';
}

/** Summarize self-calibration tendency from Score History self-delta values. */
export function selfCalibrationSummary(scores: ScoreEntry[]): CalibrationSummary {
  let overCount = 0;
  let underCount = 0;
  let accurateCount = 0;

  for (const s of scores) {
    const delta = s.selfDelta.toLowerCase();
    if (delta.includes('over')) overCount++;
    else if (delta.includes('under')) underCount++;
    else if (delta.includes('accurate')) accurateCount++;
  }

  const total = overCount + underCount + accurateCount;
  let tendency: CalibrationSummary['tendency'] = 'well-calibrated';
  if (total > 0) {
    if (overCount / total > 0.5) tendency = 'over-rater';
    else if (underCount / total > 0.5) tendency = 'under-rater';
  }

  return { overCount, underCount, accurateCount, tendency };
}

// ── Composite Hire Signal ────────────────────────────────────────────────────

/**
 * Determine the composite hire signal from recent scores.
 * Takes the mode (most frequent) of the last 5 hire signal values.
 */
export function compositeHireSignal(
  scores: ScoreEntry[]
): 'Strong Hire' | 'Hire' | 'Mixed' | 'No Hire' | null {
  const recent = scores
    .slice(-5)
    .map((s) => s.hireSignal.trim())
    .filter((s) => s && s !== '—');

  if (recent.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const signal of recent) {
    counts[signal] = (counts[signal] ?? 0) + 1;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] as 'Strong Hire' | 'Hire' | 'Mixed' | 'No Hire';
}

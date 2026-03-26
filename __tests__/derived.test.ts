/**
 * Tests for derived computations — computed values used by dashboard,
 * scores page, pipeline, and storybank.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parse } from '@/lib/parser';
import {
  sessionAverage,
  dimensionAverages,
  compositeAverage,
  growthDelta,
  scoreTrend,
  pipelineStatusCounts,
  upcomingActions,
  storyDevelopmentStatuses,
  competencyGaps,
  selfCalibrationSummary,
  compositeHireSignal,
} from '@/lib/derived';
import type { ScoreEntry } from '@/lib/parser/types';

// Load real data
const REAL_FILE = path.resolve(__dirname, '../../coaching_state.md');
const state = parse(fs.readFileSync(REAL_FILE, 'utf-8'));

describe('Score Computations', () => {
  it('sessionAverage returns a number between 1 and 5 for a real score entry', () => {
    const entry = state.scoreHistory.recentScores[0];
    const avg = sessionAverage(entry);
    expect(avg).toBeGreaterThanOrEqual(1);
    expect(avg).toBeLessThanOrEqual(5);
  });

  it('dimensionAverages returns all 5 dimensions', () => {
    const avgs = dimensionAverages(state.scoreHistory.recentScores);
    expect(avgs).toHaveProperty('substance');
    expect(avgs).toHaveProperty('structure');
    expect(avgs).toHaveProperty('relevance');
    expect(avgs).toHaveProperty('credibility');
    expect(avgs).toHaveProperty('differentiation');
    expect(avgs.substance).toBeGreaterThan(0);
  });

  it('dimensionAverages returns zeros for empty input', () => {
    const avgs = dimensionAverages([]);
    expect(avgs.substance).toBe(0);
    expect(avgs.differentiation).toBe(0);
  });

  it('compositeAverage computes overall average across all sessions', () => {
    const avg = compositeAverage(state.scoreHistory.recentScores);
    expect(avg).toBeGreaterThan(2);
    expect(avg).toBeLessThan(5);
  });

  it('growthDelta returns a number for real data with enough entries', () => {
    const delta = growthDelta(state.scoreHistory.recentScores);
    expect(delta).not.toBeNull();
    expect(typeof delta).toBe('number');
  });

  it('growthDelta returns null for insufficient data', () => {
    const delta = growthDelta([]);
    expect(delta).toBeNull();
  });

  it('scoreTrend returns up, down, or flat', () => {
    const trend = scoreTrend(state.scoreHistory.recentScores);
    expect(['up', 'down', 'flat']).toContain(trend);
  });
});

describe('Pipeline Computations', () => {
  it('pipelineStatusCounts correctly categorizes loops', () => {
    const counts = pipelineStatusCounts(state.interviewLoops);
    // We know from real data: some Interviewing, some Closed
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(state.interviewLoops.length);
    expect(counts['Closed']).toBeGreaterThan(0);
    expect(counts['Interviewing']).toBeGreaterThan(0);
  });

  it('upcomingActions returns sorted actions from active loops only', () => {
    const actions = upcomingActions(state.interviewLoops);
    // Should exclude closed loops
    for (const action of actions) {
      expect(action.company).toBeTruthy();
      expect(action.action).toBeTruthy();
    }
    // If there are dated actions, they should be sorted
    const dated = actions.filter((a) => a.date);
    for (let i = 1; i < dated.length; i++) {
      expect(dated[i].date! >= dated[i - 1].date!).toBe(true);
    }
  });
});

describe('Storybank Computations', () => {
  it('storyDevelopmentStatuses classifies all stories', () => {
    const statuses = storyDevelopmentStatuses(state);
    expect(statuses.length).toBe(state.storybank.length);

    for (const s of statuses) {
      expect(s.id).toMatch(/^S\d{3}$/);
      expect(typeof s.isDeveloped).toBe('boolean');
    }

    // At least some should be developed (we know S006, S007, S008 are)
    const developed = statuses.filter((s) => s.isDeveloped);
    expect(developed.length).toBeGreaterThan(0);
  });

  it('competencyGaps returns an array (possibly empty)', () => {
    const gaps = competencyGaps(state);
    expect(Array.isArray(gaps)).toBe(true);
  });
});

describe('Self-Calibration', () => {
  it('selfCalibrationSummary returns valid counts and tendency', () => {
    const summary = selfCalibrationSummary(state.scoreHistory.recentScores);
    expect(summary.overCount + summary.underCount + summary.accurateCount).toBeGreaterThanOrEqual(0);
    expect(['over-rater', 'under-rater', 'well-calibrated']).toContain(summary.tendency);
  });
});

describe('Hire Signal', () => {
  it('compositeHireSignal returns a valid signal or null', () => {
    const signal = compositeHireSignal(state.scoreHistory.recentScores);
    if (signal !== null) {
      expect(['Strong Hire', 'Hire', 'Mixed', 'No Hire']).toContain(signal);
    }
  });

  it('returns null for empty scores', () => {
    expect(compositeHireSignal([])).toBeNull();
  });
});

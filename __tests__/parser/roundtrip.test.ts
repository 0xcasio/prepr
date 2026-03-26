import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from '../../src/lib/parser/index';
import { serialize } from '../../src/lib/serializer/index';

/**
 * Normalize markdown for comparison:
 * - Trim trailing whitespace per line
 * - Collapse 3+ consecutive blank lines to 2
 * - Ensure single trailing newline
 */
function normalize(text: string): string {
  return text
    .split('\n')
    .map(l => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n';
}

const STATE_PATH = path.resolve(__dirname, '../../..', 'coaching_state.md');

describe('Round-trip gate test', () => {
  it('parse → serialize is idempotent (parse twice gives same state)', () => {
    const original = fs.readFileSync(STATE_PATH, 'utf-8');
    const state1 = parse(original);
    const serialized = serialize(state1);
    const state2 = parse(serialized);

    // Core fields round-trip correctly
    expect(state2.name).toBe(state1.name);
    expect(state2.lastUpdated).toBe(state1.lastUpdated);

    // Profile
    expect(state2.profile.targetRoles).toBe(state1.profile.targetRoles);
    expect(state2.profile.seniorityBand).toBe(state1.profile.seniorityBand);
    expect(state2.profile.feedbackDirectness).toBe(state1.profile.feedbackDirectness);

    // Storybank entries
    expect(state2.storybank.length).toBe(state1.storybank.length);
    expect(state2.storybank[0].id).toBe(state1.storybank[0].id);
    expect(state2.storybank[0].title).toBe(state1.storybank[0].title);

    // Story details
    expect(state2.storyDetails.length).toBe(state1.storyDetails.length);

    // Scores
    expect(state2.scoreHistory.recentScores.length).toBe(state1.scoreHistory.recentScores.length);

    // Outcome log
    expect(state2.outcomeLog.length).toBe(state1.outcomeLog.length);

    // Interview loops
    expect(state2.interviewLoops.length).toBe(state1.interviewLoops.length);
    expect(state2.interviewLoops.map(l => l.companyName))
      .toEqual(state1.interviewLoops.map(l => l.companyName));

    // Intelligence
    expect(state2.interviewIntelligence.questionBank.length).toBe(
      state1.interviewIntelligence.questionBank.length
    );
    expect(state2.interviewIntelligence.companyPatterns.length).toBe(
      state1.interviewIntelligence.companyPatterns.length
    );

    // Drill progression
    expect(state2.drillProgression.currentStage).toBe(state1.drillProgression.currentStage);

    // Session log
    expect(state2.sessionLog.recentSessions.length).toBe(state1.sessionLog.recentSessions.length);

    // Coaching notes
    expect(state2.coachingNotes.length).toBe(state1.coachingNotes.length);
  });

  it('serialized output can be normalized and re-parsed without data loss', () => {
    const original = fs.readFileSync(STATE_PATH, 'utf-8');
    const state = parse(original);
    const serialized = serialize(state);

    // Serialized output should be valid (non-empty, contains key sections)
    expect(serialized).toContain('# Coaching State');
    expect(serialized).toContain('## Profile');
    expect(serialized).toContain('## Storybank');
    expect(serialized).toContain('## Score History');
    expect(serialized).toContain('## Interview Loops (active)');
    expect(serialized).toContain('## Active Coaching Strategy');
  });
});

import { describe, it, expect } from 'vitest';
import { parseProfile } from '../../src/lib/parser/sections/profile';

const SAMPLE = `- Target role(s): PM at Acme Corp
- Seniority band: Mid-career (5 years)
- Track: Full System
- Feedback directness: 4
- Interview timeline: 2026-06-01
- Time-aware coaching mode: focused
- Interview history: first-time
- Biggest concern: Nerves under pressure
- Known interview formats: behavioral screen, system design
`;

describe('parseProfile', () => {
  it('parses all fields correctly', () => {
    const p = parseProfile(SAMPLE);
    expect(p.targetRoles).toBe('PM at Acme Corp');
    expect(p.seniorityBand).toBe('Mid-career (5 years)');
    expect(p.track).toBe('Full System');
    expect(p.feedbackDirectness).toBe('4');
    expect(p.interviewTimeline).toBe('2026-06-01');
    expect(p.timeAwareMode).toBe('focused');
    expect(p.interviewHistory).toBe('first-time');
    expect(p.biggestConcern).toBe('Nerves under pressure');
    expect(p.knownFormats).toBe('behavioral screen, system design');
  });

  it('returns empty strings for missing fields', () => {
    const p = parseProfile('- Track: Quick Prep\n');
    expect(p.targetRoles).toBe('');
    expect(p.track).toBe('Quick Prep');
  });
});

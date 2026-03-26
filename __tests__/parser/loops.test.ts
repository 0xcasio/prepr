import { describe, it, expect } from 'vitest';
import { parseInterviewLoops } from '../../src/lib/parser/sections/loops';

const SAMPLE = `### Acme Corp
- Status: Interviewing
- Rounds completed: [R1 — done 2026-03-01]
- Round formats:
  - Round 1: HR screen, 30 min
  - Round 2: HM interview, 45 min
- Stories used: [S001, S007]
- Next round: 2026-04-01

### Beta Inc
- Status: Closed (rejected)
- Rounds completed: [R1]
`;

describe('parseInterviewLoops', () => {
  it('parses multiple companies', () => {
    const loops = parseInterviewLoops(SAMPLE);
    expect(loops).toHaveLength(2);
    expect(loops[0].companyName).toBe('Acme Corp');
    expect(loops[1].companyName).toBe('Beta Inc');
  });

  it('parses simple fields', () => {
    const loops = parseInterviewLoops(SAMPLE);
    const status = loops[0].fields.find(f => f.key === 'Status');
    expect(status?.value).toBe('Interviewing');
  });

  it('parses multi-line fields (round formats)', () => {
    const loops = parseInterviewLoops(SAMPLE);
    const formats = loops[0].fields.find(f => f.key === 'Round formats');
    expect(formats?.value).toContain('Round 1');
    expect(formats?.value).toContain('Round 2');
  });

  it('returns empty array for empty text', () => {
    expect(parseInterviewLoops('')).toHaveLength(0);
  });
});

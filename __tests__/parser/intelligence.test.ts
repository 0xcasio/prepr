import { describe, it, expect } from 'vitest';
import { parseInterviewIntelligence } from '../../src/lib/parser/sections/intelligence';

const SAMPLE = `
### Question Bank
| Date | Company | Role | Round Type | Question | Competency | Score | Outcome |
| 2026-02-26 | Acme | PM | behavioral | Tell me about yourself | Positioning | recall-only | pending |

### Effective Patterns (what works for this candidate)
- 2026-03-01: Technical specificity scores 4 on Differentiation

### Ineffective Patterns (what keeps not working)
- 2026-02-28: Clean success stories miss friction beat

### Recruiter/Interviewer Feedback
| Date | Company | Source | Feedback | Linked Dimension |
| 2026-02-26 | Acme | recruiter | Looking for impact | Ownership |

### Company Patterns
#### Acme Corp
- Questions observed: background, impact
- What seems to matter: execution depth

### Historical Intelligence Summary
None yet.
`;

describe('parseInterviewIntelligence', () => {
  it('parses question bank', () => {
    const intel = parseInterviewIntelligence(SAMPLE);
    expect(intel.questionBank).toHaveLength(1);
    expect(intel.questionBank[0].company).toBe('Acme');
    expect(intel.questionBank[0].roundType).toBe('behavioral');
    expect(intel.questionBank[0].score).toBe('recall-only');
  });

  it('parses effective patterns', () => {
    const intel = parseInterviewIntelligence(SAMPLE);
    expect(intel.effectivePatterns).toHaveLength(1);
    expect(intel.effectivePatterns[0]).toContain('Technical specificity');
  });

  it('parses ineffective patterns', () => {
    const intel = parseInterviewIntelligence(SAMPLE);
    expect(intel.ineffectivePatterns).toHaveLength(1);
  });

  it('parses recruiter feedback', () => {
    const intel = parseInterviewIntelligence(SAMPLE);
    expect(intel.recruiterFeedback).toHaveLength(1);
    expect(intel.recruiterFeedback[0].source).toBe('recruiter');
  });

  it('parses company patterns', () => {
    const intel = parseInterviewIntelligence(SAMPLE);
    expect(intel.companyPatterns).toHaveLength(1);
    expect(intel.companyPatterns[0].company).toBe('Acme Corp');
    expect(intel.companyPatterns[0].bullets.length).toBeGreaterThan(0);
  });

  it('parses historical summary', () => {
    const intel = parseInterviewIntelligence(SAMPLE);
    expect(intel.historicalSummary).toBe('None yet.');
  });
});

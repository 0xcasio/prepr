import { describe, it, expect } from 'vitest';
import { parseStorybankTable, parseStoryDetails } from '../../src/lib/parser/sections/storybank';

const TABLE = `| ID | Title | Primary Skill | Earned Secret | Strength | Last Used |
|----|-------|---------------|---------------|----------|-----------|
| S001 | Bold SEO | Growth | TBD | TBD | — |
| S002 | Analytics | Data | Some secret | 4 | 2026-03-01 |
`;

const DETAILS = `Some intro text

### Story Details
#### S001 — Bold SEO Story
- Situation: At Bold
- Task: Drive growth
- Action: Led redesign
- Result: 20% CVR increase
- Earned Secret: TBD
- Deploy for: Growth questions
- Version history: 2026-02-26 — initial

#### S002 — Analytics Platform
- Situation: At Stryke
- Task: Build analytics
- Action: Built platform
- Result: Improved efficiency
- Earned Secret: PM who builds
- Deploy for: Data questions
- Version history: 2026-02-26 — initial
`;

describe('parseStorybankTable', () => {
  it('parses table rows correctly', () => {
    const entries = parseStorybankTable(TABLE);
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe('S001');
    expect(entries[0].title).toBe('Bold SEO');
    expect(entries[0].earnedSecret).toBe('TBD');
    expect(entries[1].strength).toBe('4');
    expect(entries[1].lastUsed).toBe('2026-03-01');
  });
});

describe('parseStoryDetails', () => {
  it('parses story detail sections', () => {
    const details = parseStoryDetails(DETAILS);
    expect(details).toHaveLength(2);
    expect(details[0].id).toBe('S001');
    expect(details[0].title).toBe('Bold SEO Story');
    expect(details[0].situation).toBe('At Bold');
    expect(details[0].result).toBe('20% CVR increase');
    expect(details[1].earnedSecret).toBe('PM who builds');
  });

  it('handles missing Story Details section', () => {
    const details = parseStoryDetails('| ID | Title |\n|----|-------|\n| S001 | Test |');
    expect(details).toHaveLength(0);
  });
});

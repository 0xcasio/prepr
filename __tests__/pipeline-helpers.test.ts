import { describe, it, expect } from 'vitest';
import {
  field,
  statusCategory,
  getFit,
  isClosed,
  companyInitial,
  groupByColumn,
  shortenAction,
} from '../src/lib/pipeline-helpers';
import type { InterviewLoop } from '../src/lib/parser/types';

function makeLoop(
  name: string,
  fields: Record<string, string>
): InterviewLoop {
  return {
    companyName: name,
    fields: Object.entries(fields).map(([key, value]) => ({ key, value })),
  };
}

describe('pipeline-helpers', () => {
  describe('field()', () => {
    it('returns matching field value (case-insensitive)', () => {
      const loop = makeLoop('TestCo', { Status: 'Interviewing', 'Fit assessment': 'Strong' });
      expect(field(loop, 'status')).toBe('Interviewing');
      expect(field(loop, 'fit assessment')).toBe('Strong');
    });

    it('returns empty string for missing fields', () => {
      const loop = makeLoop('TestCo', { Status: 'Applied' });
      expect(field(loop, 'next round')).toBe('');
    });
  });

  describe('statusCategory()', () => {
    it('maps Interviewing status', () => {
      expect(statusCategory('Interviewing')).toBe('Interviewing');
    });

    it('maps Closed (rejected) to Closed', () => {
      expect(statusCategory('Closed (rejected at HM round)')).toBe('Closed');
    });

    it('maps Closed (paused) to Closed', () => {
      expect(statusCategory('Closed (paused)')).toBe('Closed');
    });

    it('maps assessment pending to Interviewing', () => {
      expect(statusCategory('Interviewing (assessments pending)')).toBe('Interviewing');
    });

    it('maps Offer', () => {
      expect(statusCategory('Offer')).toBe('Offer');
    });

    it('defaults to Interviewing for unknown statuses', () => {
      expect(statusCategory('Some random thing')).toBe('Interviewing');
    });
  });

  describe('getFit()', () => {
    it('detects strong fit', () => {
      const loop = makeLoop('A', { 'Fit assessment': 'Strong — direct domain match' });
      expect(getFit(loop)).toBe('strong');
    });

    it('detects moderate fit', () => {
      const loop = makeLoop('A', { 'Fit assessment': 'Moderate-strong — crypto experience' });
      expect(getFit(loop)).toBe('moderate');
    });

    it('returns null for missing fit', () => {
      const loop = makeLoop('A', {});
      expect(getFit(loop)).toBeNull();
    });
  });

  describe('isClosed()', () => {
    it('detects closed loops', () => {
      expect(isClosed(makeLoop('A', { Status: 'Closed (rejected)' }))).toBe(true);
      expect(isClosed(makeLoop('A', { Status: 'Closed (paused)' }))).toBe(true);
    });

    it('active loops are not closed', () => {
      expect(isClosed(makeLoop('A', { Status: 'Interviewing' }))).toBe(false);
    });
  });

  describe('companyInitial()', () => {
    it('returns first letter uppercase', () => {
      expect(companyInitial('Bottomline Technologies')).toBe('B');
      expect(companyInitial('files.com')).toBe('F');
    });
  });

  describe('shortenAction()', () => {
    it('shortens long actions at dash boundary', () => {
      const action = 'R2 cultural assessment — async, awaiting link from TJ';
      expect(shortenAction(action)).toBe('R2 cultural assessment');
    });

    it('truncates at 60 chars', () => {
      const longAction = 'A'.repeat(100);
      expect(shortenAction(longAction).length).toBeLessThanOrEqual(60);
    });
  });

  describe('groupByColumn()', () => {
    it('groups loops into correct columns', () => {
      const loops = [
        makeLoop('Bottomline', { Status: 'Interviewing' }),
        makeLoop('Vast', { Status: 'Interviewing' }),
        makeLoop('Files.com', { Status: 'Interviewing (assessments pending)' }),
        makeLoop('OKX', { Status: 'Interviewing (HM call scheduling)' }),
        makeLoop('Justworks', { Status: 'Closed (rejected at HM round)' }),
        makeLoop('GGP', { Status: 'Closed (rejected — moved with another candidate)' }),
        makeLoop('Housecall Pro', { Status: 'Closed (paused)' }),
      ];

      const groups = groupByColumn(loops);

      expect(groups['Interviewing']).toHaveLength(4);
      expect(groups['Closed']).toHaveLength(3);
      expect(groups['Researched']).toHaveLength(0);
      expect(groups['Applied']).toHaveLength(0);
      expect(groups['Offer']).toHaveLength(0);
    });
  });
});

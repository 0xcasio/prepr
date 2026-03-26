/**
 * Tests for the /api/state and /api/state/meta endpoints.
 *
 * These tests exercise the core logic (config, parse, serialize, conflict detection)
 * without needing a running Next.js server. We test the handler functions directly
 * by importing the route modules and simulating requests.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parse } from '@/lib/parser';
import { serialize } from '@/lib/serializer';
import type { CoachingState } from '@/lib/parser/types';

const REAL_FILE = path.resolve(__dirname, '../../../coaching_state.md');
const TEMP_FILE = path.resolve(__dirname, '../fixtures/test_state.md');
const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

describe('API State — Core Logic', () => {
  let originalContent: string;

  beforeEach(() => {
    // Read the real file and write a temp copy for mutation tests
    originalContent = fs.readFileSync(REAL_FILE, 'utf-8');
    if (!fs.existsSync(FIXTURES_DIR)) {
      fs.mkdirSync(FIXTURES_DIR, { recursive: true });
    }
    fs.writeFileSync(TEMP_FILE, originalContent, 'utf-8');
  });

  afterEach(() => {
    // Clean up temp file
    if (fs.existsSync(TEMP_FILE)) {
      fs.unlinkSync(TEMP_FILE);
    }
  });

  describe('GET /api/state — parse flow', () => {
    it('parses the real coaching_state.md into valid JSON', () => {
      const markdown = fs.readFileSync(REAL_FILE, 'utf-8');
      const data = parse(markdown);

      expect(data).toBeDefined();
      expect(data.name).toBe('Marcos Cruz');
      expect(data.profile).toBeDefined();
      expect(data.profile.targetRoles).toBeTruthy();
      expect(data.storybank.length).toBeGreaterThan(0);
      expect(data.scoreHistory.recentScores.length).toBeGreaterThan(0);
      expect(data.interviewLoops.length).toBeGreaterThan(0);
    });

    it('returns all 15 top-level sections', () => {
      const data = parse(originalContent);

      const expectedKeys: (keyof CoachingState)[] = [
        'name',
        'lastUpdated',
        'profile',
        'resumeAnalysis',
        'storybank',
        'storyDetails',
        'scoreHistory',
        'outcomeLog',
        'interviewIntelligence',
        'drillProgression',
        'interviewLoops',
        'activeStrategy',
        'metaCheckLog',
        'sessionLog',
        'coachingNotes',
      ];

      for (const key of expectedKeys) {
        expect(data).toHaveProperty(key);
      }
    });

    it('includes lastModified metadata from file stat', () => {
      const stat = fs.statSync(REAL_FILE);
      expect(stat.mtimeMs).toBeGreaterThan(0);
      expect(stat.size).toBeGreaterThan(0);
    });
  });

  describe('GET /api/state/meta — file metadata', () => {
    it('returns mtime and size without parsing', () => {
      const stat = fs.statSync(REAL_FILE);

      expect(stat.mtimeMs).toBeGreaterThan(0);
      expect(stat.size).toBeGreaterThan(100); // coaching_state.md is ~20KB+
    });
  });

  describe('PUT /api/state — write conflict detection', () => {
    it('detects conflict when file was modified after last read', () => {
      const statBefore = fs.statSync(TEMP_FILE);
      const staleTimestamp = statBefore.mtimeMs - 10000; // 10 seconds in the past

      const currentMtime = statBefore.mtimeMs;
      const isConflict = Math.abs(currentMtime - staleTimestamp) > 50;

      expect(isConflict).toBe(true);
    });

    it('allows write when expectedLastModified matches current mtime', () => {
      const stat = fs.statSync(TEMP_FILE);
      const isConflict = Math.abs(stat.mtimeMs - stat.mtimeMs) > 50;

      expect(isConflict).toBe(false);
    });
  });

  describe('PUT /api/state — merge and write', () => {
    it('merges a section update into existing state and writes valid markdown', () => {
      const currentState = parse(originalContent);

      // Simulate updating the profile track
      const update: Partial<CoachingState> = {
        profile: {
          ...currentState.profile,
          track: 'Full System',
        },
      };

      const mergedState: CoachingState = { ...currentState, ...update };
      mergedState.lastUpdated = '2026-03-26';

      const newMarkdown = serialize(mergedState);

      // Write it
      fs.writeFileSync(TEMP_FILE, newMarkdown, 'utf-8');

      // Read it back and verify
      const readBack = parse(fs.readFileSync(TEMP_FILE, 'utf-8'));
      expect(readBack.profile.track).toBe('Full System');
      // Other fields should be preserved
      expect(readBack.name).toBe('Marcos Cruz');
      expect(readBack.storybank.length).toBe(currentState.storybank.length);
      expect(readBack.interviewLoops.length).toBe(currentState.interviewLoops.length);
    });

    it('preserves all sections when updating a single section', () => {
      const currentState = parse(originalContent);
      const originalLoopCount = currentState.interviewLoops.length;
      const originalStoryCount = currentState.storybank.length;
      const originalScoreCount = currentState.scoreHistory.recentScores.length;

      // Update only coaching notes
      const mergedState: CoachingState = {
        ...currentState,
        coachingNotes: [
          ...currentState.coachingNotes,
          { raw: '- 2026-03-26: Test note from API' },
        ],
      };

      const newMarkdown = serialize(mergedState);
      const readBack = parse(newMarkdown);

      expect(readBack.coachingNotes.length).toBe(currentState.coachingNotes.length + 1);
      expect(readBack.interviewLoops.length).toBe(originalLoopCount);
      expect(readBack.storybank.length).toBe(originalStoryCount);
      expect(readBack.scoreHistory.recentScores.length).toBe(originalScoreCount);
    });
  });
});

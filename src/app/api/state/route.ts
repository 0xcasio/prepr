import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { getCoachingStatePath } from '@/lib/config';
import { parse } from '@/lib/parser';
import { serialize } from '@/lib/serializer';
import type { CoachingState } from '@/lib/parser/types';

/**
 * GET /api/state
 * Reads coaching_state.md, parses it, and returns the full CoachingState as JSON.
 * Response includes lastModified (mtime in ms) for conflict detection.
 */
export async function GET() {
  try {
    const filePath = getCoachingStatePath();

    const stat = await fs.stat(filePath).catch(() => null);
    if (!stat) {
      return NextResponse.json(
        { error: 'coaching_state.md not found' },
        { status: 404 }
      );
    }

    const markdown = await fs.readFile(filePath, 'utf-8');
    const data = parse(markdown);

    return NextResponse.json({
      data,
      lastModified: stat.mtimeMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to read coaching state', details: message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/state
 * Accepts a full or partial CoachingState update.
 * Reads the current file, checks for write conflicts via expectedLastModified,
 * merges the update, serializes back to markdown, and writes to disk.
 *
 * The read-check-merge-write is done as tightly as possible. We re-check
 * the mtime immediately before writing to minimize the TOCTOU window.
 *
 * Request body:
 * {
 *   update: Partial<CoachingState>,         // top-level keys to replace
 *   expectedLastModified: number            // mtime from last GET — for conflict detection
 * }
 *
 * IMPORTANT: The merge is shallow — each key in `update` fully replaces the
 * corresponding key in the current state. Callers must send complete section
 * objects (e.g., the full `profile` object, not just changed fields).
 *
 * Returns 200 on success, 409 on conflict, 400/500 on error.
 */
export async function PUT(request: NextRequest) {
  try {
    const filePath = getCoachingStatePath();

    const body = await request.json();
    const { update, expectedLastModified } = body as {
      update: Partial<CoachingState>;
      expectedLastModified: number;
    };

    if (!update || typeof expectedLastModified !== 'number') {
      return NextResponse.json(
        { error: 'Request body must include "update" (object) and "expectedLastModified" (number)' },
        { status: 400 }
      );
    }

    // Read current file content and stat in one go
    const [currentMarkdown, currentStat] = await Promise.all([
      fs.readFile(filePath, 'utf-8'),
      fs.stat(filePath),
    ]);

    // Conflict detection: compare current mtime with client's expected mtime
    // Allow a small tolerance (100ms) for filesystem timestamp precision
    if (Math.abs(currentStat.mtimeMs - expectedLastModified) > 100) {
      return NextResponse.json(
        {
          error: 'conflict',
          message: 'File was modified since your last read. Refresh to get the latest version.',
          currentLastModified: currentStat.mtimeMs,
          expectedLastModified,
        },
        { status: 409 }
      );
    }

    // Parse, merge, and serialize
    const currentState = parse(currentMarkdown);

    const mergedState: CoachingState = { ...currentState };
    for (const key of Object.keys(update) as (keyof CoachingState)[]) {
      if (update[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mergedState as any)[key] = update[key];
      }
    }

    // Update the "Last updated" timestamp
    mergedState.lastUpdated = new Date().toISOString().split('T')[0];

    const newMarkdown = serialize(mergedState);

    // Final mtime check right before writing to minimize TOCTOU window
    const recheckStat = await fs.stat(filePath);
    if (recheckStat.mtimeMs !== currentStat.mtimeMs) {
      return NextResponse.json(
        {
          error: 'conflict',
          message: 'File was modified during write preparation. Please retry.',
          currentLastModified: recheckStat.mtimeMs,
        },
        { status: 409 }
      );
    }

    await fs.writeFile(filePath, newMarkdown, 'utf-8');
    const newStat = await fs.stat(filePath);

    return NextResponse.json({
      success: true,
      lastModified: newStat.mtimeMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'coaching_state.md not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update coaching state', details: message },
      { status: 500 }
    );
  }
}

// Prevent Next.js from caching these routes
export const dynamic = 'force-dynamic';

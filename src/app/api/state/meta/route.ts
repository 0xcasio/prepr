import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { getCoachingStatePath } from '@/lib/config';

/**
 * GET /api/state/meta
 * Returns file metadata (mtime + size) without parsing.
 * Cheap freshness check for conflict detection and polling.
 */
export async function GET() {
  try {
    const filePath = getCoachingStatePath();
    const stat = await fs.stat(filePath);

    return NextResponse.json({
      lastModified: stat.mtimeMs,
      sizeBytes: stat.size,
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'coaching_state.md not found' },
        { status: 404 }
      );
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to read file metadata', details: message },
      { status: 500 }
    );
  }
}

// Prevent Next.js from caching this route
export const dynamic = 'force-dynamic';

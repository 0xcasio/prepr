'use client';

import { useCallback, useState } from 'react';
import { useCoachingState } from './useCoachingState';
import type { CoachingState } from '@/lib/parser/types';

interface WriteResult {
  success: boolean;
  lastModified?: number;
  error?: string;
  isConflict?: boolean;
  currentLastModified?: number;
}

/**
 * Mutation hook for writing updates to coaching_state.md.
 *
 * Handles:
 * - Sending section updates via PUT /api/state
 * - Conflict detection (409 responses)
 * - Optimistic UI updates via SWR mutate
 * - Loading and error states
 */
export function useWriteState() {
  const { lastModified, mutate } = useCoachingState();
  const [isWriting, setIsWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  const write = useCallback(
    async (update: Partial<CoachingState>): Promise<WriteResult> => {
      if (lastModified === null) {
        return { success: false, error: 'No state loaded yet — cannot determine lastModified' };
      }

      setIsWriting(true);
      setWriteError(null);
      setIsConflict(false);

      try {
        const res = await fetch('/api/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            update,
            expectedLastModified: lastModified,
          }),
        });

        const body = await res.json();

        if (res.status === 409) {
          setIsConflict(true);
          setWriteError(body.message || 'Write conflict — file was modified externally.');
          return {
            success: false,
            error: body.message,
            isConflict: true,
            currentLastModified: body.currentLastModified,
          };
        }

        if (!res.ok) {
          const errMsg = body.error || `HTTP ${res.status}`;
          setWriteError(errMsg);
          return { success: false, error: errMsg };
        }

        // Success — revalidate SWR cache to pick up the new state
        await mutate();

        return {
          success: true,
          lastModified: body.lastModified,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown write error';
        setWriteError(message);
        return { success: false, error: message };
      } finally {
        setIsWriting(false);
      }
    },
    [lastModified, mutate]
  );

  const dismissConflict = useCallback(() => {
    setIsConflict(false);
    setWriteError(null);
    // Refetch to get the latest state after conflict
    mutate();
  }, [mutate]);

  return {
    write,
    isWriting,
    writeError,
    isConflict,
    dismissConflict,
  };
}

'use client';

import useSWR from 'swr';
import type { CoachingState } from '@/lib/parser/types';

export interface CoachingStateResponse {
  data: CoachingState;
  lastModified: number;
}

const fetcher = async (url: string): Promise<CoachingStateResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
};

/**
 * SWR hook for the parsed coaching state.
 *
 * - Auto-fetches from GET /api/state
 * - Returns typed CoachingState + lastModified for conflict detection
 * - Call `mutate()` to trigger a refetch (e.g., after SSE file-changed event)
 * - Revalidates on window focus by default
 */
export function useCoachingState() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<CoachingStateResponse>(
    '/api/state',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Don't refetch within 2s of last fetch
    }
  );

  return {
    state: data?.data ?? null,
    lastModified: data?.lastModified ?? null,
    error: error as Error | null,
    isLoading,
    isValidating,
    mutate,
  };
}

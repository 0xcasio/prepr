'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useCoachingState } from './useCoachingState';

interface UseFileEventsOptions {
  /** Fallback polling interval in ms if SSE fails. Default: 5000 */
  pollInterval?: number;
  /** Whether to enable SSE connection. Default: true */
  enabled?: boolean;
}

/**
 * SSE subscription hook for file change events.
 *
 * Connects to GET /api/events, listens for "file-changed" events,
 * and triggers SWR revalidation on the coaching state.
 *
 * Falls back to polling /api/state/meta every 5s if SSE fails.
 */
export function useFileEvents(options: UseFileEventsOptions = {}) {
  const { pollInterval = 5000, enabled = true } = options;
  const { mutate } = useCoachingState();
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMtimeRef = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);

  const revalidate = useCallback(() => {
    mutate();
  }, [mutate]);

  // Start polling as SSE fallback
  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return; // Already polling

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/state/meta');
        if (!res.ok) return;
        const meta = await res.json();

        if (lastMtimeRef.current !== null && meta.lastModified > lastMtimeRef.current) {
          revalidate();
        }
        lastMtimeRef.current = meta.lastModified;
      } catch {
        // Polling failure — ignore, will retry on next interval
      }
    }, pollInterval);
  }, [pollInterval, revalidate]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Connect to SSE
    const es = new EventSource('/api/events');
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      setConnected(true);
      stopPolling(); // SSE is working — no need for polling fallback
    });

    es.addEventListener('file-changed', () => {
      revalidate();
    });

    es.onerror = () => {
      setConnected(false);
      // SSE failed — fall back to polling
      startPolling();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      setConnected(false);
      stopPolling();
    };
  }, [enabled, revalidate, startPolling, stopPolling]);

  return { connected };
}

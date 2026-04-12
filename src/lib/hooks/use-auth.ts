import useSWR from 'swr';
import type { AuthStatus } from '@/lib/auth';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Hook to check Claude Code authentication status.
 * Polls every 30 seconds to detect when user authenticates.
 */
export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<AuthStatus>(
    '/api/auth',
    fetcher,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    }
  );

  return {
    status: data ?? { authenticated: false },
    isLoading,
    error,
    refresh: mutate,
  };
}

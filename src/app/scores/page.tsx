'use client';

import { Loader2, TrendingUp } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { ConflictBanner } from '@/components/shared/conflict-banner';
import { ExecutiveSummary } from '@/components/scores/executive-summary';
import { TrendChart } from '@/components/scores/trend-chart';
import { SessionHistory } from '@/components/scores/session-history';
import { CoachingSidebar } from '@/components/scores/coaching-sidebar';
import { useCoachingState } from '@/lib/hooks/useCoachingState';
import { useFileEvents } from '@/lib/hooks/useFileEvents';
import { useWriteState } from '@/lib/hooks/useWriteState';

export default function ScoresPage() {
  const { state, error, isLoading } = useCoachingState();
  const { isConflict, dismissConflict } = useWriteState();
  useFileEvents();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  if (error || !state) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Unable to load scores"
        description={
          error?.message ||
          'Could not read coaching_state.md. Check that the file exists.'
        }
      />
    );
  }

  const scores = state.scoreHistory.recentScores;

  if (scores.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No scores yet"
        description="Complete your first practice or mock session to start tracking scores."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Conflict banner */}
      {isConflict && (
        <ConflictBanner
          onRefresh={dismissConflict}
          onDismiss={dismissConflict}
        />
      )}

      {/* Main content + Sidebar */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left: main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <ExecutiveSummary scores={scores} />
          <TrendChart scores={scores} />
          <SessionHistory scores={scores} />
        </div>

        {/* Right: coaching sidebar */}
        <CoachingSidebar
          strategy={state.activeStrategy}
          drill={state.drillProgression}
          scores={scores}
        />
      </div>
    </div>
  );
}

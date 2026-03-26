'use client';

import { LayoutDashboard, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { ConflictBanner } from '@/components/shared/conflict-banner';
import { PipelineSummary } from '@/components/dashboard/pipeline-summary';
import { UpcomingActions } from '@/components/dashboard/upcoming-actions';
import { ScoreSparkline } from '@/components/dashboard/score-sparkline';
import { StrategyBar } from '@/components/dashboard/strategy-bar';
import { useCoachingState } from '@/lib/hooks/useCoachingState';
import { useFileEvents } from '@/lib/hooks/useFileEvents';
import { useWriteState } from '@/lib/hooks/useWriteState';
import { upcomingActions } from '@/lib/derived';

export default function DashboardPage() {
  const { state, error, isLoading } = useCoachingState();
  const { isConflict, dismissConflict } = useWriteState();

  // Wire up SSE for auto-refresh
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
        icon={LayoutDashboard}
        title="Unable to load dashboard"
        description={
          error?.message || 'Could not read coaching_state.md. Check that the file exists and COACHING_STATE_PATH is set.'
        }
      />
    );
  }

  const actions = upcomingActions(state.interviewLoops);

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Conflict banner */}
      {isConflict && (
        <ConflictBanner
          onRefresh={dismissConflict}
          onDismiss={dismissConflict}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
          Dashboard
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] italic mt-1">
          Welcome back, {state.name.split(' ')[0]}
        </p>
      </div>

      {/* Active Pipeline */}
      <PipelineSummary loops={state.interviewLoops} />

      {/* Bento row: Upcoming Actions + Score Sparkline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <UpcomingActions actions={actions} />
        <ScoreSparkline scores={state.scoreHistory.recentScores} />
      </div>

      {/* Coaching Strategy Bar */}
      <StrategyBar strategy={state.activeStrategy} drills={state.drillProgression} />
    </div>
  );
}

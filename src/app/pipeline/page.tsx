'use client';

import { useState, useCallback } from 'react';
import { Kanban, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { ConflictBanner } from '@/components/shared/conflict-banner';
import { KanbanBoard } from '@/components/pipeline/kanban-board';
import { CompanyDetail } from '@/components/pipeline/company-detail';
import {
  LogOutcomeForm,
  UpdateStatusForm,
  AddRoundForm,
} from '@/components/pipeline/quick-entry-forms';
import { useCoachingState } from '@/lib/hooks/useCoachingState';
import { useFileEvents } from '@/lib/hooks/useFileEvents';
import { useWriteState } from '@/lib/hooks/useWriteState';
import type { InterviewLoop, OutcomeEntry } from '@/lib/parser/types';

export default function PipelinePage() {
  const { state, error, isLoading } = useCoachingState();
  const { isConflict, dismissConflict, write } = useWriteState();
  useFileEvents();

  // Panel / dialog state
  const [selectedLoop, setSelectedLoop] = useState<InterviewLoop | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [logOutcomeOpen, setLogOutcomeOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [addRoundOpen, setAddRoundOpen] = useState(false);

  const handleSelectLoop = useCallback((loop: InterviewLoop) => {
    setSelectedLoop(loop);
    setDetailOpen(true);
  }, []);

  const handleLogOutcome = useCallback(
    async (data: { outcomeEntry: OutcomeEntry; updatedLoop: InterviewLoop }) => {
      if (!state) return;

      // Add to outcome log
      const updatedOutcomeLog = [...state.outcomeLog, data.outcomeEntry];

      await write({
        outcomeLog: updatedOutcomeLog,
      });
    },
    [state, write]
  );

  const handleUpdateStatus = useCallback(
    async (updatedLoop: InterviewLoop) => {
      if (!state) return;

      // Replace the loop in the array
      const updatedLoops = state.interviewLoops.map((l) =>
        l.companyName === updatedLoop.companyName ? updatedLoop : l
      );

      await write({
        interviewLoops: updatedLoops,
      });

      // Update selected loop if it's the same one
      setSelectedLoop(updatedLoop);
    },
    [state, write]
  );

  const handleAddRound = useCallback(
    async (updatedLoop: InterviewLoop) => {
      if (!state) return;

      const updatedLoops = state.interviewLoops.map((l) =>
        l.companyName === updatedLoop.companyName ? updatedLoop : l
      );

      await write({
        interviewLoops: updatedLoops,
      });

      setSelectedLoop(updatedLoop);
    },
    [state, write]
  );

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
        icon={Kanban}
        title="Unable to load pipeline"
        description={
          error?.message ||
          'Could not read coaching_state.md. Check that the file exists.'
        }
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
            Pipeline
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] italic mt-1">
            {state.interviewLoops.length} interview loops tracked
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        loops={state.interviewLoops}
        onSelectLoop={handleSelectLoop}
      />

      {/* Company Detail Sheet */}
      <CompanyDetail
        loop={selectedLoop}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        companyPatterns={state.interviewIntelligence.companyPatterns}
        onLogOutcome={() => {
          setDetailOpen(false);
          setLogOutcomeOpen(true);
        }}
        onUpdateStatus={() => {
          setDetailOpen(false);
          setUpdateStatusOpen(true);
        }}
      />

      {/* Quick Entry Forms */}
      {selectedLoop && (
        <>
          <LogOutcomeForm
            loop={selectedLoop}
            open={logOutcomeOpen}
            onOpenChange={setLogOutcomeOpen}
            onSubmit={handleLogOutcome}
          />
          <UpdateStatusForm
            loop={selectedLoop}
            open={updateStatusOpen}
            onOpenChange={setUpdateStatusOpen}
            onSubmit={handleUpdateStatus}
          />
          <AddRoundForm
            loop={selectedLoop}
            open={addRoundOpen}
            onOpenChange={setAddRoundOpen}
            onSubmit={handleAddRound}
          />
        </>
      )}
    </div>
  );
}

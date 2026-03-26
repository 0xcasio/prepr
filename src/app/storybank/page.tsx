'use client';

import { BookOpen, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { ConflictBanner } from '@/components/shared/conflict-banner';
import { StoryTable } from '@/components/storybank/story-table';
import { StorySidebar } from '@/components/storybank/story-sidebar';
import { useCoachingState } from '@/lib/hooks/useCoachingState';
import { useFileEvents } from '@/lib/hooks/useFileEvents';
import { useWriteState } from '@/lib/hooks/useWriteState';

export default function StorybankPage() {
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
        icon={BookOpen}
        title="Unable to load storybank"
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
      <div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
          Storybank
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] italic mt-1">
          {state.storybank.length} stories in your arsenal
        </p>
      </div>

      {/* Main content + Sidebar */}
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0 overflow-x-auto">
          <StoryTable state={state} />
        </div>
        <StorySidebar state={state} />
      </div>
    </div>
  );
}

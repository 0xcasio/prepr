'use client';

import { Loader2, FileText } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { NotesTimeline } from '@/components/notes/notes-timeline';
import { NotesSidebar } from '@/components/notes/notes-sidebar';
import { useCoachingState } from '@/lib/hooks/useCoachingState';
import { useFileEvents } from '@/lib/hooks/useFileEvents';

export default function NotesPage() {
  const { state, error, isLoading } = useCoachingState();

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
        icon={FileText}
        title="Coaching Notes"
        description="Could not load coaching data. Make sure coaching_state.md exists."
      />
    );
  }

  const { coachingNotes } = state;

  if (coachingNotes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Coaching Notes"
        description="No coaching notes yet. Notes are captured automatically during coaching sessions when you reveal preferences, patterns, or personal context."
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-1">
          Coaching Notes
        </h1>
        <p className="text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] text-base italic">
          What your coach remembers between sessions
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <NotesTimeline notes={coachingNotes} />
        <NotesSidebar notes={coachingNotes} />
      </div>
    </div>
  );
}

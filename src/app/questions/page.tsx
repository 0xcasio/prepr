'use client';

import { Loader2, HelpCircle } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { QuestionTable } from '@/components/questions/question-table';
import { QuestionSidebar } from '@/components/questions/question-sidebar';
import { useCoachingState } from '@/lib/hooks/useCoachingState';
import { useFileEvents } from '@/lib/hooks/useFileEvents';

export default function QuestionsPage() {
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
        icon={HelpCircle}
        title="Question Bank"
        description="Could not load coaching data. Make sure coaching_state.md exists."
      />
    );
  }

  const { questionBank, effectivePatterns, ineffectivePatterns } =
    state.interviewIntelligence;

  if (questionBank.length === 0) {
    return (
      <EmptyState
        icon={HelpCircle}
        title="Question Bank"
        description="No interview questions logged yet. Use the coaching chat to run 'debrief' after an interview, and questions will appear here."
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-1">
          Question Bank
        </h1>
        <p className="text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] text-base italic">
          Every interview question you&apos;ve encountered
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <QuestionTable questions={questionBank} />
        <QuestionSidebar
          questions={questionBank}
          effectivePatterns={effectivePatterns}
          ineffectivePatterns={ineffectivePatterns}
        />
      </div>
    </div>
  );
}

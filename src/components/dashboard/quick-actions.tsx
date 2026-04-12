'use client';

import { useRouter } from 'next/navigation';
import {
  Dumbbell,
  BookOpen,
  FileSearch,
  MessageSquare,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/lib/hooks/use-chat';
import type { InterviewLoop, CoachingState } from '@/lib/parser/types';

interface QuickActionsProps {
  state: CoachingState;
}

interface ActionItem {
  label: string;
  sublabel: string;
  command: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

/** Extract a field value from a loop's fields array. */
function loopField(loop: InterviewLoop, key: string): string {
  return loop.fields.find((f) => f.key.toLowerCase().includes(key.toLowerCase()))?.value ?? '';
}

function deriveActions(state: CoachingState): ActionItem[] {
  const actions: ActionItem[] = [];

  // Find active loops with next rounds
  const activeLoops = state.interviewLoops.filter((loop) => {
    const status = loopField(loop, 'status').toLowerCase();
    return !status.includes('closed') && !status.includes('archived');
  });

  // For each active loop, suggest relevant actions
  for (const loop of activeLoops) {
    const nextRound = loopField(loop, 'next round');
    const status = loopField(loop, 'status').toLowerCase();

    if (nextRound && nextRound !== 'TBD' && nextRound !== '—') {
      // Extract round number/name
      const roundMatch = nextRound.match(/R(\d+)/i) || nextRound.match(/Round\s*(\d+)/i);
      const roundLabel = roundMatch ? `R${roundMatch[1]}` : 'next round';

      actions.push({
        label: `Prep for ${loop.companyName}`,
        sublabel: `Get ready for ${roundLabel}`,
        command: `prep ${loop.companyName}`,
        icon: FileSearch,
        color: 'text-[var(--color-accent)]',
        bgColor: 'bg-[var(--color-accent-subtle)]',
      });
    }

    if (status.includes('offer') || status.includes('awaiting')) {
      actions.push({
        label: `${loop.companyName} follow-up`,
        sublabel: 'Send a thank-you or check in',
        command: `thankyou ${loop.companyName}`,
        icon: MessageSquare,
        color: 'text-[var(--color-success)]',
        bgColor: 'bg-[var(--color-success-subtle)]',
      });
    }
  }

  // Always suggest practice if there are active loops
  if (activeLoops.length > 0) {
    actions.push({
      label: 'Practice drill',
      sublabel: 'Sharpen your answers',
      command: 'practice',
      icon: Dumbbell,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
    });
  }

  // Suggest debrief if there's a recent interview (check if any loop has a recent round)
  actions.push({
    label: 'Run debrief',
    sublabel: 'Capture a recent interview',
    command: 'debrief',
    icon: ClipboardCheck,
    color: 'text-[var(--color-warning)]',
    bgColor: 'bg-[var(--color-warning-subtle)]',
  });

  // Suggest story work if storybank is small
  if (state.storybank.length < 6) {
    actions.push({
      label: 'Build stories',
      sublabel: `${state.storybank.length} stories — add more`,
      command: 'stories',
      icon: BookOpen,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    });
  }

  // Check progress
  actions.push({
    label: 'Review progress',
    sublabel: 'See trends and calibration',
    command: 'progress',
    icon: Sparkles,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
  });

  // Deduplicate by command and take top 4
  const seen = new Set<string>();
  return actions.filter((a) => {
    if (seen.has(a.command)) return false;
    seen.add(a.command);
    return true;
  }).slice(0, 4);
}

export function QuickActions({ state }: QuickActionsProps) {
  const router = useRouter();
  const { queueCommand } = useChat();

  const actions = deriveActions(state);

  if (actions.length === 0) return null;

  const handleAction = (command: string) => {
    queueCommand(command);
    router.push('/chat');
  };

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-1">
          Quick Actions
        </h3>
        <div className="h-0.5 w-12 bg-[var(--color-accent)]" />
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.command}
            onClick={() => handleAction(action.command)}
            className={cn(
              'flex items-center gap-4 w-full p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)]',
              'hover:shadow-[var(--shadow-md)] transition-all duration-150',
              'text-left group cursor-pointer'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] shrink-0',
                action.bgColor
              )}
            >
              <action.icon className={cn('h-5 w-5', action.color)} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[var(--color-text-primary)] text-sm font-[family-name:var(--font-sans)] group-hover:text-[var(--color-accent)] transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] font-[family-name:var(--font-body)]">
                {action.sublabel}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

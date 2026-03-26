'use client';

import { Phone, FileText, Clock, Sparkles } from 'lucide-react';
import type { UpcomingAction } from '@/lib/derived';

interface UpcomingActionsProps {
  actions: UpcomingAction[];
}

function ActionIcon({ type }: { type: UpcomingAction['type'] }) {
  switch (type) {
    case 'interview':
      return <Phone className="h-5 w-5 text-[var(--color-accent)]" />;
    case 'assessment':
      return <FileText className="h-5 w-5 text-[var(--color-danger)]" />;
    case 'decision':
      return <Clock className="h-5 w-5 text-[var(--color-warning)]" />;
    default:
      return <Sparkles className="h-5 w-5 text-[var(--color-text-muted)]" />;
  }
}

/** Format a date string or return null. */
function formatDate(date: string | null): string | null {
  if (!date) return null;
  try {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return date;
  }
}

/**
 * UpcomingActions — sorted list of time-sensitive items from active loops.
 * Each item shows an icon by type, the action description, company, and date.
 */
export function UpcomingActions({ actions }: UpcomingActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-1">
          Upcoming Actions
        </h3>
        <div className="h-0.5 w-12 bg-[var(--color-accent)]" />
      </div>

      <div className="space-y-3">
        {actions.slice(0, 5).map((action, i) => {
          const dateStr = formatDate(action.date);
          // Shorten the action text for display
          const displayAction = action.action.split(' — ')[0].split('. ')[0];
          const shortAction = displayAction.length > 50
            ? displayAction.slice(0, 47) + '...'
            : displayAction;

          return (
            <div
              key={`${action.company}-${i}`}
              className="flex gap-4 p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)]"
            >
              <div className="mt-0.5 shrink-0">
                <ActionIcon type={action.type} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--color-text-primary)] text-sm truncate">
                  {shortAction}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] font-[family-name:var(--font-body)]">
                  {action.company}
                  {dateStr && <> &middot; {dateStr}</>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

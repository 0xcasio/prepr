'use client';

import { Calendar, Clock, FileText, Phone, Sparkles } from 'lucide-react';
import { FitBadge } from '@/components/shared';
import { cn } from '@/lib/utils';
import type { InterviewLoop } from '@/lib/parser/types';
import {
  field,
  getFit,
  companyInitial,
  shortenAction,
  isClosed,
} from '@/lib/pipeline-helpers';

interface CompanyCardProps {
  loop: InterviewLoop;
  onClick: () => void;
}

/** Get an icon for the next action type. */
function ActionIcon({ action }: { action: string }) {
  const lower = action.toLowerCase();
  if (lower.includes('call') || lower.includes('interview'))
    return <Phone className="h-3 w-3" />;
  if (
    lower.includes('assessment') ||
    lower.includes('vervoe') ||
    lower.includes('ccat')
  )
    return <FileText className="h-3 w-3" />;
  if (lower.includes('awaiting') || lower.includes('pending'))
    return <Clock className="h-3 w-3" />;
  if (lower.includes('offer') || lower.includes('decision'))
    return <Sparkles className="h-3 w-3" />;
  return <Calendar className="h-3 w-3" />;
}

/** Count rounds from the "Rounds completed" field by counting bracket groups. */
function parseRoundCount(raw: string): number {
  if (!raw || raw === '[]' || raw === '—') return 0;
  const groups = raw.match(/\[[^\]]+\]/g);
  return groups ? groups.length : 0;
}

/** Round progress dots. */
function RoundDots({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const dots = Array.from({ length: total }, (_, i) => i < completed);
  return (
    <div className="flex gap-1" role="img" aria-label={`${completed} of ${total} rounds completed`}>
      {dots.map((filled, i) => (
        <div
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            filled
              ? 'bg-[var(--color-accent)]'
              : 'bg-[var(--color-border)]'
          )}
        />
      ))}
    </div>
  );
}

export function CompanyCard({ loop, onClick }: CompanyCardProps) {
  const closed = isClosed(loop);
  const status = field(loop, 'status');
  const nextRound = field(loop, 'next round');
  const fit = getFit(loop);
  const roundsRaw = field(loop, 'rounds completed');
  const completedCount = parseRoundCount(roundsRaw);
  // Estimate total rounds (completed + 1 for next, or at least completed)
  const hasNext =
    nextRound && nextRound !== 'TBD' && nextRound !== '—' && !closed;
  const estimatedTotal = hasNext
    ? Math.max(completedCount + 1, 3)
    : Math.max(completedCount, 1);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)]',
        'shadow-[var(--shadow-md)] transition-all duration-200',
        'hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-accent-subtle)]',
        'border-b-2 border-transparent',
        closed && 'opacity-60 grayscale',
        !closed && 'hover:border-[var(--color-accent)]'
      )}
    >
      {/* Header: Company + Fit Badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center text-white font-bold text-sm font-[family-name:var(--font-sans)]',
              closed
                ? 'bg-[var(--color-text-muted)]'
                : 'bg-[var(--color-text-primary)]'
            )}
          >
            {companyInitial(loop.companyName)}
          </div>
          <div>
            <span className="font-semibold text-[var(--color-text-primary)] text-sm font-[family-name:var(--font-sans)] leading-tight block">
              {loop.companyName}
            </span>
            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 mt-0.5">
              {status}
            </p>
          </div>
        </div>
        {fit && !closed && <FitBadge fit={fit} />}
        {closed && (
          <span className="text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-alt)] px-2 py-0.5 rounded-[var(--radius-full)] font-[family-name:var(--font-sans)]">
            CLOSED
          </span>
        )}
      </div>

      {/* Next round info (active cards only) */}
      {hasNext && (
        <div className="bg-[var(--color-surface-alt)] p-3 rounded-[var(--radius-sm)] mb-3">
          <div className="flex items-center gap-2 text-[var(--color-accent)] text-xs font-semibold font-[family-name:var(--font-sans)] mb-0.5">
            <ActionIcon action={nextRound} />
            <span>Next</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
            {shortenAction(nextRound)}
          </p>
        </div>
      )}

      {/* Round progress dots */}
      <div className="flex items-center justify-between">
        <RoundDots completed={completedCount} total={estimatedTotal} />
        <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
          {completedCount}/{estimatedTotal} ROUNDS
        </span>
      </div>
    </button>
  );
}

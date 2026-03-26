'use client';

import Link from 'next/link';
import { Calendar, Clock, FileText, Phone } from 'lucide-react';
import { FitBadge } from '@/components/shared';
import { cn } from '@/lib/utils';
import type { InterviewLoop } from '@/lib/parser/types';

interface PipelineSummaryProps {
  loops: InterviewLoop[];
}

/** Extract a field value from a loop's key-value fields. */
function field(loop: InterviewLoop, key: string): string {
  return loop.fields.find((f) => f.key.toLowerCase().includes(key.toLowerCase()))?.value ?? '';
}

/** Determine the fit level from a loop's fit assessment field. */
function getFit(loop: InterviewLoop): 'strong' | 'moderate' | 'weak' | null {
  const fit = field(loop, 'fit assessment').toLowerCase();
  if (fit.includes('strong')) return 'strong';
  if (fit.includes('moderate')) return 'moderate';
  if (fit.includes('weak')) return 'weak';
  return null;
}

/** Check if a loop is closed. */
function isClosed(loop: InterviewLoop): boolean {
  const status = field(loop, 'status').toLowerCase();
  return status.includes('closed') || status.includes('rejected') || status.includes('paused');
}

/** Get an icon for the next action type. */
function ActionIcon({ action }: { action: string }) {
  const lower = action.toLowerCase();
  if (lower.includes('call') || lower.includes('interview')) return <Phone className="h-3.5 w-3.5" />;
  if (lower.includes('assessment') || lower.includes('vervoe') || lower.includes('ccat'))
    return <FileText className="h-3.5 w-3.5" />;
  if (lower.includes('awaiting') || lower.includes('pending')) return <Clock className="h-3.5 w-3.5" />;
  return <Calendar className="h-3.5 w-3.5" />;
}

/** Shorten a long next-round string for display. */
function shortenAction(raw: string): string {
  // Take up to the first dash or period to keep it concise
  const shortened = raw.split(' — ')[0].split('. ')[0];
  return shortened.length > 60 ? shortened.slice(0, 57) + '...' : shortened;
}

/** Get the first letter(s) for the company avatar. */
function companyInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/**
 * PipelineSummary — horizontal row of company cards for active interview loops.
 * Closed loops are hidden. Matches the design in dashboard_final_pass.
 */
export function PipelineSummary({ loops }: PipelineSummaryProps) {
  const activeLoops = loops.filter((l) => !isClosed(l));

  if (activeLoops.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-2xl font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-1">
            Active Pipeline
          </h3>
          <p className="text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] text-base italic">
            High-priority interview tracks
          </p>
        </div>
        <Link
          href="/pipeline"
          className="text-[var(--color-accent)] font-semibold text-sm hover:underline"
        >
          View full board
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeLoops.map((loop) => {
          const status = field(loop, 'status');
          const nextRound = field(loop, 'next round');
          const fit = getFit(loop);
          const role = field(loop, 'role') || status;

          return (
            <Link
              key={loop.companyName}
              href="/pipeline"
              className={cn(
                'bg-[var(--color-surface-alt)] p-5 rounded-[var(--radius-lg)]',
                'transition-all duration-200 hover:bg-[var(--color-border)] group',
                'flex flex-col'
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[var(--color-text-primary)] rounded-[var(--radius-sm)] flex items-center justify-center text-white font-bold text-sm">
                  {companyInitial(loop.companyName)}
                </div>
                {fit && <FitBadge fit={fit} />}
              </div>

              <h4 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] text-sm">
                {loop.companyName}
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4 line-clamp-1">
                {role}
              </p>

              {nextRound && nextRound !== 'TBD' && nextRound !== '—' && (
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] mt-auto">
                  <ActionIcon action={nextRound} />
                  <span className="line-clamp-1">{shortenAction(nextRound)}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

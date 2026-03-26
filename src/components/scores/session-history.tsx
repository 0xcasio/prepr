'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ScoreEntry } from '@/lib/parser/types';
import { sessionAverage } from '@/lib/derived';

interface SessionHistoryProps {
  scores: ScoreEntry[];
}

type SortKey = 'date' | 'avg';
type SortDir = 'asc' | 'desc';

// ── Dimension Mini Bars ──────────────────────────────────────────────────────

function DimensionBars({ entry }: { entry: ScoreEntry }) {
  const dims = [
    { key: 'Sub', val: entry.sub },
    { key: 'Str', val: entry.str },
    { key: 'Rel', val: entry.rel },
    { key: 'Cre', val: entry.cred },
    { key: 'Dif', val: entry.diff },
  ];

  return (
    <div className="flex gap-1 items-end h-7">
      {dims.map((d) => {
        const num = parseFloat(d.val);
        const valid = !isNaN(num) && num > 0;
        const pct = valid ? (num / 5) * 100 : 0;
        const color = valid
          ? num >= 4
            ? 'bg-[var(--color-success)]'
            : num >= 3
              ? 'bg-[var(--color-accent)]'
              : 'bg-[var(--color-warning)]'
          : 'bg-[var(--color-border)]';

        return (
          <div
            key={d.key}
            className="flex flex-col items-center gap-0.5"
            title={`${d.key}: ${valid ? num.toFixed(1) : '—'}`}
          >
            <div className="w-4 bg-[var(--color-surface-alt)] rounded-sm overflow-hidden h-5 flex flex-col justify-end">
              {valid && (
                <div
                  className={cn('w-full rounded-sm transition-all', color)}
                  style={{ height: `${pct}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Self-Delta Badge ─────────────────────────────────────────────────────────

function SelfDeltaBadge({ value }: { value: string }) {
  const lower = value.toLowerCase();
  if (lower.includes('over')) {
    return (
      <Badge variant="warning" className="text-[10px]">
        Over
      </Badge>
    );
  }
  if (lower.includes('under')) {
    return (
      <Badge variant="accent" className="text-[10px]">
        Under
      </Badge>
    );
  }
  if (lower.includes('accurate')) {
    return (
      <Badge variant="success" className="text-[10px]">
        Accurate
      </Badge>
    );
  }
  return (
    <span className="text-xs text-[var(--color-text-muted)] italic">—</span>
  );
}

// ── Hire Signal Badge ────────────────────────────────────────────────────────

function HireSignalBadge({ value }: { value: string }) {
  if (!value || value === '—') {
    return (
      <span className="text-xs text-[var(--color-text-muted)] italic">—</span>
    );
  }
  const lower = value.toLowerCase();
  let variant: 'success' | 'accent' | 'warning' | 'neutral' = 'neutral';
  if (lower.includes('strong')) variant = 'success';
  else if (lower === 'hire') variant = 'accent';
  else if (lower === 'mixed') variant = 'warning';

  return (
    <Badge variant={variant} className="text-[10px]">
      {value}
    </Badge>
  );
}

// ── Format Date ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Main Component ───────────────────────────────────────────────────────────

export function SessionHistory({ scores }: SessionHistoryProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sortedScores = useMemo(() => {
    const sorted = [...scores];
    sorted.sort((a, b) => {
      if (sortKey === 'date') {
        return sortDir === 'desc'
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
      }
      // avg
      const avgA = sessionAverage(a);
      const avgB = sessionAverage(b);
      return sortDir === 'desc' ? avgB - avgA : avgA - avgB;
    });
    return sorted;
  }, [scores, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) =>
    active ? (
      dir === 'desc' ? (
        <ChevronDown className="h-3 w-3 inline ml-0.5" />
      ) : (
        <ChevronUp className="h-3 w-3 inline ml-0.5" />
      )
    ) : null;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
      <div className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)] font-[family-name:var(--font-sans)]">
          Session History
        </h3>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
          {scores.length} sessions recorded
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[var(--color-surface-alt)]">
              <th
                className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)] cursor-pointer hover:text-[var(--color-text-secondary)] transition-colors select-none"
                onClick={() => toggleSort('date')}
                aria-label={`Sort by date ${sortKey === 'date' ? (sortDir === 'desc' ? 'ascending' : 'descending') : ''}`}
              >
                Date & Session
                <SortIcon active={sortKey === 'date'} dir={sortDir} />
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)]">
                Context
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)]">
                Dimensions
              </th>
              <th
                className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)] cursor-pointer hover:text-[var(--color-text-secondary)] transition-colors text-center select-none"
                onClick={() => toggleSort('avg')}
                aria-label={`Sort by average ${sortKey === 'avg' ? (sortDir === 'desc' ? 'ascending' : 'descending') : ''}`}
              >
                Avg
                <SortIcon active={sortKey === 'avg'} dir={sortDir} />
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)] text-center">
                Self-Δ
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)] text-center">
                Hire Signal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {sortedScores.map((entry, i) => {
              const avg = sessionAverage(entry);
              return (
                <tr
                  key={`${entry.date}-${i}`}
                  className="hover:bg-[var(--color-surface-alt)]/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-sans)]">
                      {formatDate(entry.date)}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
                      {entry.type || 'practice'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-[var(--color-text-secondary)] max-w-[200px] line-clamp-2">
                      {entry.context || '—'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <DimensionBars entry={entry} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={cn(
                        'text-sm font-mono font-bold',
                        avg >= 4
                          ? 'text-[var(--color-success)]'
                          : avg >= 3
                            ? 'text-[var(--color-accent)]'
                            : 'text-[var(--color-warning)]'
                      )}
                    >
                      {avg > 0 ? avg.toFixed(1) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <SelfDeltaBadge value={entry.selfDelta} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <HireSignalBadge value={entry.hireSignal} />
                  </td>
                </tr>
              );
            })}

            {sortedScores.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)] italic"
                >
                  No sessions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

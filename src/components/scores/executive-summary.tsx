'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ScoreEntry } from '@/lib/parser/types';
import {
  compositeAverage,
  growthDelta,
  compositeHireSignal,
  sessionAverage,
  dimensionAverages,
  scoreTrend,
} from '@/lib/derived';

interface ExecutiveSummaryProps {
  scores: ScoreEntry[];
}

// ── Hire Signal Badge ────────────────────────────────────────────────────────

function hireSignalVariant(
  signal: string
): 'success' | 'accent' | 'warning' | 'neutral' {
  switch (signal) {
    case 'Strong Hire':
      return 'success';
    case 'Hire':
      return 'accent';
    case 'Mixed':
      return 'warning';
    case 'No Hire':
      return 'neutral';
    default:
      return 'neutral';
  }
}

// ── Dimension Bar ────────────────────────────────────────────────────────────

function DimensionBar({
  label,
  value,
  abbrev,
}: {
  label: string;
  value: number;
  abbrev: string;
}) {
  const pct = Math.min((value / 5) * 100, 100);
  const color =
    value >= 4
      ? 'bg-[var(--color-success)]'
      : value >= 3
        ? 'bg-[var(--color-accent)]'
        : 'bg-[var(--color-warning)]';

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] font-[family-name:var(--font-sans)] truncate"
          title={label}
        >
          {abbrev}
        </span>
        <span className="text-sm font-mono font-bold text-[var(--color-text-primary)]">
          {value > 0 ? value.toFixed(1) : '—'}
        </span>
      </div>
      <div className="h-2 bg-[var(--color-surface-alt)] rounded-full overflow-hidden">
        {value > 0 && (
          <div
            className={cn('h-full rounded-full transition-all', color)}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function ExecutiveSummary({ scores }: ExecutiveSummaryProps) {
  const composite = useMemo(() => compositeAverage(scores), [scores]);
  const growth = useMemo(() => growthDelta(scores), [scores]);
  const hireSignal = useMemo(() => compositeHireSignal(scores), [scores]);
  const trend = useMemo(() => scoreTrend(scores), [scores]);
  const dims = useMemo(() => dimensionAverages(scores), [scores]);
  const latest = useMemo(() => {
    if (scores.length === 0) return null;
    return sessionAverage(scores[scores.length - 1]);
  }, [scores]);

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1 font-[family-name:var(--font-sans)]">
          Executive Summary
        </p>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
          Performance Trajectory
        </h2>
        {scores.length > 3 && (
          <p className="text-sm text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] italic mt-1">
            {trend === 'up'
              ? 'Your narrative structure has seen a significant lift in the last three sessions.'
              : trend === 'down'
                ? 'Scores have dipped recently — time to diagnose the bottleneck.'
                : 'Scores have been steady — look for the next lever to pull.'}
            {' '}We are now shifting focus toward{' '}
            <span className="text-[var(--color-accent)] font-semibold not-italic">
              Differentiation
            </span>
            — making your specific contributions feel indispensable.
          </p>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Composite Score */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 font-[family-name:var(--font-sans)]">
            Composite Score
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-[var(--color-accent)] font-mono">
              {composite > 0 ? composite.toFixed(1) : '—'}
            </span>
            <span className="text-sm text-[var(--color-text-muted)] font-mono">
              /5
            </span>
          </div>
          {latest !== null && latest !== composite && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              Latest: {latest.toFixed(1)}
            </p>
          )}
        </div>

        {/* Growth Delta */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 font-[family-name:var(--font-sans)]">
            Growth (30d)
          </p>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-4xl font-bold font-mono',
                growth !== null && growth >= 0
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-danger)]'
              )}
            >
              {growth !== null
                ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}`
                : '—'}
            </span>
            <TrendIcon
              className={cn(
                'h-5 w-5',
                trend === 'up'
                  ? 'text-[var(--color-success)]'
                  : trend === 'down'
                    ? 'text-[var(--color-danger)]'
                    : 'text-[var(--color-text-muted)]'
              )}
            />
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
            {scores.length} sessions tracked
          </p>
        </div>

        {/* Hire Signal */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 font-[family-name:var(--font-sans)]">
            Hire Signal
          </p>
          {hireSignal ? (
            <Badge
              variant={hireSignalVariant(hireSignal)}
              className="text-base px-3 py-1 font-bold"
            >
              {hireSignal === 'Strong Hire' ? '★ STRONG' : hireSignal.toUpperCase()}
            </Badge>
          ) : (
            <span className="text-4xl font-bold text-[var(--color-text-muted)] font-mono">
              —
            </span>
          )}
          {hireSignal && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
              Based on last {Math.min(scores.length, 5)} sessions
            </p>
          )}
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
        <div className="flex gap-6">
          <DimensionBar label="Substance" abbrev="SB. Substance" value={dims.substance} />
          <DimensionBar label="Structure" abbrev="SL. Structure" value={dims.structure} />
          <DimensionBar label="Relevance" abbrev="RL. Relevance" value={dims.relevance} />
          <DimensionBar label="Credibility" abbrev="CR. Credibility" value={dims.credibility} />
          <DimensionBar label="Differentiation" abbrev="DF. Diff" value={dims.differentiation} />
        </div>
      </div>
    </div>
  );
}

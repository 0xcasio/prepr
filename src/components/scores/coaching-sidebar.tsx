'use client';

import { useMemo } from 'react';
import { Target, BarChart3, Brain, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  CoachingStrategy,
  DrillProgression,
  ScoreEntry,
} from '@/lib/parser/types';
import { selfCalibrationSummary } from '@/lib/derived';

interface CoachingSidebarProps {
  strategy: CoachingStrategy;
  drill: DrillProgression;
  scores: ScoreEntry[];
}

// ── Helper ───────────────────────────────────────────────────────────────────

function strategyField(strategy: CoachingStrategy, key: string): string {
  return (
    strategy.fields.find((f) =>
      f.key.toLowerCase().includes(key.toLowerCase())
    )?.value ?? ''
  );
}

// ── Coaching Strategy Card ───────────────────────────────────────────────────

function StrategyCard({ strategy }: { strategy: CoachingStrategy }) {
  const bottleneck = strategyField(strategy, 'bottleneck');
  const approach = strategyField(strategy, 'current approach');
  const rationale = strategyField(strategy, 'rationale');
  const pivotIf = strategyField(strategy, 'pivot if');
  const rootCauses = strategyField(strategy, 'root causes');

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-[var(--color-accent)]" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] font-[family-name:var(--font-sans)]">
          Coaching Strategy
        </h3>
      </div>

      {/* Current Bottleneck */}
      {bottleneck && bottleneck !== '—' && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 font-[family-name:var(--font-sans)]">
            Current Bottleneck
          </p>
          <div className="flex flex-wrap gap-1.5">
            {bottleneck.split(/[,+]/).map((b, i) => (
              <Badge key={i} variant="warning" className="text-[10px]">
                {b.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Current Approach */}
      {approach && approach !== '—' && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 font-[family-name:var(--font-sans)]">
            Approach
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-[family-name:var(--font-body)]">
            {approach}
          </p>
        </div>
      )}

      {/* Rationale */}
      {rationale && rationale !== '—' && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 font-[family-name:var(--font-sans)]">
            Rationale
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] italic leading-relaxed font-[family-name:var(--font-body)]">
            {rationale}
          </p>
        </div>
      )}

      {/* Root Causes */}
      {rootCauses && rootCauses !== '—' && rootCauses !== '[]' && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertCircle className="h-3 w-3 text-[var(--color-warning)]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-warning)] font-[family-name:var(--font-sans)]">
              Root Causes
            </p>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {rootCauses.replace(/^\[|\]$/g, '')}
          </p>
        </div>
      )}

      {/* Pivot If */}
      {pivotIf && pivotIf !== '—' && (
        <div className="pt-3 border-t border-[var(--color-border-subtle)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1 font-[family-name:var(--font-sans)]">
            Pivot If
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] italic leading-relaxed">
            {pivotIf}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Drill Progression Card ───────────────────────────────────────────────────

function DrillProgressionCard({ drill }: { drill: DrillProgression }) {
  const stage = parseInt(drill.currentStage) || 0;
  const totalStages = 8;
  const pct = (stage / totalStages) * 100;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-[var(--color-accent)]" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] font-[family-name:var(--font-sans)]">
          Drill Progression
        </h3>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-sans)]">
          Stage {stage}
        </span>
        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
          {stage}/{totalStages}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-[var(--color-surface-alt)] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[var(--color-accent)] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stage dots */}
      <div className="flex justify-between">
        {Array.from({ length: totalStages }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-3 h-3 rounded-full border-2 transition-colors',
              i + 1 <= stage
                ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                : i + 1 === stage + 1
                  ? 'bg-transparent border-[var(--color-accent)]'
                  : 'bg-transparent border-[var(--color-border)]'
            )}
            title={`Stage ${i + 1}`}
          />
        ))}
      </div>

      {/* Gates & Revisit */}
      {drill.gatesPassed && drill.gatesPassed !== '[]' && (
        <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1 font-[family-name:var(--font-sans)]">
            Gates Passed
          </p>
          <p className="text-[10px] text-[var(--color-success)]">
            {drill.gatesPassed.replace(/^\[|\]$/g, '') || 'None yet'}
          </p>
        </div>
      )}

      {drill.revisitQueue && drill.revisitQueue !== '[]' && (
        <div className="mt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1 font-[family-name:var(--font-sans)]">
            Revisit Queue
          </p>
          <p className="text-[10px] text-[var(--color-warning)]">
            {drill.revisitQueue.replace(/^\[|\]$/g, '')}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Self-Calibration Card ────────────────────────────────────────────────────

function SelfCalibrationCard({ scores }: { scores: ScoreEntry[] }) {
  const calibration = useMemo(
    () => selfCalibrationSummary(scores),
    [scores]
  );

  const total =
    calibration.overCount + calibration.underCount + calibration.accurateCount;

  if (total === 0) return null;

  const segments = [
    {
      label: 'Over',
      count: calibration.overCount,
      color: 'bg-[var(--color-warning)]',
      textColor: 'text-[var(--color-warning)]',
    },
    {
      label: 'Accurate',
      count: calibration.accurateCount,
      color: 'bg-[var(--color-success)]',
      textColor: 'text-[var(--color-success)]',
    },
    {
      label: 'Under',
      count: calibration.underCount,
      color: 'bg-[var(--color-accent)]',
      textColor: 'text-[var(--color-accent)]',
    },
  ];

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-4 w-4 text-[var(--color-accent)]" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] font-[family-name:var(--font-sans)]">
          Self-Calibration
        </h3>
      </div>

      {/* Tendency */}
      <div className="mb-4">
        <Badge
          variant={
            calibration.tendency === 'well-calibrated'
              ? 'success'
              : calibration.tendency === 'over-rater'
                ? 'warning'
                : 'accent'
          }
          className="text-[10px]"
        >
          {calibration.tendency.replace('-', ' ')}
        </Badge>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        {segments.map(
          (seg) =>
            seg.count > 0 && (
              <div
                key={seg.label}
                className={cn('h-full', seg.color)}
                style={{ width: `${(seg.count / total) * 100}%` }}
              />
            )
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-between">
        {segments.map((seg) => (
          <div key={seg.label} className="text-center">
            <p className={cn('text-lg font-bold font-mono', seg.textColor)}>
              {seg.count}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
              {seg.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────

export function CoachingSidebar({
  strategy,
  drill,
  scores,
}: CoachingSidebarProps) {
  return (
    <div className="w-72 shrink-0 space-y-6">
      <StrategyCard strategy={strategy} />
      <DrillProgressionCard drill={drill} />
      <SelfCalibrationCard scores={scores} />
    </div>
  );
}

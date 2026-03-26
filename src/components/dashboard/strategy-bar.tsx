'use client';

import { Target, Brain, Rocket } from 'lucide-react';
import type { CoachingStrategy, DrillProgression } from '@/lib/parser/types';

interface StrategyBarProps {
  strategy: CoachingStrategy;
  drills: DrillProgression;
}

/** Extract a field value from the strategy's key-value fields. */
function strategyField(strategy: CoachingStrategy, key: string): string {
  return strategy.fields.find((f) => f.key.toLowerCase().includes(key.toLowerCase()))?.value ?? '';
}

/**
 * StrategyBar — three-column bar at the bottom of the dashboard.
 * Shows: The Bottleneck, Current Approach, Drill Stage (X/8).
 * Matches the design from dashboard_final_pass.
 */
export function StrategyBar({ strategy, drills }: StrategyBarProps) {
  const bottleneck = strategyField(strategy, 'primary bottleneck');
  const approach = strategyField(strategy, 'current approach');
  const rationale = strategyField(strategy, 'rationale');
  const currentStage = parseInt(drills.currentStage) || 1;
  const totalStages = 8;
  const progressPercent = (currentStage / totalStages) * 100;

  if (!bottleneck && !approach) return null;

  return (
    <section className="bg-[var(--color-surface-alt)] rounded-[var(--radius-lg)] p-8 relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)] opacity-[0.03] rounded-full -mr-20 -mt-20" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* The Bottleneck */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-[var(--color-accent)]" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              The Bottleneck
            </h4>
          </div>
          <p className="text-xl font-bold text-[var(--color-text-primary)] leading-tight">
            &ldquo;{bottleneck}&rdquo;
          </p>
          {rationale && (
            <p className="font-[family-name:var(--font-body)] text-[var(--color-text-secondary)] text-sm leading-relaxed line-clamp-3">
              {rationale}
            </p>
          )}
        </div>

        {/* Current Approach */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-[var(--color-success)]" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Current Approach
            </h4>
          </div>
          <p className="text-base font-semibold text-[var(--color-text-primary)]">
            {approach.split('—')[0].trim()}
          </p>
          {approach.includes('—') && (
            <p className="font-[family-name:var(--font-body)] text-[var(--color-text-secondary)] text-sm leading-relaxed line-clamp-3">
              {approach.split('—').slice(1).join('—').trim()}
            </p>
          )}
        </div>

        {/* Drill Stage */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-4 w-4 text-[var(--color-accent-muted)]" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Drill Stage
            </h4>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-extrabold text-[var(--color-text-primary)] leading-none">
              {String(currentStage).padStart(2, '0')}
            </span>
            <span className="text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] mb-1">
              / {String(totalStages).padStart(2, '0')}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wide">
            Foundation: Behavioral Core
          </p>
        </div>
      </div>
    </section>
  );
}

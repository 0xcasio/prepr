'use client';

import { useRouter } from 'next/navigation';
import { Target, Brain, Rocket, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/lib/hooks/use-chat';
import type { CoachingStrategy, DrillProgression } from '@/lib/parser/types';

interface StrategyBarProps {
  strategy: CoachingStrategy;
  drills: DrillProgression;
}

/** Extract a field value from the strategy's key-value fields. */
function strategyField(strategy: CoachingStrategy, key: string): string {
  return strategy.fields.find((f) => f.key.toLowerCase().includes(key.toLowerCase()))?.value ?? '';
}

/** Drill stage definitions — name, gate, and description */
const DRILL_STAGES: { name: string; gate: string; description: string }[] = [
  { name: 'Ladder', gate: 'Structure ≥ 3 on 3 rounds', description: 'Build clear STAR narratives' },
  { name: 'Pushback', gate: 'Credibility ≥ 3 under pressure', description: 'Hold ground when challenged' },
  { name: 'Pivot', gate: 'Relevance ≥ 3 when redirected', description: 'Adapt mid-answer gracefully' },
  { name: 'Gap', gate: 'Credibility ≥ 3 with gap handling', description: 'Own weaknesses honestly' },
  { name: 'Role', gate: 'Substance ≥ 3 under scrutiny', description: 'Specialist-level depth' },
  { name: 'Panel', gate: 'All dims ≥ 3 with personas', description: 'Multi-interviewer simulation' },
  { name: 'Stress', gate: 'All dims ≥ 3 max pressure', description: 'Worst-case scenario prep' },
  { name: 'Technical', gate: 'Structure + Substance ≥ 3', description: 'Technical communication' },
];

/**
 * StrategyBar — three-column bar at the bottom of the dashboard.
 * Shows: The Bottleneck, Current Approach, Drill Stage with name + gate.
 */
export function StrategyBar({ strategy, drills }: StrategyBarProps) {
  const router = useRouter();
  const { queueCommand } = useChat();

  const bottleneck = strategyField(strategy, 'primary bottleneck');
  const approach = strategyField(strategy, 'current approach');
  const rationale = strategyField(strategy, 'rationale');
  const currentStage = parseInt(drills.currentStage) || 1;
  const totalStages = 8;
  const progressPercent = (currentStage / totalStages) * 100;
  const stageInfo = DRILL_STAGES[currentStage - 1] ?? DRILL_STAGES[0];

  if (!bottleneck && !approach) return null;

  const handlePractice = () => {
    queueCommand(`practice ${stageInfo.name.toLowerCase()}`);
    router.push('/chat');
  };

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

        {/* Drill Stage — now with name, gate, and CTA */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-4 w-4 text-[var(--color-accent-muted)]" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Drill Stage
            </h4>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-[var(--color-text-primary)] leading-none">
              {String(currentStage).padStart(2, '0')}
            </span>
            <span className="text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] mb-0.5">
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
          <p className="text-sm font-semibold text-[var(--color-accent)] font-[family-name:var(--font-sans)]">
            {stageInfo.name} Drill
          </p>
          <p className="text-xs text-[var(--color-text-muted)] font-[family-name:var(--font-body)]">
            Advance: {stageInfo.gate}
          </p>
          <button
            onClick={handlePractice}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)]',
              'bg-[var(--color-accent)] text-white',
              'text-xs font-semibold font-[family-name:var(--font-sans)]',
              'hover:opacity-90 transition-opacity cursor-pointer',
              'mt-1'
            )}
          >
            <Dumbbell className="h-3 w-3" />
            Practice Now
          </button>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useMemo } from 'react';
import { BookOpen, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoachingState } from '@/lib/parser/types';
import { storyDevelopmentStatuses, competencyGaps } from '@/lib/derived';

interface StorySidebarProps {
  state: CoachingState;
}

// ── Story Stats ─────────────────────────────────────────────────────────────

function StoryStats({ state }: { state: CoachingState }) {
  const devStatuses = useMemo(
    () => storyDevelopmentStatuses(state),
    [state]
  );

  const total = state.storybank.length;
  const developed = devStatuses.filter((s) => s.isDeveloped).length;
  const needsWork = total - developed;

  // Average strength (only scored stories)
  const strengths = state.storybank
    .map((s) => parseFloat(s.strength))
    .filter((n) => !isNaN(n) && n > 0);
  const avgStrength =
    strengths.length > 0
      ? (strengths.reduce((a, b) => a + b, 0) / strengths.length).toFixed(1)
      : '—';

  // Stories used in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentlyUsed = state.storybank.filter((s) => {
    if (!s.lastUsed || s.lastUsed === '—') return false;
    const d = new Date(s.lastUsed + 'T00:00:00');
    return !isNaN(d.getTime()) && d >= thirtyDaysAgo;
  }).length;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4 font-[family-name:var(--font-sans)]">
        Story Stats
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-[var(--color-accent)] font-[family-name:var(--font-sans)]">
            {total}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-[family-name:var(--font-sans)]">
            Total Stories
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--color-success)] font-[family-name:var(--font-sans)]">
            {developed}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-[family-name:var(--font-sans)]">
            Developed
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--color-warning)] font-[family-name:var(--font-sans)]">
            {needsWork}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-[family-name:var(--font-sans)]">
            Needs Work
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-sans)]">
            {avgStrength}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-[family-name:var(--font-sans)]">
            Avg Strength
          </p>
        </div>
      </div>

      {recentlyUsed > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
          <p className="text-xs text-[var(--color-text-secondary)]">
            <span className="font-semibold">{recentlyUsed}</span> used in last 30 days
          </p>
        </div>
      )}
    </div>
  );
}

// ── Gap Analysis ────────────────────────────────────────────────────────────

function GapAnalysis({ state }: { state: CoachingState }) {
  // Primary skills covered
  const coveredSkills = useMemo(() => {
    const skills = new Set<string>();
    for (const entry of state.storybank) {
      if (entry.primarySkill && entry.primarySkill !== 'TBD') {
        skills.add(entry.primarySkill);
      }
    }
    return Array.from(skills).sort();
  }, [state.storybank]);

  // Competency gaps
  const gaps = useMemo(() => competencyGaps(state), [state]);

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4 font-[family-name:var(--font-sans)]">
        Gap Analysis
      </h3>

      {/* Covered Skills */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 font-[family-name:var(--font-sans)]">
          Skills Covered
        </p>
        <div className="space-y-1.5">
          {coveredSkills.map((skill) => (
            <div key={skill} className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[var(--color-success)] shrink-0" />
              <span className="text-xs text-[var(--color-text-secondary)]">
                {skill}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Competency Gaps */}
      {gaps.length > 0 && (
        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-warning)] mb-2 font-[family-name:var(--font-sans)]">
            Competency Gaps
          </p>
          <div className="space-y-1.5">
            {gaps.map((gap) => (
              <div key={gap} className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-[var(--color-warning)] shrink-0" />
                <span className="text-xs text-[var(--color-text-secondary)] capitalize">
                  {gap}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {gaps.length === 0 && (
        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2 text-[var(--color-success)]">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              All question bank competencies covered
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Sidebar ────────────────────────────────────────────────────────────

export function StorySidebar({ state }: StorySidebarProps) {
  return (
    <div className="w-72 shrink-0 space-y-6">
      <GapAnalysis state={state} />
      <StoryStats state={state} />
    </div>
  );
}

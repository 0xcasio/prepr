'use client';

import { useMemo } from 'react';
import { AlertTriangle, BarChart3, Building2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionBankEntry } from '@/lib/parser/types';

interface QuestionSidebarProps {
  questions: QuestionBankEntry[];
  effectivePatterns: string[];
  ineffectivePatterns: string[];
}

interface CompetencyStats {
  name: string;
  count: number;
  avgScore: number | null;
}

export function QuestionSidebar({
  questions,
  effectivePatterns,
  ineffectivePatterns,
}: QuestionSidebarProps) {
  // Stats
  const totalQuestions = questions.length;
  const scoredQuestions = questions.filter(
    (q) => q.score !== 'recall-only' && !isNaN(parseFloat(q.score))
  );
  const avgScore =
    scoredQuestions.length > 0
      ? scoredQuestions.reduce((s, q) => s + parseFloat(q.score), 0) /
        scoredQuestions.length
      : null;

  // Company breakdown
  const companyBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of questions) {
      map.set(q.company, (map.get(q.company) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([company, count]) => ({ company, count }));
  }, [questions]);

  // Competency stats
  const competencyStats = useMemo(() => {
    const map = new Map<string, { count: number; scores: number[] }>();
    for (const q of questions) {
      const comps = q.competency.split(/[\/,]/).map((c) => c.trim());
      for (const comp of comps) {
        if (!comp) continue;
        const entry = map.get(comp) ?? { count: 0, scores: [] };
        entry.count++;
        const score = parseFloat(q.score);
        if (!isNaN(score)) entry.scores.push(score);
        map.set(comp, entry);
      }
    }
    return [...map.entries()]
      .map(([name, { count, scores }]) => ({
        name,
        count,
        avgScore:
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : null,
      }))
      .sort((a, b) => b.count - a.count);
  }, [questions]);

  // Weak spots — competencies with avg below 3.0 (only scored ones)
  const weakSpots = competencyStats.filter(
    (c) => c.avgScore !== null && c.avgScore < 3.0
  );

  // Most tested competencies
  const topCompetencies = competencyStats.slice(0, 6);

  return (
    <div className="w-72 shrink-0 space-y-4">
      {/* Stats overview */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
            Overview
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              {totalQuestions}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-[family-name:var(--font-sans)] uppercase tracking-wider">
              Questions
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              {avgScore !== null ? avgScore.toFixed(1) : '—'}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-[family-name:var(--font-sans)] uppercase tracking-wider">
              Avg Score
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              {companyBreakdown.length}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-[family-name:var(--font-sans)] uppercase tracking-wider">
              Companies
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              {competencyStats.length}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-[family-name:var(--font-sans)] uppercase tracking-wider">
              Competencies
            </p>
          </div>
        </div>
      </div>

      {/* Weak spots */}
      {weakSpots.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
            <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Weak Spots
            </h3>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] font-[family-name:var(--font-body)] mb-3">
            Competencies scoring below 3.0
          </p>
          <div className="space-y-2">
            {weakSpots.map((ws) => (
              <div
                key={ws.name}
                className="flex items-center justify-between py-1"
              >
                <span className="text-xs font-[family-name:var(--font-body)] text-[var(--color-text-secondary)] truncate mr-2">
                  {ws.name}
                </span>
                <span className="text-xs font-mono font-semibold text-[var(--color-warning)] shrink-0">
                  {ws.avgScore!.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top competencies */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
            Most Tested
          </h3>
        </div>
        <div className="space-y-2">
          {topCompetencies.map((c) => (
            <div key={c.name} className="flex items-center justify-between py-1">
              <span className="text-xs font-[family-name:var(--font-body)] text-[var(--color-text-secondary)] truncate mr-2">
                {c.name}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">
                {c.count}x
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Company breakdown */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
            By Company
          </h3>
        </div>
        <div className="space-y-2">
          {companyBreakdown.map(({ company, count }) => (
            <div
              key={company}
              className="flex items-center justify-between py-1"
            >
              <span className="text-xs font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] truncate mr-2">
                {company}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">
                {count} Qs
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Effective patterns */}
      {effectivePatterns.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-5">
          <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-success)] mb-3">
            What Works
          </h3>
          <div className="space-y-2">
            {effectivePatterns.map((p, i) => (
              <p
                key={i}
                className="text-xs font-[family-name:var(--font-body)] text-[var(--color-text-secondary)] leading-relaxed"
              >
                {p.replace(/^-\s*\d{4}-\d{2}-\d{2}:\s*/, '')}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Ineffective patterns */}
      {ineffectivePatterns.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-5">
          <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-danger)] mb-3">
            What Needs Work
          </h3>
          <div className="space-y-2">
            {ineffectivePatterns.map((p, i) => (
              <p
                key={i}
                className="text-xs font-[family-name:var(--font-body)] text-[var(--color-text-secondary)] leading-relaxed"
              >
                {p.replace(/^-\s*\d{4}-\d{2}-\d{2}:\s*/, '')}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

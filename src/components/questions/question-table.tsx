'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionBankEntry } from '@/lib/parser/types';

interface QuestionTableProps {
  questions: QuestionBankEntry[];
}

type SortField = 'date' | 'company' | 'competency' | 'score';
type SortDir = 'asc' | 'desc';

/** Badge color for round type. */
function roundTypeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('behavioral')) return 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]';
  if (t.includes('technical') || t.includes('system')) return 'bg-purple-50 text-purple-700';
  if (t.includes('case') || t.includes('data') || t.includes('analytics')) return 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]';
  if (t.includes('culture')) return 'bg-[var(--color-success-subtle)] text-[var(--color-success)]';
  return 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]';
}

/** Badge color for outcome. */
function outcomeColor(outcome: string): string {
  const o = outcome.toLowerCase();
  if (o.includes('advanced')) return 'text-[var(--color-success)]';
  if (o.includes('rejected')) return 'text-[var(--color-danger)]';
  if (o.includes('offer')) return 'text-[var(--color-accent)]';
  return 'text-[var(--color-text-muted)]';
}

export function QuestionTable({ questions }: QuestionTableProps) {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [competencyFilter, setCompetencyFilter] = useState('all');
  const [roundFilter, setRoundFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Extract unique values for filters
  const companies = useMemo(
    () => [...new Set(questions.map((q) => q.company))].sort(),
    [questions]
  );
  const competencies = useMemo(() => {
    const all = questions.flatMap((q) =>
      q.competency.split(/[\/,]/).map((c) => c.trim())
    );
    return [...new Set(all)].filter(Boolean).sort();
  }, [questions]);
  const roundTypes = useMemo(
    () => [...new Set(questions.map((q) => q.roundType))].sort(),
    [questions]
  );

  // Filter
  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (companyFilter !== 'all' && q.company !== companyFilter) return false;
      if (roundFilter !== 'all' && q.roundType !== roundFilter) return false;
      if (
        competencyFilter !== 'all' &&
        !q.competency.toLowerCase().includes(competencyFilter.toLowerCase())
      )
        return false;
      if (
        search &&
        !q.question.toLowerCase().includes(search.toLowerCase()) &&
        !q.competency.toLowerCase().includes(search.toLowerCase()) &&
        !q.company.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [questions, search, companyFilter, competencyFilter, roundFilter]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = a.date.localeCompare(b.date);
          break;
        case 'company':
          cmp = a.company.localeCompare(b.company);
          break;
        case 'competency':
          cmp = a.competency.localeCompare(b.competency);
          break;
        case 'score': {
          const sa = parseFloat(a.score) || 0;
          const sb = parseFloat(b.score) || 0;
          cmp = sa - sb;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-3 w-3 text-[var(--color-text-muted)]" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-[family-name:var(--font-body)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)]"
        >
          <option value="all">All Companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
          className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)]"
        >
          <option value="all">All Rounds</option>
          {roundTypes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={competencyFilter}
          onChange={(e) => setCompetencyFilter(e.target.value)}
          className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)]"
        >
          <option value="all">All Competencies</option>
          {competencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--color-text-muted)] mb-3 font-[family-name:var(--font-body)]">
        {sorted.length} of {questions.length} questions
      </p>

      {/* Table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <th
                  className="px-4 py-3 text-left font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)] cursor-pointer select-none"
                  onClick={() => toggleSort('date')}
                >
                  <span className="flex items-center gap-1">
                    Date <SortIcon field="date" />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)] cursor-pointer select-none"
                  onClick={() => toggleSort('company')}
                >
                  <span className="flex items-center gap-1">
                    Company <SortIcon field="company" />
                  </span>
                </th>
                <th className="px-4 py-3 text-left font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)]">
                  Round
                </th>
                <th className="px-4 py-3 text-left font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)] min-w-[280px]">
                  Question
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)] cursor-pointer select-none"
                  onClick={() => toggleSort('competency')}
                >
                  <span className="flex items-center gap-1">
                    Competency <SortIcon field="competency" />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-center font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)] cursor-pointer select-none"
                  onClick={() => toggleSort('score')}
                >
                  <span className="flex items-center justify-center gap-1">
                    Score <SortIcon field="score" />
                  </span>
                </th>
                <th className="px-4 py-3 text-center font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)]">
                  Outcome
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((q, i) => {
                const isExpanded = expandedId === i;
                return (
                  <tr
                    key={i}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedId(isExpanded ? null : i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedId(isExpanded ? null : i);
                      }
                    }}
                    className={cn(
                      'border-b border-[var(--color-border-subtle)] cursor-pointer transition-colors',
                      'hover:bg-[var(--color-surface-alt)]',
                      isExpanded && 'bg-[var(--color-surface-alt)]'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {q.date}
                    </td>
                    <td className="px-4 py-3 font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] whitespace-nowrap">
                      {q.company}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-block px-2 py-0.5 rounded-[var(--radius-full)] text-[10px] font-semibold font-[family-name:var(--font-sans)]',
                          roundTypeColor(q.roundType)
                        )}
                      >
                        {q.roundType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-body)] text-[var(--color-text-primary)] leading-relaxed">
                      {isExpanded ? q.question : q.question.length > 80 ? q.question.slice(0, 77) + '...' : q.question}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] font-[family-name:var(--font-body)]">
                      {q.competency}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">
                      <span
                        className={cn(
                          'font-semibold',
                          q.score === 'recall-only'
                            ? 'text-[var(--color-text-muted)]'
                            : parseFloat(q.score) >= 4
                              ? 'text-[var(--color-success)]'
                              : parseFloat(q.score) >= 3
                                ? 'text-[var(--color-accent)]'
                                : 'text-[var(--color-warning)]'
                        )}
                      >
                        {q.score === 'recall-only' ? '—' : q.score}
                      </span>
                    </td>
                    <td className={cn('px-4 py-3 text-center text-xs font-semibold font-[family-name:var(--font-sans)] capitalize', outcomeColor(q.outcome))}>
                      {q.outcome}
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)] font-[family-name:var(--font-body)]"
                  >
                    No questions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
  StorybankEntry,
  StoryDetail,
  CoachingState,
} from '@/lib/parser/types';
import { storyDevelopmentStatuses } from '@/lib/derived';
import type { StoryDevelopmentStatus } from '@/lib/derived';

// ── Types ───────────────────────────────────────────────────────────────────

type TabFilter = 'all' | 'developed' | 'needs-work';

interface StoryTableProps {
  state: CoachingState;
}

// ── Skill Badge Colors ──────────────────────────────────────────────────────

function skillVariant(
  skill: string
): 'accent' | 'success' | 'warning' | 'neutral' {
  const lower = skill.toLowerCase();
  if (lower.includes('technical') || lower.includes('data') || lower.includes('ai'))
    return 'accent';
  if (lower.includes('growth') || lower.includes('experiment'))
    return 'success';
  if (lower.includes('stakeholder') || lower.includes('leadership') || lower.includes('alignment'))
    return 'warning';
  return 'neutral';
}

// ── Strength Display ────────────────────────────────────────────────────────

function StrengthDisplay({ value }: { value: string }) {
  if (!value || value === 'TBD' || value === '—') {
    return (
      <span className="text-xs text-[var(--color-text-muted)] italic">TBD</span>
    );
  }
  const num = parseFloat(value);
  if (isNaN(num)) {
    return (
      <span className="text-xs text-[var(--color-text-muted)]">{value}</span>
    );
  }
  const display = Number.isInteger(num) ? String(num) : num.toFixed(1);
  return (
    <span className="text-sm font-bold text-[var(--color-text-primary)] font-mono">
      {display}
      <span className="text-[var(--color-text-muted)]">/5</span>
    </span>
  );
}

// ── Last Used Display ───────────────────────────────────────────────────────

function formatLastUsed(val: string): string {
  if (!val || val === '—') return 'Never';
  const d = new Date(val + 'T00:00:00');
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── STAR Expanded View ──────────────────────────────────────────────────────

function StoryExpanded({ detail }: { detail: StoryDetail | undefined }) {
  if (!detail) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] italic py-4">
        Story details not yet developed. Use the CLI to run{' '}
        <code className="bg-[var(--color-surface-alt)] px-1.5 py-0.5 rounded text-xs font-mono">
          stories
        </code>{' '}
        and build this story.
      </p>
    );
  }

  const starSections = [
    { label: 'Situation', text: detail.situation },
    { label: 'Task', text: detail.task },
    { label: 'Action', text: detail.action },
    { label: 'Result', text: detail.result },
  ];

  const hasStar = starSections.some(
    (s) => s.text && s.text !== 'TBD' && s.text.length > 5
  );

  return (
    <div className="space-y-5">
      {/* STAR Grid */}
      {hasStar ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {starSections.map((section) => (
            <div key={section.label}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 font-[family-name:var(--font-sans)]">
                {section.label}
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-[family-name:var(--font-body)]">
                {section.text && section.text !== 'TBD'
                  ? section.text
                  : 'Not yet developed'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)] italic">
          STAR not yet developed. Run{' '}
          <code className="bg-[var(--color-surface-alt)] px-1.5 py-0.5 rounded text-xs font-mono">
            stories
          </code>{' '}
          in the CLI to build this story.
        </p>
      )}

      {/* Footer metadata */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[var(--color-border-subtle)]">
        {detail.earnedSecret && detail.earnedSecret !== 'TBD' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] font-[family-name:var(--font-sans)]">
              Earned Secret:
            </span>
            <span className="text-xs text-[var(--color-warning)] font-medium">
              {detail.earnedSecret}
            </span>
          </div>
        )}
        {detail.deployFor && detail.deployFor !== 'TBD' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] font-[family-name:var(--font-sans)]">
              Deploy for:
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {detail.deployFor}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function StoryTable({ state }: StoryTableProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');

  // Compute development statuses
  const devStatuses = useMemo(
    () => storyDevelopmentStatuses(state),
    [state]
  );

  const devStatusMap = useMemo(() => {
    const map = new Map<string, StoryDevelopmentStatus>();
    for (const s of devStatuses) map.set(s.id, s);
    return map;
  }, [devStatuses]);

  // Get unique skills for filter
  const skills = useMemo(() => {
    const set = new Set<string>();
    for (const entry of state.storybank) {
      if (entry.primarySkill && entry.primarySkill !== 'TBD') {
        set.add(entry.primarySkill);
      }
    }
    return Array.from(set).sort();
  }, [state.storybank]);

  // Filter stories
  const filteredStories = useMemo(() => {
    return state.storybank.filter((entry) => {
      // Tab filter
      if (activeTab !== 'all') {
        const status = devStatusMap.get(entry.id);
        if (activeTab === 'developed' && !status?.isDeveloped) return false;
        if (activeTab === 'needs-work' && status?.isDeveloped) return false;
      }

      // Skill filter
      if (skillFilter !== 'all' && entry.primarySkill !== skillFilter)
        return false;

      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchesEntry =
          entry.title.toLowerCase().includes(q) ||
          entry.id.toLowerCase().includes(q) ||
          entry.primarySkill.toLowerCase().includes(q) ||
          entry.earnedSecret.toLowerCase().includes(q);
        if (!matchesEntry) return false;
      }

      return true;
    });
  }, [state.storybank, activeTab, skillFilter, search, devStatusMap]);

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: state.storybank.length },
    {
      key: 'developed',
      label: 'Developed',
      count: devStatuses.filter((s) => s.isDeveloped).length,
    },
    {
      key: 'needs-work',
      label: 'Needs Work',
      count: devStatuses.filter((s) => !s.isDeveloped).length,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Tabs + Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 bg-[var(--color-surface-alt)] p-1 rounded-[var(--radius-sm)]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold rounded-[6px] transition-all font-[family-name:var(--font-sans)] uppercase tracking-wide',
                activeTab === tab.key
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-56 h-9 text-sm"
            aria-label="Search stories"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-alt)] rounded-[var(--radius-md)]">
        <div className="flex items-center gap-2">
          <label htmlFor="skill-filter" className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)]">
            Skill
          </label>
          <select
            id="skill-filter"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="border-none bg-[var(--color-surface)] rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium shadow-[var(--shadow-sm)] focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="all">All Competencies</option>
            {skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[var(--color-surface-alt)]">
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)]">
                ID
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)]">
                Title
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)]">
                Skill
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)]">
                Secret
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)] text-center">
                Str
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-[family-name:var(--font-sans)]">
                Last Used
              </th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {filteredStories.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const detail = state.storyDetails.find(
                (d) => d.id === entry.id
              );
              const devStatus = devStatusMap.get(entry.id);

              return (
                <tr
                  key={entry.id}
                  className={cn(
                    'transition-colors cursor-pointer group',
                    isExpanded
                      ? 'bg-[var(--color-surface-alt)]'
                      : 'hover:bg-[var(--color-surface-alt)]/50'
                  )}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : entry.id)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedId(isExpanded ? null : entry.id);
                    }
                  }}
                >
                  {/* Collapsed row */}
                  {!isExpanded ? (
                    <>
                      <td className="px-5 py-4 font-mono text-xs text-[var(--color-text-muted)]">
                        {entry.id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--color-text-primary)] text-sm font-[family-name:var(--font-sans)]">
                            {entry.title}
                          </span>
                          {devStatus && !devStatus.isDeveloped && (
                            <span className="w-2 h-2 rounded-full bg-[var(--color-warning)]" title="Needs work" role="img" aria-label="Needs work" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={skillVariant(entry.primarySkill)} className="text-[10px]">
                          {entry.primarySkill}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        {entry.earnedSecret && entry.earnedSecret !== 'TBD' ? (
                          <span className="text-xs text-[var(--color-warning)] font-medium line-clamp-1 max-w-[160px]">
                            {entry.earnedSecret}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)] italic">
                            TBD
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StrengthDisplay value={entry.strength} />
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--color-text-muted)]">
                        {formatLastUsed(entry.lastUsed)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-4 font-mono text-xs text-[var(--color-text-muted)] align-top pt-5">
                        {entry.id}
                      </td>
                      <td className="px-5 py-5" colSpan={5}>
                        <div className="space-y-4">
                          {/* Expanded header */}
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-[var(--color-accent)] font-[family-name:var(--font-sans)]">
                              {entry.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <Badge variant={skillVariant(entry.primarySkill)} className="text-[10px]">
                                {entry.primarySkill}
                              </Badge>
                              <StrengthDisplay value={entry.strength} />
                            </div>
                          </div>

                          {/* STAR content */}
                          <StoryExpanded detail={detail} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right align-top pt-5">
                        <ChevronDown className="h-4 w-4 text-[var(--color-accent)]" />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}

            {filteredStories.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)] italic"
                >
                  No stories match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

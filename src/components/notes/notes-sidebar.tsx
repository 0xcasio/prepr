'use client';

import { useMemo } from 'react';
import { BarChart3, Calendar, Tag, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoachingNote } from '@/lib/parser/types';

interface NotesSidebarProps {
  notes: CoachingNote[];
}

interface ParsedNote {
  date: string;
  text: string;
}

function parseNote(note: CoachingNote): ParsedNote {
  const match = note.raw.match(/^-\s*(\d{4}-\d{2}-\d{2}):\s*(.+)$/);
  if (match) return { date: match[1], text: match[2].trim() };
  return { date: '', text: note.raw.replace(/^-\s*/, '') };
}

function detectThemes(text: string): string[] {
  const themes: string[] = [];
  const t = text.toLowerCase();
  if (t.includes('freeze') || t.includes('nervous') || t.includes('anxiety') || t.includes('pressure') || t.includes('defensive'))
    themes.push('Mindset');
  if (t.includes('story') || t.includes('storybank') || t.includes('star') || t.includes('earned secret'))
    themes.push('Stories');
  if (t.includes('score') || t.includes('rating') || t.includes('self-rate') || t.includes('over-rate') || t.includes('under-rate') || t.includes('calibrat'))
    themes.push('Self-Assessment');
  if (t.includes('sql') || t.includes('technical') || t.includes('data') || t.includes('analytics'))
    themes.push('Technical');
  if (t.includes('offer') || t.includes('negotiat') || t.includes('salary') || t.includes('remote') || t.includes('surgery') || t.includes('medical'))
    themes.push('Personal');
  if (t.includes('company') || t.includes('role') || t.includes('interview') || t.includes('round') || t.includes('loop'))
    themes.push('Interview Intel');
  if (t.includes('practice') || t.includes('drill') || t.includes('rep') || t.includes('pacing'))
    themes.push('Practice Style');
  if (t.includes('gap') || t.includes('concern') || t.includes('weak') || t.includes('miss'))
    themes.push('Growth Area');
  if (t.includes('strength') || t.includes('strong') || t.includes('landed') || t.includes('highest-impact') || t.includes('prototype'))
    themes.push('Strength');
  return themes.length > 0 ? themes : ['General'];
}

const themeColors: Record<string, string> = {
  'Mindset': 'bg-purple-50 text-purple-700',
  'Stories': 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]',
  'Self-Assessment': 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]',
  'Technical': 'bg-sky-50 text-sky-700',
  'Personal': 'bg-pink-50 text-pink-700',
  'Interview Intel': 'bg-[var(--color-success-subtle)] text-[var(--color-success)]',
  'Practice Style': 'bg-orange-50 text-orange-700',
  'Growth Area': 'bg-red-50 text-red-700',
  'Strength': 'bg-emerald-50 text-emerald-700',
  'General': 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]',
};

export function NotesSidebar({ notes }: NotesSidebarProps) {
  const parsed = useMemo(() => notes.map(parseNote), [notes]);

  // Date range
  const dates = useMemo(() => {
    const d = parsed.filter((n) => n.date).map((n) => n.date).sort();
    return { earliest: d[0] ?? '', latest: d[d.length - 1] ?? '' };
  }, [parsed]);

  // Unique sessions (dates)
  const sessionCount = useMemo(() => {
    return new Set(parsed.filter((n) => n.date).map((n) => n.date)).size;
  }, [parsed]);

  // Theme breakdown
  const themeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of parsed) {
      for (const theme of detectThemes(n.text)) {
        map.set(theme, (map.get(theme) ?? 0) + 1);
      }
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([theme, count]) => ({ theme, count }));
  }, [parsed]);

  // Average note length
  const avgLength = useMemo(() => {
    if (parsed.length === 0) return 0;
    const total = parsed.reduce((sum, n) => sum + n.text.length, 0);
    return Math.round(total / parsed.length);
  }, [parsed]);

  // Key insights — longest notes (likely most important)
  const keyInsights = useMemo(() => {
    return [...parsed]
      .sort((a, b) => b.text.length - a.text.length)
      .slice(0, 3)
      .map((n) => ({
        date: n.date,
        preview: n.text.length > 100 ? n.text.slice(0, 97) + '...' : n.text,
      }));
  }, [parsed]);

  function formatShortDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="w-72 shrink-0 space-y-4">
      {/* Overview */}
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
              {notes.length}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-[family-name:var(--font-sans)] uppercase tracking-wider">
              Notes
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              {sessionCount}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-[family-name:var(--font-sans)] uppercase tracking-wider">
              Sessions
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              {themeBreakdown.length}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-[family-name:var(--font-sans)] uppercase tracking-wider">
              Themes
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              {avgLength}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-[family-name:var(--font-sans)] uppercase tracking-wider">
              Avg Chars
            </p>
          </div>
        </div>
      </div>

      {/* Date range */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
            Date Range
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-[family-name:var(--font-body)] text-[var(--color-text-secondary)]">
              First note
            </span>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              {formatShortDate(dates.earliest)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-[family-name:var(--font-body)] text-[var(--color-text-secondary)]">
              Latest note
            </span>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              {formatShortDate(dates.latest)}
            </span>
          </div>
        </div>
      </div>

      {/* Theme breakdown */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
            Themes
          </h3>
        </div>
        <div className="space-y-2">
          {themeBreakdown.map(({ theme, count }) => (
            <div key={theme} className="flex items-center justify-between py-1">
              <span
                className={cn(
                  'inline-block px-2 py-0.5 rounded-[var(--radius-full)] text-[10px] font-semibold font-[family-name:var(--font-sans)]',
                  themeColors[theme] ?? themeColors['General']
                )}
              >
                {theme}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">
                {count}x
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key insights */}
      {keyInsights.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-[var(--color-warning)]" />
            <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
              Deepest Observations
            </h3>
          </div>
          <div className="space-y-3">
            {keyInsights.map((insight, i) => (
              <div key={i} className="border-l-2 border-[var(--color-border)] pl-3">
                <p className="text-[10px] font-mono text-[var(--color-text-muted)] mb-1">
                  {formatShortDate(insight.date)}
                </p>
                <p className="text-xs font-[family-name:var(--font-body)] text-[var(--color-text-secondary)] leading-relaxed">
                  {insight.preview}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

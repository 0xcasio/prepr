'use client';

import { useState, useMemo } from 'react';
import { Search, Calendar, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoachingNote } from '@/lib/parser/types';

interface NotesTimelineProps {
  notes: CoachingNote[];
}

interface ParsedNote {
  date: string;
  text: string;
  raw: string;
}

function parseNote(note: CoachingNote): ParsedNote {
  // Format: "- YYYY-MM-DD: text..."
  const match = note.raw.match(/^-\s*(\d{4}-\d{2}-\d{2}):\s*(.+)$/);
  if (match) {
    return { date: match[1], text: match[2].trim(), raw: note.raw };
  }
  // Fallback — no date
  const text = note.raw.replace(/^-\s*/, '');
  return { date: '', text, raw: note.raw };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'No date';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Detect coaching theme from note text */
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

export function NotesTimeline({ notes }: NotesTimelineProps) {
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState('all');

  const parsed = useMemo(() => notes.map(parseNote), [notes]);

  // All unique themes
  const allThemes = useMemo(() => {
    const set = new Set<string>();
    for (const n of parsed) {
      for (const t of detectThemes(n.text)) set.add(t);
    }
    return [...set].sort();
  }, [parsed]);

  // Filter
  const filtered = useMemo(() => {
    return parsed.filter((n) => {
      if (search) {
        const s = search.toLowerCase();
        if (!n.text.toLowerCase().includes(s) && !n.date.includes(s)) return false;
      }
      if (themeFilter !== 'all') {
        const themes = detectThemes(n.text);
        if (!themes.includes(themeFilter)) return false;
      }
      return true;
    });
  }, [parsed, search, themeFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, ParsedNote[]>();
    for (const n of filtered) {
      const key = n.date || 'undated';
      const arr = map.get(key) ?? [];
      arr.push(n);
      map.set(key, arr);
    }
    // Sort dates descending
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="flex-1 min-w-0">
      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-[family-name:var(--font-body)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <select
          value={themeFilter}
          onChange={(e) => setThemeFilter(e.target.value)}
          className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-[family-name:var(--font-sans)] text-[var(--color-text-secondary)]"
        >
          <option value="all">All Themes</option>
          {allThemes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--color-text-muted)] mb-4 font-[family-name:var(--font-body)]">
        {filtered.length} of {parsed.length} notes
      </p>

      {/* Timeline */}
      <div className="space-y-6">
        {grouped.map(([date, notes]) => (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              <h3 className="text-sm font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
                {date === 'undated' ? 'No Date' : formatDate(date)}
              </h3>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>

            {/* Notes for this date */}
            <div className="space-y-2 ml-1 border-l-2 border-[var(--color-border)] pl-4">
              {notes.map((note, i) => {
                const themes = detectThemes(note.text);
                return (
                  <div
                    key={i}
                    className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4 hover:shadow-[var(--shadow-md)] transition-shadow"
                  >
                    <p className="text-sm font-[family-name:var(--font-body)] text-[var(--color-text-primary)] leading-relaxed">
                      {note.text}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {themes.map((theme) => (
                        <span
                          key={theme}
                          className={cn(
                            'inline-block px-2 py-0.5 rounded-[var(--radius-full)] text-[10px] font-semibold font-[family-name:var(--font-sans)]',
                            themeColors[theme] ?? themeColors['General']
                          )}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <StickyNote className="h-10 w-10 text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm text-[var(--color-text-muted)] font-[family-name:var(--font-body)]">
              No notes match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import {
  AlertTriangle,
  Brain,
  Check,
  ExternalLink,
  Play,
  Users,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FitBadge, StatusPill } from '@/components/shared';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { InterviewLoop, CompanyPattern } from '@/lib/parser/types';
import { field, getFit, companyInitial } from '@/lib/pipeline-helpers';

interface CompanyDetailProps {
  loop: InterviewLoop | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyPatterns: CompanyPattern[];
  onLogOutcome: () => void;
  onUpdateStatus: () => void;
}

/** Normalize status string to StatusPill type. */
function normalizeStatus(
  raw: string
): 'researched' | 'applied' | 'interviewing' | 'offer' | 'closed' | 'pending' {
  const lower = raw.toLowerCase();
  if (lower.includes('closed') || lower.includes('rejected') || lower.includes('paused'))
    return 'closed';
  if (lower.includes('offer')) return 'offer';
  if (lower.includes('interviewing') || lower.includes('assessment'))
    return 'interviewing';
  if (lower.includes('applied')) return 'applied';
  if (lower.includes('researched')) return 'researched';
  if (lower.includes('pending')) return 'pending';
  return 'interviewing';
}

/** Parse rounds completed field into individual rounds. */
function parseRounds(raw: string): Array<{ label: string; date?: string }> {
  if (!raw || raw === '[]' || raw === '—') return [];
  // Match bracket groups like [HR screen — 2026-03-02]
  const groups = raw.match(/\[[^\]]+\]/g);
  if (!groups) return [];

  return groups.map((g) => {
    const content = g.replace(/^\[|\]$/g, '').trim();
    // Try to extract date
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/);
    const date = dateMatch ? dateMatch[0] : undefined;
    // Label is everything before the date, cleaned up
    const label = content
      .replace(/\s*—?\s*\d{4}-\d{2}-\d{2}.*$/, '')
      .replace(/\s*,\s*$/, '')
      .trim();
    return { label: label || content, date };
  });
}

/** Parse concerns surfaced field. */
function parseConcerns(raw: string): string[] {
  if (!raw || raw === '[]' || raw === '—') return [];
  // Split by ]; [ or ; within brackets
  const content = raw.replace(/^\[|\]$/g, '');
  return content
    .split(/;\s*/)
    .map((c) => c.replace(/^\[|\]$/g, '').trim())
    .filter(Boolean);
}

/** Parse stories used field. */
function parseStories(raw: string): string[] {
  if (!raw || raw === '[]' || raw === '—') return [];
  const groups = raw.match(/\[[^\]]+\]/g);
  if (!groups) return [];
  return groups.map((g) => g.replace(/^\[|\]$/g, '').trim());
}

/** Parse interviewer intel into people entries. */
function parseInterviewerIntel(
  raw: string
): Array<{ name: string; detail: string; linkedin?: string }> {
  if (!raw || raw === '—') return [];
  // Split by major names (capitalized word pairs before parenthetical or comma)
  const entries: Array<{ name: string; detail: string; linkedin?: string }> = [];
  // Simple approach: split by period-space where next word is capitalized
  const parts = raw.split(/\.\s+(?=[A-Z])/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed.length < 5) continue;

    // Extract name (first two-three capitalized words)
    const nameMatch = trimmed.match(
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/
    );
    if (!nameMatch) continue;

    const name = nameMatch[1];
    const detail = trimmed.slice(name.length).replace(/^[,\s]+/, '').trim();

    // Check for LinkedIn URL
    // Only allow HTTPS LinkedIn URLs
    const linkedinMatch = detail.match(
      /https:\/\/(?:www\.)?linkedin\.com\/in\/[^\s)]+/
    );

    entries.push({
      name,
      detail: detail
        .replace(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s)]+/, '')
        .replace(/\(\s*\)/, '')
        .replace(/LinkedIn:\s*/, '')
        .trim()
        .slice(0, 120),
      linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
    });
  }

  return entries;
}

/** Format a date string for display. */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CompanyDetail({
  loop,
  open,
  onOpenChange,
  companyPatterns,
  onLogOutcome,
  onUpdateStatus,
}: CompanyDetailProps) {
  if (!loop) return null;

  const status = field(loop, 'status');
  const fit = getFit(loop);
  const nextRound = field(loop, 'next round');
  const rounds = parseRounds(field(loop, 'rounds completed'));
  const concerns = parseConcerns(field(loop, 'concerns surfaced'));
  const stories = parseStories(field(loop, 'stories used'));
  const intel = parseInterviewerIntel(field(loop, 'interviewer intel'));
  const keySignals = field(loop, 'key signals');
  const fitAssessment = field(loop, 'fit assessment');

  // Get company patterns for this loop
  const pattern = companyPatterns.find(
    (p) => p.company.toLowerCase() === loop.companyName.toLowerCase()
  );

  const hasNext = nextRound && nextRound !== 'TBD' && nextRound !== '—';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Header */}
            <SheetHeader className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] flex items-center justify-center text-white text-xl font-bold font-[family-name:var(--font-sans)]">
                  {companyInitial(loop.companyName)}
                </div>
                <div>
                  <SheetTitle className="text-xl font-bold">
                    {loop.companyName}
                  </SheetTitle>
                  <SheetDescription className="text-sm">
                    {status}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill status={normalizeStatus(status)} />
                {fit && <FitBadge fit={fit} />}
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Key Signals */}
              {keySignals && keySignals !== '—' && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3 font-[family-name:var(--font-sans)]">
                    Key Signals
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] italic font-[family-name:var(--font-body)] leading-relaxed">
                    {keySignals}
                  </p>
                </section>
              )}

              {/* Fit Assessment */}
              {fitAssessment && fitAssessment !== '—' && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3 font-[family-name:var(--font-sans)]">
                    Fit Assessment
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] font-[family-name:var(--font-body)] leading-relaxed">
                    {fitAssessment}
                  </p>
                </section>
              )}

              {/* Concerns Surfaced */}
              {concerns.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 text-[var(--color-danger)] text-xs font-bold mb-3 font-[family-name:var(--font-sans)]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-widest">
                      Concerns Surfaced
                    </span>
                  </div>
                  <div className="bg-[var(--color-danger-subtle)] p-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/10">
                    <ul className="space-y-2">
                      {concerns.map((c, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Company Patterns */}
              {pattern && pattern.bullets.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 text-[var(--color-accent)] text-xs font-bold mb-3 font-[family-name:var(--font-sans)]">
                    <Brain className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-widest">
                      Company Patterns
                    </span>
                  </div>
                  <div className="bg-[var(--color-surface-alt)] p-4 rounded-[var(--radius-md)]">
                    <ul className="text-[11px] text-[var(--color-text-secondary)] space-y-1.5 list-disc pl-4">
                      {pattern.bullets.map((b, i) => (
                        <li key={i} className="leading-relaxed">
                          {b.replace(/^-\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Interviewer Intel */}
              {intel.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 text-[var(--color-success)] text-xs font-bold mb-3 font-[family-name:var(--font-sans)]">
                    <Users className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-widest">
                      Interviewer Intel
                    </span>
                  </div>
                  <div className="bg-[var(--color-surface-alt)] p-4 rounded-[var(--radius-md)] space-y-3">
                    {intel.map((person, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-sans)]">
                            {person.name}
                          </p>
                          {person.detail && (
                            <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-2 mt-0.5">
                              {person.detail}
                            </p>
                          )}
                        </div>
                        {person.linkedin && (
                          <a
                            href={person.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] ml-2 mt-0.5"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Stories Used */}
              {stories.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3 font-[family-name:var(--font-sans)]">
                    Stories Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stories.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Round Timeline */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4 font-[family-name:var(--font-sans)]">
                  Round History
                </h3>
                <div className="space-y-0">
                  {rounds.map((round, i) => (
                    <div key={i} className="flex gap-3">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-[var(--color-success)] flex items-center justify-center text-white shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        {(i < rounds.length - 1 || hasNext) && (
                          <div className="w-0.5 flex-1 bg-[var(--color-border)] mt-1" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-5 min-w-0">
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-sans)]">
                          {round.label}
                        </h4>
                        {round.date && (
                          <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold tracking-tight mt-0.5">
                            Completed {formatDate(round.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Next round (upcoming) */}
                  {hasNext && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white shrink-0 ring-4 ring-[var(--color-accent-subtle)]">
                          <Play className="h-3 w-3" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-accent)] font-[family-name:var(--font-sans)]">
                          Next Up
                        </h4>
                        <p className="text-[10px] text-[var(--color-accent)] font-semibold uppercase tracking-tight mt-0.5">
                          {nextRound.length > 80
                            ? nextRound.slice(0, 77) + '...'
                            : nextRound}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {rounds.length === 0 && !hasNext && (
                    <p className="text-sm text-[var(--color-text-muted)] italic">
                      No rounds completed yet
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </ScrollArea>

        {/* Bottom action buttons */}
        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={onLogOutcome}>
              Log Outcome
            </Button>
            <Button onClick={onUpdateStatus}>Update Status</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

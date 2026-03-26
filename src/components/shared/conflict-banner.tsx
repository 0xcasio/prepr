'use client';

import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConflictBannerProps {
  /** Called when the user clicks "Refresh" to accept the external changes */
  onRefresh: () => void;
  /** Called when the user dismisses the banner */
  onDismiss: () => void;
  /** Optional custom message */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Banner shown when an external edit to coaching_state.md is detected
 * while the user has unsaved changes in a form, or when a write conflict occurs.
 *
 * Offers two actions:
 * - Refresh: discard local changes and reload from file
 * - Dismiss: close the banner and continue editing (user accepts risk of overwriting)
 */
export function ConflictBanner({
  onRefresh,
  onDismiss,
  message = 'coaching_state.md was modified externally. Your local view may be stale.',
  className,
}: ConflictBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3',
        'bg-[var(--color-warning-subtle)] border-[var(--color-warning)]',
        'text-[var(--color-text-primary)] text-sm',
        className
      )}
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 text-[var(--color-warning)] shrink-0" />
      <span className="flex-1">{message}</span>
      <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh
      </Button>
      <button
        onClick={onDismiss}
        className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        aria-label="Dismiss conflict warning"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

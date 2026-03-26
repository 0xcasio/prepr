'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CompanyCard } from './company-card';
import { cn } from '@/lib/utils';
import type { InterviewLoop } from '@/lib/parser/types';
import { PIPELINE_COLUMNS, groupByColumn } from '@/lib/pipeline-helpers';
import type { PipelineColumn } from '@/lib/pipeline-helpers';

interface KanbanBoardProps {
  loops: InterviewLoop[];
  onSelectLoop: (loop: InterviewLoop) => void;
}

/** Column accent colors. */
const columnStyles: Record<PipelineColumn, string> = {
  Researched: 'text-[var(--color-text-secondary)]',
  Applied: 'text-[var(--color-accent)]',
  Interviewing: 'text-[var(--color-accent)]',
  Offer: 'text-[var(--color-success)]',
  Closed: 'text-[var(--color-text-muted)]',
};

const columnBadgeVariant: Record<
  PipelineColumn,
  'neutral' | 'accent' | 'success' | 'warning'
> = {
  Researched: 'neutral',
  Applied: 'accent',
  Interviewing: 'accent',
  Offer: 'success',
  Closed: 'neutral',
};

/** Empty state for a column. */
function EmptyColumn({ column }: { column: PipelineColumn }) {
  const messages: Record<PipelineColumn, string> = {
    Researched: 'No companies researched yet',
    Applied: 'No pending applications',
    Interviewing: 'No active interviews',
    Offer: 'No offers yet',
    Closed: 'No closed loops',
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 opacity-50">
      <p className="text-xs font-[family-name:var(--font-sans)] text-[var(--color-text-muted)] text-center">
        {messages[column]}
      </p>
    </div>
  );
}

export function KanbanBoard({ loops, onSelectLoop }: KanbanBoardProps) {
  const groups = useMemo(() => groupByColumn(loops), [loops]);
  const [closedOpen, setClosedOpen] = useState(false);

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {PIPELINE_COLUMNS.map((column) => {
        const items = groups[column];
        const count = items.length;

        // Closed column is collapsible
        if (column === 'Closed') {
          return (
            <div key={column} className="w-72 min-w-72 flex flex-col gap-4">
              <Collapsible open={closedOpen} onOpenChange={setClosedOpen}>
                <CollapsibleTrigger className="flex items-center justify-between px-2 w-full group">
                  <h3
                    className={cn(
                      'font-semibold font-[family-name:var(--font-sans)] flex items-center gap-2 text-sm',
                      columnStyles[column]
                    )}
                  >
                    {closedOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    {column}
                    <Badge variant={columnBadgeVariant[column]} className="ml-1">
                      {count}
                    </Badge>
                  </h3>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-3 mt-4">
                    {items.length === 0 ? (
                      <EmptyColumn column={column} />
                    ) : (
                      items.map((loop) => (
                        <CompanyCard
                          key={loop.companyName}
                          loop={loop}
                          onClick={() => onSelectLoop(loop)}
                        />
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        }

        // Regular columns
        return (
          <div key={column} className="w-72 min-w-72 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h3
                className={cn(
                  'font-semibold font-[family-name:var(--font-sans)] flex items-center gap-2 text-sm',
                  columnStyles[column]
                )}
              >
                {column}
                <Badge variant={columnBadgeVariant[column]}>{count}</Badge>
              </h3>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {items.length === 0 ? (
                <EmptyColumn column={column} />
              ) : (
                items.map((loop) => (
                  <CompanyCard
                    key={loop.companyName}
                    loop={loop}
                    onClick={() => onSelectLoop(loop)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

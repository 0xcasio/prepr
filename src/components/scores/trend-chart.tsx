'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { ScoreEntry } from '@/lib/parser/types';

interface TrendChartProps {
  scores: ScoreEntry[];
}

interface ChartDataPoint {
  date: string;
  context: string;
  sub: number | null;
  str: number | null;
  rel: number | null;
  cred: number | null;
  diff: number | null;
  avg: number | null;
}

const DIMENSIONS = [
  { key: 'sub', label: 'Substance', color: 'var(--color-accent)' },
  { key: 'str', label: 'Structure', color: 'var(--color-success)' },
  { key: 'rel', label: 'Relevance', color: '#8B5CF6' },
  { key: 'cred', label: 'Credibility', color: 'var(--color-warning)' },
  { key: 'diff', label: 'Differentiation', color: 'var(--color-danger)' },
] as const;

function parseNum(val: string): number | null {
  if (!val || val === '—' || val === 'TBD') return null;
  const n = parseFloat(val);
  return isNaN(n) || n <= 0 ? null : n;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-3 shadow-[var(--shadow-md)] min-w-[180px]">
      <p className="text-xs font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-sans)]">
        {data.date}
      </p>
      <p className="text-[10px] text-[var(--color-text-muted)] mb-2 italic">
        {data.context}
      </p>
      <div className="space-y-1">
        {DIMENSIONS.map((dim) => {
          const val = data[dim.key as keyof ChartDataPoint] as number | null;
          return (
            <div key={dim.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: dim.color }}
                />
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  {dim.label}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-[var(--color-text-primary)]">
                {val !== null && val > 0 ? val.toFixed(1) : '—'}
              </span>
            </div>
          );
        })}
        <div className="border-t border-[var(--color-border-subtle)] pt-1 mt-1 flex items-center justify-between">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
            AVG
          </span>
          <span className="text-xs font-mono font-bold text-[var(--color-accent)]">
            {data.avg !== null && data.avg > 0 ? data.avg.toFixed(1) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function TrendChart({ scores }: TrendChartProps) {
  const [hiddenDims, setHiddenDims] = useState<Set<string>>(new Set());

  const chartData = useMemo(() => {
    return scores.map((s) => {
      const sub = parseNum(s.sub);
      const str = parseNum(s.str);
      const rel = parseNum(s.rel);
      const cred = parseNum(s.cred);
      const diff = parseNum(s.diff);
      const vals = [sub, str, rel, cred, diff].filter(
        (v): v is number => v !== null && v > 0
      );
      const avg =
        vals.length > 0
          ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
          : null;

      return {
        date: s.date,
        context: s.context,
        sub,
        str,
        rel,
        cred,
        diff,
        avg,
      };
    });
  }, [scores]);

  const toggleDim = (key: string) => {
    setHiddenDims((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (scores.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)] border border-[var(--color-border-subtle)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)] font-[family-name:var(--font-sans)]">
            Score Trend Chart
          </h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            Multi-dimensional growth over time (1-5 scale)
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{
                fontSize: 10,
                fill: 'var(--color-text-muted)',
              }}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              tickLine={false}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{
                fontSize: 10,
                fill: 'var(--color-text-muted)',
              }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            {DIMENSIONS.map((dim) => (
              <Line
                key={dim.key}
                type="monotone"
                dataKey={dim.key}
                stroke={dim.color}
                strokeWidth={hiddenDims.has(dim.key) ? 0 : 2}
                dot={
                  hiddenDims.has(dim.key)
                    ? false
                    : { r: 3, fill: dim.color, strokeWidth: 0 }
                }
                activeDot={
                  hiddenDims.has(dim.key)
                    ? false
                    : {
                        r: 5,
                        fill: dim.color,
                        stroke: 'var(--color-surface)',
                        strokeWidth: 2,
                      }
                }
                hide={hiddenDims.has(dim.key)}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
        {DIMENSIONS.map((dim) => {
          const isHidden = hiddenDims.has(dim.key);
          return (
            <button
              key={dim.key}
              onClick={() => toggleDim(dim.key)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-[10px] font-semibold uppercase tracking-wide transition-all font-[family-name:var(--font-sans)]',
                isHidden
                  ? 'opacity-40 line-through text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'
              )}
            >
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full shrink-0',
                  isHidden && 'opacity-30'
                )}
                style={{ backgroundColor: dim.color }}
              />
              {dim.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

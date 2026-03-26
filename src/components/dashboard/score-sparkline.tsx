'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ScoreEntry } from '@/lib/parser/types';
import { sessionAverage, compositeAverage, growthDelta } from '@/lib/derived';

interface ScoreSparklineProps {
  scores: ScoreEntry[];
}

interface ChartDataPoint {
  date: string;
  avg: number;
  context: string;
}

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
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 shadow-[var(--shadow-md)]">
      <p className="text-xs font-semibold text-[var(--color-text-primary)]">{data.date}</p>
      <p className="text-xs text-[var(--color-text-secondary)]">{data.context}</p>
      <p className="text-sm font-mono font-semibold text-[var(--color-accent)] mt-1">
        {data.avg.toFixed(1)} / 5.0
      </p>
    </div>
  );
}

/**
 * ScoreSparkline — mini area chart showing score trend over time.
 * Y-axis 1-5, hover tooltip with date + context + score.
 * Shows composite average and growth delta below the chart.
 */
export function ScoreSparkline({ scores }: ScoreSparklineProps) {
  if (scores.length === 0) return null;

  const chartData: ChartDataPoint[] = scores.map((s) => ({
    date: s.date,
    avg: parseFloat(sessionAverage(s).toFixed(2)),
    context: s.context,
  }));

  const avgScore = compositeAverage(scores);
  const growth = growthDelta(scores);

  return (
    <section className="lg:col-span-2 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
          Recent Scores
        </h3>
        <span className="font-mono text-xs bg-[var(--color-surface-alt)] px-2.5 py-1 rounded-[var(--radius-sm)]">
          AVG: {avgScore.toFixed(1)} / 5.0
        </span>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
        {/* Chart */}
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis domain={[1, 5]} hide />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avg"
                stroke="var(--color-accent)"
                strokeWidth={2.5}
                fill="url(#scoreGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: 'var(--color-accent)',
                  stroke: 'var(--color-surface)',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics below chart */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest">
                Latest
              </p>
              <p className="font-mono text-lg text-[var(--color-accent)]">
                {chartData[chartData.length - 1].avg.toFixed(1)} / 5.0
              </p>
            </div>
            {growth !== null && (
              <>
                <div className="w-px h-8 bg-[var(--color-border-subtle)]" />
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest">
                    Growth
                  </p>
                  <p
                    className={`font-mono text-lg ${
                      growth >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                    }`}
                  >
                    {growth >= 0 ? '+' : ''}
                    {growth.toFixed(1)}
                  </p>
                </div>
              </>
            )}
          </div>
          <p className="text-sm font-[family-name:var(--font-body)] italic text-[var(--color-text-secondary)]">
            {scores.length} sessions tracked
          </p>
        </div>
      </div>
    </section>
  );
}

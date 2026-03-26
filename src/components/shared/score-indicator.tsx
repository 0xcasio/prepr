import { cn } from "@/lib/utils";

interface ScoreIndicatorProps {
  score: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 4) return "text-[var(--color-success)]";
  if (score >= 3) return "text-[var(--color-warning)]";
  return "text-[var(--color-danger)]";
}

function getScoreBg(score: number): string {
  if (score >= 4) return "bg-[var(--color-success-subtle)]";
  if (score >= 3) return "bg-[var(--color-warning-subtle)]";
  return "bg-[var(--color-danger-subtle)]";
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export function ScoreIndicator({
  score,
  max = 5,
  size = "md",
  className,
}: ScoreIndicatorProps) {
  const displayScore = score.toFixed(1);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-sm)] font-mono font-medium",
        getScoreColor(score),
        getScoreBg(score),
        sizeClasses[size],
        className
      )}
      title={`${displayScore} / ${max}.0`}
    >
      {displayScore}
    </div>
  );
}

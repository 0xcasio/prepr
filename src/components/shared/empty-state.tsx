import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center text-center py-20",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-alt)] mb-4">
        <Icon className="h-6 w-6 text-[var(--color-text-muted)]" />
      </div>
      <h2 className="text-xl font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)] mb-2">
        {title}
      </h2>
      <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
        {description}
      </p>
    </div>
  );
}

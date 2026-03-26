import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FitLevel = "strong" | "moderate" | "weak" | "ideal";

interface FitBadgeProps {
  fit: FitLevel;
  className?: string;
}

const fitConfig: Record<
  FitLevel,
  { label: string; variant: "success" | "warning" | "danger" | "accent" }
> = {
  strong: { label: "STRONG", variant: "success" },
  ideal: { label: "IDEAL", variant: "accent" },
  moderate: { label: "MODERATE", variant: "warning" },
  weak: { label: "WEAK", variant: "danger" },
};

export function FitBadge({ fit, className }: FitBadgeProps) {
  const config = fitConfig[fit];
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

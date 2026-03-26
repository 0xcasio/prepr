import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status =
  | "researched"
  | "applied"
  | "interviewing"
  | "offer"
  | "closed"
  | "archived"
  | "advanced"
  | "rejected"
  | "pending";

interface StatusPillProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<
  Status,
  { label: string; variant: "accent" | "success" | "warning" | "danger" | "neutral" }
> = {
  researched: { label: "Researched", variant: "neutral" },
  applied: { label: "Applied", variant: "accent" },
  interviewing: { label: "Interviewing", variant: "accent" },
  offer: { label: "Offer", variant: "success" },
  closed: { label: "Closed", variant: "danger" },
  archived: { label: "Archived", variant: "neutral" },
  advanced: { label: "Advanced", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  pending: { label: "Pending", variant: "warning" },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

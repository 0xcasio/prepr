import { EmptyState } from "@/components/shared/empty-state";
import { TrendingUp } from "lucide-react";

export default function ScoresPage() {
  return (
    <EmptyState
      icon={TrendingUp}
      title="Scores & Progress"
      description="Performance trends, self-calibration, and coaching trajectory will appear here."
    />
  );
}

import { EmptyState } from "@/components/shared/empty-state";
import { Kanban } from "lucide-react";

export default function PipelinePage() {
  return (
    <EmptyState
      icon={Kanban}
      title="Pipeline"
      description="Kanban view of your interview loops by status will appear here."
    />
  );
}

import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function NotesPage() {
  return (
    <EmptyState
      icon={FileText}
      title="Coaching Notes"
      description="Freeform observations and coaching context. Coming in Phase 2."
    />
  );
}

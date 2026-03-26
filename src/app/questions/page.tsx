import { EmptyState } from "@/components/shared/empty-state";
import { HelpCircle } from "lucide-react";

export default function QuestionsPage() {
  return (
    <EmptyState
      icon={HelpCircle}
      title="Question Bank"
      description="Searchable repository of all interview questions encountered. Coming in Phase 2."
    />
  );
}

import { EmptyState } from "@/components/shared/empty-state";
import { BookOpen } from "lucide-react";

export default function StorybankPage() {
  return (
    <EmptyState
      icon={BookOpen}
      title="Storybank"
      description="Browse, search, and manage your interview stories here."
    />
  );
}

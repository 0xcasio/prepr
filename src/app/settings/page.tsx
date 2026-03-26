import { EmptyState } from "@/components/shared/empty-state";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <EmptyState
      icon={Settings}
      title="Settings"
      description="Profile display, file path configuration, and display preferences. Coming in Phase 2."
    />
  );
}

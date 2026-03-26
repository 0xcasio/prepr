"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  BookOpen,
  TrendingUp,
  HelpCircle,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: Kanban,
  },
  {
    label: "Storybank",
    href: "/storybank",
    icon: BookOpen,
  },
  {
    label: "Scores & Progress",
    href: "/scores",
    icon: TrendingUp,
  },
];

const secondaryItems = [
  {
    label: "Question Bank",
    href: "/questions",
    icon: HelpCircle,
  },
  {
    label: "Coaching Notes",
    href: "/notes",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white text-sm font-semibold font-[family-name:var(--font-sans)]">
          IC
        </div>
        <span className="text-base font-semibold font-[family-name:var(--font-sans)] text-[var(--color-text-primary)]">
          Interview Coach
        </span>
      </div>

      <Separator />

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors font-[family-name:var(--font-sans)]",
                isActive
                  ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="py-3">
          <Separator />
        </div>

        {secondaryItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors font-[family-name:var(--font-sans)]",
                isActive
                  ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

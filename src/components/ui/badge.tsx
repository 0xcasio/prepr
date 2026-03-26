import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-full)] px-3 py-1 text-xs font-medium font-[family-name:var(--font-sans)] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "border border-border text-foreground",
        success:
          "border-transparent bg-[var(--color-success-subtle)] text-[var(--color-success)]",
        warning:
          "border-transparent bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
        danger:
          "border-transparent bg-[var(--color-danger-subtle)] text-[var(--color-danger)]",
        accent:
          "border-transparent bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
        neutral:
          "border-transparent bg-[var(--color-surface-alt)] text-[var(--color-neutral)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

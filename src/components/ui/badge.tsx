import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/** Small neutral pill — categories, tags, status chips. */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Uppercase tracked accent label that anchors a section heading. */
export function Eyebrow({ children, className }: BadgeProps) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-brand",
        className,
      )}
    >
      {children}
    </p>
  );
}

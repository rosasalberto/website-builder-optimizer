import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  default: "bg-background text-foreground",
  muted: "bg-muted text-foreground",
  dark: "bg-[var(--color-dark-background)] text-[var(--color-dark-foreground)]",
} as const;

export interface SectionProps {
  children: ReactNode;
  /** Background tone. Defaults to `default` (white canvas). */
  tone?: keyof typeof TONES;
  /** Landmark element. Defaults to "section". */
  as?: ElementType;
  /** Drops the default vertical padding when false (caller controls spacing). */
  padded?: boolean;
  className?: string;
  /** Forwarded so callers can wire aria-labelledby / aria-label / data-section. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  id?: string;
}

/**
 * Vertical-rhythm wrapper. Every page section sits inside one so spacing,
 * borders, and background tone stay consistent site-wide.
 */
export function Section({
  children,
  tone = "default",
  as: Tag = "section",
  padded = true,
  className,
  ...rest
}: SectionProps) {
  return (
    <Tag className={cn(TONES[tone], padded && "py-16 md:py-24", className)} {...rest}>
      {children}
    </Tag>
  );
}

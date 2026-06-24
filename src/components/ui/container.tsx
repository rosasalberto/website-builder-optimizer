import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
} as const;

export interface ContainerProps {
  children: ReactNode;
  /** Max width preset. Defaults to `xl`. */
  size?: keyof typeof SIZES;
  /** Render as a different element (e.g. "header", "section"). Defaults to "div". */
  as?: ElementType;
  className?: string;
}

/** Centered, padded content well. The single source of horizontal rhythm. */
export function Container({ children, size = "xl", as: Tag = "div", className }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-6", SIZES[size], className)}>{children}</Tag>
  );
}

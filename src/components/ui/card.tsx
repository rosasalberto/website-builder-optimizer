import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

/** Bordered surface on the white canvas. The base building block for grids. */
export function Card({ children, as: Tag = "div", className }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius)] border border-line bg-background p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-lg font-semibold tracking-tight", className)}>{children}</h3>;
}

export function CardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-2 text-sm leading-relaxed text-muted-foreground", className)}>
      {children}
    </p>
  );
}

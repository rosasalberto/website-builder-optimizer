import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export interface StatItem {
  /** Headline figure, e.g. "99.9%", "5 min", "120+". */
  value: ReactNode;
  /** One concrete, non-adjective label. */
  label: string;
}

export interface StatsRowProps {
  stats: StatItem[];
  tone?: "default" | "muted" | "dark";
}

const TONE_CLS = {
  default: "bg-background text-foreground border-y border-line",
  muted: "bg-muted text-foreground",
  dark: "bg-[var(--color-dark-background)] text-[var(--color-dark-foreground)]",
} as const;

const COLS = ["", "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-2 md:grid-cols-4"];

/** Horizontal band of big numbers with short labels. */
export function StatsRow({ stats, tone = "default" }: StatsRowProps) {
  if (stats.length === 0) return null;
  const cols = COLS[Math.min(stats.length, 4)] ?? "grid-cols-2 md:grid-cols-4";
  return (
    <section data-section="stats-row" aria-label="Key metrics" className={cn("py-14 md:py-16", TONE_CLS[tone])}>
      <Container>
        <dl className={cn("grid gap-8 text-center", cols)}>
          {stats.map((s, i) => (
            <div key={i}>
              <dd className="text-4xl font-semibold tracking-tight md:text-5xl">{s.value}</dd>
              <dt
                className={cn(
                  "mt-2 text-sm",
                  tone === "dark" ? "text-[var(--color-dark-foreground)]/70" : "text-muted-foreground",
                )}
              >
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

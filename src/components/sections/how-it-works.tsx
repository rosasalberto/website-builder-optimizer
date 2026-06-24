import { Container } from "@/components/ui/container";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

export interface HowItWorksStep {
  /** Short verb-led title, e.g. "Connect", "Configure", "Ship". */
  title: string;
  description: string;
}

export interface HowItWorksProps {
  eyebrow?: string;
  title: string;
  description?: string;
  steps: HowItWorksStep[];
}

/** Numbered ordered list of steps; column count adapts to the step count. */
export function HowItWorks({ eyebrow, title, description, steps }: HowItWorksProps) {
  if (steps.length === 0) return null;
  const n = steps.length;
  const grid =
    n === 2
      ? "sm:grid-cols-2"
      : n === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : n >= 5
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-3";
  return (
    <section data-section="how-it-works" className="border-t border-line bg-muted py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} className="mb-12" />
        <ol className={cn("grid grid-cols-1 gap-4", grid)}>
          {steps.map((step, i) => (
            <li key={i} className="h-full rounded-[var(--radius)] border border-line bg-background p-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

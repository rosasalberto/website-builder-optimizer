import type { ComponentType, SVGProps } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

/** Any icon component that accepts SVG props (e.g. a lucide-react icon). */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export interface FeatureGridItem {
  /** Optional icon component rendered in the card header. */
  icon?: IconComponent;
  title: string;
  description: string;
}

export interface FeatureGridProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  items: FeatureGridItem[];
  /** Column count at large breakpoints. Defaults to 3. */
  columns?: 2 | 3 | 4;
}

const COLS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/** Responsive grid of feature cards, each with an optional icon. */
export function FeatureGrid({
  eyebrow,
  title,
  description,
  items,
  columns = 3,
}: FeatureGridProps) {
  if (items.length === 0) return null;
  return (
    <section data-section="feature-grid" className="bg-background py-16 md:py-24">
      <Container>
        {title && (
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            className="mb-12"
          />
        )}
        <ul className={cn("grid grid-cols-1 gap-4", COLS[columns])}>
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <li key={i}>
                <Card as="article" className="h-full">
                  {Icon && (
                    <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-muted text-brand">
                      <Icon aria-hidden className="size-5" />
                    </span>
                  )}
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </Card>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

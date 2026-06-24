import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

export interface PricingTier {
  name: string;
  /** Headline price, e.g. "$0", "$29", "Custom". */
  price: string;
  /** Optional billing cadence, e.g. "/month", "per seat". */
  period?: string;
  description?: string;
  features: string[];
  cta: { label: string; href: string };
  /** Visually emphasize this tier as the recommended one. */
  featured?: boolean;
}

export interface PricingTiersProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  tiers: PricingTier[];
}

/** Three-column pricing card grid; the featured tier is highlighted. */
export function PricingTiers({ eyebrow, title, description, tiers }: PricingTiersProps) {
  if (tiers.length === 0) return null;
  return (
    <section data-section="pricing-tiers" className="bg-background py-16 md:py-24">
      <Container>
        {title && (
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="center"
            className="mb-12"
          />
        )}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <article
              key={i}
              className={cn(
                "flex h-full flex-col rounded-[var(--radius)] border bg-background p-8",
                tier.featured ? "border-brand ring-1 ring-brand" : "border-line",
              )}
            >
              {tier.featured && (
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-brand-foreground">
                  Recommended
                </span>
              )}
              <h3 className="text-lg font-semibold tracking-tight">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
              </div>
              {tier.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tier.description}</p>
              )}
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.cta.href}
                className={cn(
                  buttonVariants({ variant: tier.featured ? "primary" : "outline", size: "md" }),
                  "mt-8 w-full",
                )}
              >
                {tier.cta.label}
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

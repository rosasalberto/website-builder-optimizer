import {
  Hero,
  PricingTiers,
  Faq,
  CtaSection,
  type HeroProps,
  type PricingTiersProps,
  type FaqProps,
  type CtaSectionProps,
} from "@/components/sections";

export interface PricingArchetypeProps {
  hero: HeroProps;
  pricing: PricingTiersProps;
  faq: FaqProps;
  cta: CtaSectionProps;
}

/** Pricing page composition: compact Hero → PricingTiers → Faq → Cta. */
export function PricingArchetype({ hero, pricing, faq, cta }: PricingArchetypeProps) {
  return (
    <>
      <Hero {...hero} compact />
      <PricingTiers {...pricing} />
      <Faq {...faq} />
      <CtaSection {...cta} />
    </>
  );
}

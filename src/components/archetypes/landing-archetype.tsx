import {
  Hero,
  FeatureList,
  StatsRow,
  FeatureGrid,
  Faq,
  CtaSection,
  type HeroProps,
  type FeatureListProps,
  type StatsRowProps,
  type FeatureGridProps,
  type FaqProps,
  type CtaSectionProps,
} from "@/components/sections";

export interface LandingArchetypeProps {
  hero: HeroProps;
  featureList: FeatureListProps;
  stats?: StatsRowProps;
  featureGrid?: FeatureGridProps;
  faq: FaqProps;
  cta: CtaSectionProps;
}

/** Marketing landing composition (e.g. /features): Hero → FeatureList → Stats → FeatureGrid → Faq → Cta. */
export function LandingArchetype({
  hero,
  featureList,
  stats,
  featureGrid,
  faq,
  cta,
}: LandingArchetypeProps) {
  return (
    <>
      <Hero {...hero} />
      <FeatureList {...featureList} />
      {stats && <StatsRow {...stats} />}
      {featureGrid && <FeatureGrid {...featureGrid} />}
      <Faq {...faq} />
      <CtaSection {...cta} />
    </>
  );
}

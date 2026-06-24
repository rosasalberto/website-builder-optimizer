import {
  Hero,
  LogoCloud,
  FeatureGrid,
  HowItWorks,
  StatsRow,
  Faq,
  CtaSection,
  type HeroProps,
  type LogoCloudProps,
  type FeatureGridProps,
  type HowItWorksProps,
  type StatsRowProps,
  type FaqProps,
  type CtaSectionProps,
} from "@/components/sections";

export interface HomeArchetypeProps {
  hero: HeroProps;
  logos: LogoCloudProps;
  features: FeatureGridProps;
  how: HowItWorksProps;
  stats: StatsRowProps;
  faq: FaqProps;
  cta: CtaSectionProps;
}

/** Home page composition: Hero → LogoCloud → FeatureGrid → HowItWorks → StatsRow → Faq → Cta. */
export function HomeArchetype({ hero, logos, features, how, stats, faq, cta }: HomeArchetypeProps) {
  return (
    <>
      <Hero {...hero} />
      <LogoCloud {...logos} />
      <FeatureGrid {...features} />
      <HowItWorks {...how} />
      <StatsRow {...stats} />
      <Faq {...faq} />
      <CtaSection {...cta} />
    </>
  );
}

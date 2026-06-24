import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { LandingArchetype } from "@/components/archetypes";
import type {
  FeatureListRow,
  FeatureGridItem,
  StatItem,
  FaqItem,
} from "@/components/sections";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "features" });
  return buildMetadata({
    locale,
    path: "/features",
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

export default async function FeaturesPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("features");

  return (
    <LandingArchetype
      hero={{
        eyebrow: t("hero.eyebrow"),
        title: t("hero.title"),
        description: t("hero.description"),
        primaryCta: { label: t("hero.primaryCta"), href: "/contact" },
        secondaryCta: { label: t("hero.secondaryCta"), href: "/pricing" },
      }}
      featureList={{ rows: t.raw("list.rows") as FeatureListRow[] }}
      stats={{ stats: t.raw("stats.items") as StatItem[], tone: "muted" }}
      featureGrid={{
        eyebrow: t("grid.eyebrow"),
        title: t("grid.title"),
        description: t("grid.description"),
        items: t.raw("grid.items") as FeatureGridItem[],
      }}
      faq={{
        eyebrow: t("faq.eyebrow"),
        title: t("faq.title"),
        items: t.raw("faq.items") as FaqItem[],
      }}
      cta={{
        eyebrow: t("cta.eyebrow"),
        title: t("cta.title"),
        description: t("cta.description"),
        primaryCta: { label: t("cta.primary"), href: "/contact" },
        secondaryCta: { label: t("cta.secondary"), href: "/contact" },
        tone: "dark",
      }}
    />
  );
}

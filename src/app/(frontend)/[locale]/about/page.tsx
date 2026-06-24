import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { Hero, StatsRow, FeatureGrid, CtaSection } from "@/components/sections";
import type { StatItem, FeatureGridItem } from "@/components/sections";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildMetadata({
    locale,
    path: "/about",
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

export default async function AboutPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <>
      <Hero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        primaryCta={{ label: t("hero.primaryCta"), href: "/features" }}
        secondaryCta={{ label: t("hero.secondaryCta"), href: "/contact" }}
        compact
      />
      <StatsRow stats={t.raw("stats.items") as StatItem[]} tone="muted" />
      <FeatureGrid
        eyebrow={t("values.eyebrow")}
        title={t("values.title")}
        description={t("values.description")}
        items={t.raw("values.items") as FeatureGridItem[]}
        columns={4}
      />
      <CtaSection
        eyebrow={t("cta.eyebrow")}
        title={t("cta.title")}
        description={t("cta.description")}
        primaryCta={{ label: t("cta.primary"), href: "/contact" }}
        secondaryCta={{ label: t("cta.secondary"), href: "/contact" }}
        tone="dark"
      />
    </>
  );
}

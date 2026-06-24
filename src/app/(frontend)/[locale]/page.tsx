import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { HomeArchetype } from "@/components/archetypes";
import type {
  FeatureGridItem,
  HowItWorksStep,
  StatItem,
  FaqItem,
  LogoCloudItem,
} from "@/components/sections";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale,
    path: "/",
    title: t("homeTitle"),
    description: t("homeDescription"),
  });
}

// Placeholder partner wordmarks — a generic template ships without logo assets,
// so LogoCloud renders these names as text. Replace with real logos per brand.
const PLACEHOLDER_LOGOS: LogoCloudItem[] = [
  { name: "Aurora" },
  { name: "Beacon" },
  { name: "Cobalt" },
  { name: "Drift" },
  { name: "Ember" },
  { name: "Forge" },
];

export default async function HomePage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <HomeArchetype
      hero={{
        eyebrow: t("eyebrow"),
        title: t("title"),
        description: t("subtitle"),
        primaryCta: { label: t("primaryCta"), href: "/contact" },
        secondaryCta: { label: t("secondaryCta"), href: "/features" },
      }}
      logos={{ title: t("logosTitle"), logos: PLACEHOLDER_LOGOS }}
      features={{
        eyebrow: t("features.eyebrow"),
        title: t("features.title"),
        description: t("features.description"),
        items: t.raw("features.items") as FeatureGridItem[],
      }}
      how={{
        eyebrow: t("how.eyebrow"),
        title: t("how.title"),
        description: t("how.description"),
        steps: t.raw("how.steps") as HowItWorksStep[],
      }}
      stats={{ stats: t.raw("stats.items") as StatItem[] }}
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
        secondaryCta: { label: t("cta.secondary"), href: "/pricing" },
        tone: "dark",
      }}
    />
  );
}

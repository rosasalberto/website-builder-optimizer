import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { PricingArchetype } from "@/components/archetypes";
import type { PricingTier, FaqItem } from "@/components/sections";

type Params = { params: Promise<{ locale: string }> };

/** Shape of a tier entry in messages (cta href is wired here, not in copy). */
interface TierMessage {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaLabel: string;
  featured?: boolean;
}

// Per-tier destinations, aligned by position to pricing.tiers.items.
const TIER_HREFS = ["/contact", "/contact", "/contact"];

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return buildMetadata({
    locale,
    path: "/pricing",
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

export default async function PricingPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");

  const tierMessages = t.raw("tiers.items") as TierMessage[];
  const tiers: PricingTier[] = tierMessages.map((tier, i) => ({
    name: tier.name,
    price: tier.price,
    period: tier.period,
    description: tier.description,
    features: tier.features,
    featured: tier.featured,
    cta: { label: tier.ctaLabel, href: TIER_HREFS[i] ?? "/contact" },
  }));

  return (
    <PricingArchetype
      hero={{
        eyebrow: t("hero.eyebrow"),
        title: t("hero.title"),
        description: t("hero.description"),
        primaryCta: { label: t("hero.primaryCta"), href: "/contact" },
        secondaryCta: { label: t("hero.secondaryCta"), href: "/contact" },
      }}
      pricing={{
        eyebrow: t("tiers.eyebrow"),
        title: t("tiers.title"),
        description: t("tiers.description"),
        tiers,
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

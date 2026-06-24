import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { LegalArchetype, type LegalSection } from "@/components/archetypes";
import { formatDate } from "@/lib/utils";

type Params = { params: Promise<{ locale: string; slug: string }> };

/** The static set of legal documents this template ships. */
const LEGAL_SLUGS = ["privacy", "terms"] as const;
type LegalSlug = (typeof LEGAL_SLUGS)[number];

/** Single source for the "last updated" stamp shown on every legal page. */
const LAST_UPDATED_ISO = "2026-01-01";

const isLegalSlug = (s: string): s is LegalSlug => (LEGAL_SLUGS as readonly string[]).includes(s);

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLegalSlug(slug)) return {};
  const t = await getTranslations({ locale, namespace: "legal" });
  const sections = t.raw(`${slug}.sections`) as LegalSection[];
  return buildMetadata({
    locale,
    path: `/legal/${slug}`,
    title: t(`${slug}.title`),
    description: sections[0]?.body[0] ?? t(`${slug}.title`),
  });
}

export default async function LegalPage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <LegalArchetype
      title={t(`${slug}.title`)}
      updatedLabel={t("lastUpdated", { date: formatDate(LAST_UPDATED_ISO, locale) })}
      sections={t.raw(`${slug}.sections`) as LegalSection[]}
    />
  );
}

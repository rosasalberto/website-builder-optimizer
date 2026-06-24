import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE, SITE_URL, DEFAULT_LOCALE, canonicalUrl, hreflangMap, isProdEnv } from "@/config/site";

export interface BuildMetadataOptions {
  locale: string;
  /** Locale-agnostic path, e.g. "/pricing", "/blog/my-post", or "/" for home. */
  path: string;
  title?: string;
  /** i18n key "namespace.key" resolved via next-intl (root scope). */
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  /** Absolute URL or path; defaults to the dynamic /api/og card. */
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[] };
}

function applyTemplate(title: string): string {
  const tpl = SITE.seo.titleTemplate || "%s";
  return tpl.includes("%s") ? tpl.replace("%s", title) : `${title}`;
}

function toAbsolute(image: string): string {
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

/**
 * The single source of page metadata: canonical + full hreflang map + OG +
 * Twitter + env-aware robots. Every page calls this from generateMetadata.
 */
export async function buildMetadata(opts: BuildMetadataOptions): Promise<Metadata> {
  const { locale, path, type = "website", noindex, article } = opts;

  const t = await getTranslations({ locale });
  const title =
    opts.title ?? (opts.titleKey && t.has(opts.titleKey) ? t(opts.titleKey) : undefined);
  const description =
    opts.description ??
    (opts.descriptionKey && t.has(opts.descriptionKey) ? t(opts.descriptionKey) : undefined);

  const isHome = path === "/" || path === "";
  const finalTitle = title
    ? isHome
      ? title
      : applyTemplate(title)
    : SITE.brand.name;

  const canonical = canonicalUrl(locale, path);
  const languages = hreflangMap(path);
  const ogImage = opts.image
    ? toAbsolute(opts.image)
    : `${SITE_URL}/api/og?title=${encodeURIComponent(title ?? SITE.brand.name)}`;

  const indexable = isProdEnv && !noindex;

  return {
    metadataBase: new URL(SITE_URL),
    title: finalTitle,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type,
      title: finalTitle,
      description,
      url: canonical,
      siteName: SITE.brand.name,
      locale: locale.replace("-", "_"),
      images: [{ url: ogImage, width: 1200, height: 630, alt: finalTitle }],
      ...(type === "article" && article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description,
      site: SITE.seo.twitterHandle,
      images: [ogImage],
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    ...(SITE.analytics.gscVerification
      ? { verification: { google: SITE.analytics.gscVerification } }
      : {}),
    other: { "x-default-locale": DEFAULT_LOCALE },
  };
}

/**
 * Typed, derived constants from site.config.ts. Import from here (not the raw
 * config) across the app so a rebrand flows everywhere from one edit.
 */
import { siteConfig } from "../../site.config";

export const SITE = siteConfig;

export const LOCALES = siteConfig.domain.locales.map((l) => l.code);
export const DEFAULT_LOCALE = siteConfig.domain.defaultLocale;
export const SITE_URL = siteConfig.domain.url.replace(/\/$/, "");
export const BRAND = siteConfig.brand.name;

export type Locale = (typeof LOCALES)[number];

/** hreflang code for a given locale. */
export const hreflangFor = (code: string): string =>
  siteConfig.domain.locales.find((l) => l.code === code)?.hreflang ?? code;

/** Text direction for a locale. */
export const dirFor = (code: string): "ltr" | "rtl" =>
  siteConfig.domain.locales.find((l) => l.code === code)?.dir ?? "ltr";

/** Full { hreflang -> absolute URL } map for a path, incl. x-default. */
export const hreflangMap = (path: string): Record<string, string> => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const map: Record<string, string> = {};
  for (const l of siteConfig.domain.locales) {
    const prefix = l.code === DEFAULT_LOCALE ? "" : `/${l.code}`;
    map[l.hreflang] = `${SITE_URL}${prefix}${clean === "/" ? "" : clean}` || SITE_URL;
  }
  map["x-default"] = `${SITE_URL}${clean === "/" ? "" : clean}`;
  return map;
};

/** Absolute canonical URL for a locale + path (default locale unprefixed). */
export const canonicalUrl = (locale: string, path: string): string => {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${clean}` || SITE_URL;
};

export const isProdEnv =
  (process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV) ===
  "production";

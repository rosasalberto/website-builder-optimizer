import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { DEFAULT_LOCALE } from "@/config/site";

/** Deep-merge `source` onto `base` (base = English fallback). */
function deepMerge<T extends Record<string, unknown>>(base: T, source: Partial<T>): T {
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(source)) {
    const s = (source as Record<string, unknown>)[key];
    const b = out[key];
    if (s && typeof s === "object" && !Array.isArray(s) && b && typeof b === "object") {
      out[key] = deepMerge(b as Record<string, unknown>, s as Record<string, unknown>);
    } else if (s !== undefined && s !== null && s !== "") {
      out[key] = s;
    }
  }
  return out as T;
}

async function load(locale: string): Promise<Record<string, unknown>> {
  return (await import(`../../messages/${locale}.json`)).default;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Every locale deep-merges on top of the default-locale catalog, so a missing
  // key never throws — it falls back to the default-locale string.
  const base = await load(DEFAULT_LOCALE);
  const messages =
    locale === DEFAULT_LOCALE ? base : deepMerge(base, await load(locale).catch(() => ({})));

  return { locale, messages };
});

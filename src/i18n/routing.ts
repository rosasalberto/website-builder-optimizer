import { defineRouting } from "next-intl/routing";
import { LOCALES, DEFAULT_LOCALE } from "@/config/site";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // Default locale is unprefixed (/about), others are prefixed (/es/about).
  localePrefix: "as-needed",
});

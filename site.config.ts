/**
 * site.config.ts — THE SINGLE REBRAND SURFACE
 * ------------------------------------------------------------------
 * Edit this one file (plus theme.config.ts and /public/logos) to turn
 * this template into your own site. Everything downstream — i18n,
 * Payload localization, SEO metadata, hreflang, sitemap, JSON-LD,
 * navigation, footer, the .claude skills — derives from here.
 *
 * Values can be overridden at runtime via NEXT_PUBLIC_* env vars where
 * noted, so the same build can be re-pointed without code changes.
 */

export interface SiteLocale {
  /** URL + i18n code, e.g. "en", "es", "pt-BR". Must match Payload locale codes. */
  code: string;
  /** hreflang value emitted in <link rel="alternate">, e.g. "en", "pt-BR". */
  hreflang: string;
  /** Human label shown in the locale switcher. */
  label: string;
  /** Text direction. */
  dir: "ltr" | "rtl";
}

export interface SiteConfig {
  brand: {
    name: string;
    legalName: string;
    tagline: string;
    /** One-line description used in meta + JSON-LD. */
    description: string;
    logo: { light: string; dark: string; mark: string };
    favicon: string;
  };
  domain: {
    /** Canonical absolute URL, no trailing slash. Override with NEXT_PUBLIC_SITE_URL. */
    url: string;
    defaultLocale: string;
    locales: SiteLocale[];
  };
  nav: {
    header: { label: string; href: string }[];
    footer: { title: string; links: { label: string; href: string }[] }[];
    cta: { label: string; href: string };
  };
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  org: {
    founders: string[];
    foundedYear: number;
    email: string;
    address: { country: string; region?: string; locality?: string };
  };
  analytics: {
    /** Public IDs only — never secrets. */
    gtmId?: string;
    ga4Id?: string;
    posthogKey?: string;
    gscVerification?: string;
  };
  features: {
    blog: boolean;
    pages: boolean;
    leadForm: boolean;
    search: boolean;
  };
  seo: {
    /** Path under /public used as the default OG image. */
    defaultOgImage: string;
    twitterHandle?: string;
    /** next/metadata title template, %s is the page title. */
    titleTemplate: string;
  };
}

export const siteConfig = {
  brand: {
    name: "Acme",
    legalName: "Acme Inc.",
    tagline: "The fastest way to launch a perfectly optimized website.",
    description:
      "A config-driven, SEO + GEO optimized, multi-locale Next.js site template with its own CMS and an autonomous growth toolchain.",
    logo: {
      light: "/logos/logo-light.svg",
      dark: "/logos/logo-dark.svg",
      mark: "/logos/mark.svg",
    },
    favicon: "/favicon.ico",
  },
  domain: {
    url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://example.com",
    defaultLocale: "en",
    locales: [
      { code: "en", hreflang: "en", label: "English", dir: "ltr" },
      { code: "es", hreflang: "es", label: "Español", dir: "ltr" },
      { code: "fr", hreflang: "fr", label: "Français", dir: "ltr" },
      { code: "de", hreflang: "de", label: "Deutsch", dir: "ltr" },
    ],
  },
  nav: {
    header: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
    ],
    footer: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "/legal/privacy" },
          { label: "Terms", href: "/legal/terms" },
        ],
      },
    ],
    cta: { label: "Get started", href: "/contact" },
  },
  social: {
    twitter: "https://twitter.com/acme",
    linkedin: "https://www.linkedin.com/company/acme",
    github: "https://github.com/rosasalberto/website-builder-optimizer",
  },
  org: {
    founders: ["Founder Name"],
    foundedYear: 2026,
    email: "hello@example.com",
    address: { country: "US", region: "CA", locality: "San Francisco" },
  },
  analytics: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID,
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  features: {
    blog: true,
    pages: false,
    leadForm: true,
    search: false,
  },
  seo: {
    defaultOgImage: "/og/default.png",
    twitterHandle: "@acme",
    titleTemplate: "%s — Acme",
  },
} satisfies SiteConfig;

export type { SiteConfig as SiteConfigType };

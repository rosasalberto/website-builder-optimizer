import { createElement } from "react";
import { SITE, SITE_URL } from "@/config/site";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = Record<string, any>;

/** XSS-safe <script type="application/ld+json"> renderer. Accepts `data` or `item`. */
export function JsonLd({ data, item }: { data?: Json | Json[]; item?: Json | Json[] }) {
  const payload = data ?? item ?? {};
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: json },
  });
}

export function organizationLd(): Json {
  const sameAs = Object.values(SITE.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.brand.legalName || SITE.brand.name,
    alternateName: SITE.brand.name,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE.brand.logo.mark}`,
    description: SITE.brand.description,
    foundingDate: String(SITE.org.foundedYear),
    email: SITE.org.email,
    ...(sameAs.length ? { sameAs } : {}),
    address: {
      "@type": "PostalAddress",
      addressCountry: SITE.org.address.country,
      ...(SITE.org.address.region ? { addressRegion: SITE.org.address.region } : {}),
      ...(SITE.org.address.locality ? { addressLocality: SITE.org.address.locality } : {}),
    },
  };
}

export function websiteLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.brand.name,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function articleLd(p: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authors?: { name: string; url?: string; sameAs?: string[] }[];
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    url: p.url,
    mainEntityOfPage: p.url,
    ...(p.image ? { image: p.image } : {}),
    ...(p.datePublished ? { datePublished: p.datePublished } : {}),
    ...(p.dateModified ? { dateModified: p.dateModified } : {}),
    author: (p.authors?.length ? p.authors : [{ name: SITE.brand.name }]).map((a) => ({
      "@type": "Person",
      name: a.name,
      ...(a.url ? { url: a.url } : {}),
      ...(a.sameAs?.length ? { sameAs: a.sameAs } : {}),
    })),
    publisher: {
      "@type": "Organization",
      name: SITE.brand.name,
      logo: { "@type": "ImageObject", url: `${SITE_URL}${SITE.brand.logo.mark}` },
    },
  };
}

type FaqInput = { q: string; a: string } | { question: string; answer: string };

export function faqLd(items: FaqInput[]): Json {
  const get = (it: FaqInput) => ({
    q: "q" in it ? it.q : it.question,
    a: "a" in it ? it.a : it.answer,
  });
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => {
      const { q, a } = get(it);
      return {
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      };
    }),
  };
}

/** GEO: mark passages AI engines may read aloud / extract. */
export function speakableLd(cssSelectors: string[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: { "@type": "SpeakableSpecification", cssSelector: cssSelectors },
  };
}

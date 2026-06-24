import { hreflangMap, canonicalUrl, DEFAULT_LOCALE } from "@/config/site";
import { escapeXml } from "./routes";

export const URLSET_OPEN =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
  `xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
export const URLSET_CLOSE = `</urlset>`;
export const SITEMAP_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

/** A single <url> entry with full hreflang alternates (incl. x-default). */
export function urlEntry(
  path: string,
  opts: { lastmod?: string; priority?: number; changefreq?: string } = {},
): string {
  const loc = canonicalUrl(DEFAULT_LOCALE, path);
  const langs = hreflangMap(path);
  const alternates = Object.entries(langs)
    .map(
      ([hreflang, href]) =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`,
    )
    .join("\n");
  return (
    `  <url>\n` +
    `    <loc>${escapeXml(loc)}</loc>\n` +
    (opts.lastmod ? `    <lastmod>${escapeXml(opts.lastmod)}</lastmod>\n` : "") +
    (opts.changefreq ? `    <changefreq>${opts.changefreq}</changefreq>\n` : "") +
    (opts.priority != null ? `    <priority>${opts.priority.toFixed(1)}</priority>\n` : "") +
    `${alternates}\n` +
    `  </url>`
  );
}

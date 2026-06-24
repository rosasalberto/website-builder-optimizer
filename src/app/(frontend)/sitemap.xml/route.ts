import { SITE_URL } from "@/config/site";
import { escapeXml } from "@/lib/seo/routes";
import { getBlogSitemapPageCount } from "@/lib/cms/posts";

export const runtime = "nodejs";
export const revalidate = 3600;

const CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

/** Sitemap index → the static-pages shard + the N blog shards. */
export async function GET() {
  const blogPages = await getBlogSitemapPageCount();
  const now = new Date().toISOString();

  const sitemaps = [
    `${SITE_URL}/sitemap/core.xml`,
    ...Array.from({ length: blogPages }, (_, i) => `${SITE_URL}/sitemap/blog/${i + 1}.xml`),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemaps
      .map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc><lastmod>${now}</lastmod></sitemap>`)
      .join("\n") +
    `\n</sitemapindex>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml", "Cache-Control": CACHE },
  });
}

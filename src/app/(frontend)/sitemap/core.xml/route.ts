import { STATIC_ROUTES } from "@/lib/seo/routes";
import { URLSET_OPEN, URLSET_CLOSE, SITEMAP_CACHE, urlEntry } from "@/lib/seo/sitemap-xml";

export const runtime = "nodejs";
export const revalidate = 3600;

/** Static marketing pages, each with full hreflang alternates. */
export async function GET() {
  const now = new Date().toISOString();
  const body =
    `${URLSET_OPEN}\n` +
    STATIC_ROUTES.map((r) =>
      urlEntry(r.path, { lastmod: now, priority: r.priority, changefreq: r.changefreq }),
    ).join("\n") +
    `\n${URLSET_CLOSE}`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml", "Cache-Control": SITEMAP_CACHE },
  });
}

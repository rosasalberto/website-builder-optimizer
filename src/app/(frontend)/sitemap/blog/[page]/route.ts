import { URLSET_OPEN, URLSET_CLOSE, SITEMAP_CACHE, urlEntry } from "@/lib/seo/sitemap-xml";
import { getPostSlugsForSitemap } from "@/lib/cms/posts";

export const runtime = "nodejs";
export const revalidate = 3600;

/**
 * One blog sitemap shard. The URL is /sitemap/blog/<n>.xml — App Router can't
 * mix a static ".xml" suffix with a dynamic segment, so the [page] param
 * captures "<n>.xml" and we strip it. Each shard streams ≤5000 posts from the
 * CMS (slug + updatedAt only) with full hreflang alternates.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ page: string }> }) {
  const { page } = await ctx.params;
  const n = parseInt(page.replace(/\.xml$/, ""), 10);
  const rows = Number.isFinite(n) && n > 0 ? await getPostSlugsForSitemap(n) : [];

  const body =
    `${URLSET_OPEN}\n` +
    rows
      .map((row) =>
        urlEntry(`/blog/${row.slug}`, {
          lastmod: row.updatedAt,
          priority: 0.7,
          changefreq: "weekly",
        }),
      )
      .join("\n") +
    `\n${URLSET_CLOSE}`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml", "Cache-Control": SITEMAP_CACHE },
  });
}

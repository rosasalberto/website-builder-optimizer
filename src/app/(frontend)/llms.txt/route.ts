import { SITE, SITE_URL, DEFAULT_LOCALE, LOCALES } from "@/config/site";
import { STATIC_ROUTES, labelForPath } from "@/lib/seo/routes";
import { getPosts } from "@/lib/cms/posts";

export const runtime = "nodejs";
export const revalidate = 3600;

/** llmstxt.org file — a machine-readable map for AI crawlers (GEO). */
export async function GET() {
  const { posts } = await getPosts({ locale: DEFAULT_LOCALE, limit: 50 });

  let out = `# ${SITE.brand.name}\n\n`;
  out += `> ${SITE.brand.tagline}\n> ${SITE.brand.description}\n\n`;

  out += `## Core pages\n\n`;
  for (const r of STATIC_ROUTES) {
    out += `- [${labelForPath(r.path)}](${SITE_URL}${r.path === "/" ? "" : r.path})\n`;
  }

  if (posts.length) {
    out += `\n## Blog\n\n`;
    for (const p of posts) {
      out += `- [${p.title}](${SITE_URL}/blog/${p.slug})${p.excerpt ? ` — ${p.excerpt}` : ""}\n`;
    }
  }

  out += `\n## Locales\n\n${LOCALES.join(", ")}\n`;

  return new Response(out, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

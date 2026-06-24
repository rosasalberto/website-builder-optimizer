import { SITE_URL, isProdEnv } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-static";

// Served as an explicit route handler (not the robots.ts metadata convention)
// because the sibling [locale] dynamic segment would otherwise capture
// "/robots.txt" as a locale. An explicit static route wins over [locale].
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Bingbot",
  "CCBot",
];

export function GET(): Response {
  let body: string;
  if (!isProdEnv) {
    body = `User-agent: *\nDisallow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  } else {
    const general = "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /404";
    const ai = AI_CRAWLERS.map((bot) => `User-agent: ${bot}\nAllow: /`).join("\n\n");
    body = `${general}\n\n${ai}\n\nHost: ${SITE_URL}\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  }
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

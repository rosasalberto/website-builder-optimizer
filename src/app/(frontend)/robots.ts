import type { MetadataRoute } from "next";
import { SITE_URL, isProdEnv } from "@/config/site";

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

export default function robots(): MetadataRoute.Robots {
  // Non-production deploys must never be indexed.
  if (!isProdEnv) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: `${SITE_URL}/sitemap.xml`,
    };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/404"] },
      // Explicitly welcome AI crawlers to the marketing surface (GEO).
      ...AI_CRAWLERS.map((bot) => ({ userAgent: bot, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

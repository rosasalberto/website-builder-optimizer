/**
 * Static route registry + tiny XML/text helpers shared by the sitemap and
 * llms.txt routes. The marketing surface of the template is small and
 * hand-curated here; the blog is sharded dynamically from the CMS.
 */

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface StaticRoute {
  /** Locale-agnostic path, leading slash, no trailing slash (except home "/"). */
  path: string;
  /** Sitemap <priority>, 0.0–1.0. */
  priority: number;
  /** Sitemap <changefreq>. */
  changefreq: ChangeFreq;
}

/** Hand-curated static pages. Order = sitemap + llms.txt listing order. */
export const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/features", priority: 0.8, changefreq: "monthly" },
  { path: "/pricing", priority: 0.9, changefreq: "weekly" },
  { path: "/about", priority: 0.6, changefreq: "monthly" },
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
  { path: "/blog", priority: 0.8, changefreq: "daily" },
  { path: "/legal/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/legal/terms", priority: 0.3, changefreq: "yearly" },
];

/** XML-escape a value for safe inclusion in sitemap <loc>/attributes. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Humanized label for a static path (used by llms.txt). */
export function labelForPath(path: string): string {
  if (path === "/" || path === "") return "Home";
  const last = path.split("/").filter(Boolean).pop() ?? "";
  return last
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

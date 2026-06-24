import { unstable_cache } from "next/cache";
import type { Where } from "payload";
import { getPayloadClient } from "./payload";
import { DEFAULT_LOCALE } from "@/config/site";
import type { Post, Media, Author, Category, Config } from "@/payload-types";

/** Payload's generated locale union (updates when site.config locales change). */
type PLocale = Config["locale"];
const asLocale = (l: string): PLocale => l as PLocale;

/**
 * Scalable blog data-access layer (10k+ posts × N locales).
 *
 * Principles:
 *  - Content lives in Postgres/Payload, never in the JS bundle.
 *  - Reads are field-projected (select) + depth-limited to avoid N+1 and fat
 *    payloads.
 *  - Reads are wrapped in unstable_cache with tags so the Payload afterChange
 *    hook can invalidate precisely; otherwise they serve from cache.
 *  - Every call is resilient: a cold/unreachable DB returns a safe empty value
 *    so builds (generateStaticParams / sitemap) never hard-fail.
 */

const REVALIDATE = 3600;

export interface PostCard {
  id: string | number;
  slug: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  coverImage?: Media | null;
  category?: Category | null;
}

export interface PostListResult {
  posts: PostCard[];
  total: number;
  totalPages: number;
  page: number;
}

export interface SlugRow {
  slug: string;
  updatedAt: string;
}

const HOT_SUBSET_LIMIT = 150;
const SITEMAP_PAGE_SIZE = 5000;

/** Hot subset of slugs (default locale) for generateStaticParams. */
export const getHotPostSlugs = (limit = HOT_SUBSET_LIMIT): Promise<string[]> =>
  unstable_cache(
    async () => {
      try {
        const payload = await getPayloadClient();
        const { docs } = await payload.find({
          collection: "posts",
          locale: asLocale(DEFAULT_LOCALE),
          where: { _status: { equals: "published" } },
          select: { slug: true },
          sort: "-publishedAt",
          depth: 0,
          limit,
          pagination: false,
        });
        return docs.map((d) => d.slug).filter(Boolean) as string[];
      } catch {
        return [];
      }
    },
    ["posts:hot-slugs", String(limit)],
    { tags: ["posts"], revalidate: REVALIDATE },
  )();

/** Total count of published posts (default locale) — drives sitemap sharding. */
export const countPublishedPosts = (): Promise<number> =>
  unstable_cache(
    async () => {
      try {
        const payload = await getPayloadClient();
        const { totalDocs } = await payload.count({
          collection: "posts",
          locale: asLocale(DEFAULT_LOCALE),
          where: { _status: { equals: "published" } },
        });
        return totalDocs;
      } catch {
        return 0;
      }
    },
    ["posts:count"],
    { tags: ["posts"], revalidate: REVALIDATE },
  )();

/** Number of sitemap shards needed for the blog. */
export async function getBlogSitemapPageCount(pageSize = SITEMAP_PAGE_SIZE): Promise<number> {
  const total = await countPublishedPosts();
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * One sitemap shard's worth of slugs + lastmod (default-locale canonical).
 * Selects only slug+updatedAt; offset pagination is fine for the first shards,
 * and Payload uses the publishedAt index. Resilient to a cold DB.
 */
export const getPostSlugsForSitemap = (
  page = 1,
  pageSize = SITEMAP_PAGE_SIZE,
): Promise<SlugRow[]> =>
  unstable_cache(
    async () => {
      try {
        const payload = await getPayloadClient();
        const { docs } = await payload.find({
          collection: "posts",
          locale: asLocale(DEFAULT_LOCALE),
          where: { _status: { equals: "published" } },
          select: { slug: true, updatedAt: true },
          sort: "-publishedAt",
          depth: 0,
          page,
          limit: pageSize,
        });
        return docs
          .filter((d) => d.slug)
          .map((d) => ({ slug: d.slug as string, updatedAt: d.updatedAt }));
      } catch {
        return [];
      }
    },
    ["posts:sitemap", String(page), String(pageSize)],
    { tags: ["posts"], revalidate: REVALIDATE },
  )();

/** Paginated blog index for one locale — card-projected, never loads all. */
export const getPosts = (opts: {
  locale: string;
  page?: number;
  limit?: number;
  categorySlug?: string;
}): Promise<PostListResult> => {
  const { locale, page = 1, limit = 12, categorySlug } = opts;
  return unstable_cache(
    async () => {
      try {
        const payload = await getPayloadClient();
        const where: Where = { _status: { equals: "published" } };
        if (categorySlug) (where as Record<string, unknown>)["category.slug"] = { equals: categorySlug };
        const res = await payload.find({
          collection: "posts",
          locale: asLocale(locale),
          fallbackLocale: asLocale(DEFAULT_LOCALE),
          where: where as Where,
          select: {
            slug: true,
            title: true,
            excerpt: true,
            publishedAt: true,
            coverImage: true,
            category: true,
          },
          depth: 1,
          sort: "-publishedAt",
          page,
          limit,
        });
        return {
          posts: res.docs as unknown as PostCard[],
          total: res.totalDocs,
          totalPages: res.totalPages,
          page: res.page ?? page,
        };
      } catch {
        return { posts: [], total: 0, totalPages: 0, page };
      }
    },
    ["posts:list", locale, String(page), String(limit), categorySlug ?? "all"],
    { tags: ["posts", `posts:list:${locale}`], revalidate: REVALIDATE },
  )();
};

export interface FullPost extends Omit<Post, "coverImage" | "authors" | "category"> {
  coverImage?: Media | null;
  authors?: Author[] | null;
  category?: Category | null;
}

/** Single post by slug for a locale (full content + relations), cached by tag. */
export const getPostBySlug = (slug: string, locale: string): Promise<FullPost | null> =>
  unstable_cache(
    async () => {
      try {
        const payload = await getPayloadClient();
        const { docs } = await payload.find({
          collection: "posts",
          locale: asLocale(locale),
          fallbackLocale: asLocale(DEFAULT_LOCALE),
          where: { slug: { equals: slug }, _status: { equals: "published" } },
          depth: 2,
          limit: 1,
        });
        return (docs[0] as unknown as FullPost) ?? null;
      } catch {
        return null;
      }
    },
    ["posts:detail", slug, locale],
    { tags: ["posts", `post:${slug}`], revalidate: REVALIDATE },
  )();

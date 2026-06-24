# Scalability — 10,000+ posts × N locales, build under 220 MB

The template is engineered so **build cost and artifact size are independent of how many posts exist**. Content lives in the database (Payload/Postgres), never in the JS bundle.

## How it stays small at scale

| Mechanism | Where |
|---|---|
| **Hot-subset prerender, on-demand long tail.** `generateStaticParams` returns only the ~150 most-recent posts; `export const dynamicParams = true` + `revalidate = 3600` render the rest on first request and cache them (ISR). | `src/app/(frontend)/[locale]/blog/[slug]/page.tsx`, `src/lib/cms/posts.ts → getHotPostSlugs` |
| **Content never bundled.** Posts are fetched via projected, tag-cached, resilient queries — never imported as JS. | `src/lib/cms/posts.ts` |
| **Keyset-paginated, sharded sitemaps.** A sitemap index links `ceil(publishedCount / 5000)` blog shards; each shard streams ≤ 5,000 `<loc>` (well under the 50,000-URL / 50 MB limit) with full hreflang alternates. | `src/app/(frontend)/sitemap.xml/route.ts`, `…/sitemap/blog/[page]/route.ts`, `getPostSlugsForSitemap` |
| **Heavy packages externalized.** `serverExternalPackages` + `outputFileTracingExcludes` keep `sharp`/Payload out of the marketing function bundles (per-function < 250 MB Vercel limit). | `next.config.ts` |
| **Artifact guard.** CI fails if `.next` (minus cache) exceeds 220 MB, or any Vercel function tree exceeds 240 MB. | `scripts/quality/check-artifact-size.mjs` |

## Verified

A production build against a populated database prerendered **only the hot subset (≈645 pages — the 150 newest blog posts × locales + the marketing pages), not the full corpus**, finished in seconds, and produced a **161.7 MB** `.next` artifact (under the 220 MB budget). Because only the hot subset prerenders, that figure is flat as the corpus grows — adding 10× more posts does not grow the build.

## Running the full empirical test

```bash
node scripts/quality/scalability-test.mjs --count 10000
# or seed then build:
node scripts/seed-posts.mjs --count 10000
pnpm build && node scripts/quality/check-artifact-size.mjs
```

> **Use Postgres for the bulk seed.** Run it against a Postgres `DATABASE_URI` (Neon, or local Docker). SQLite's dev-mode schema "push" reconciles (and can reset) data across process restarts and serializes writes, so it is unsuitable for a repeated 10k bulk seed — it's the right choice for a single developer's local content, not a load test. On Postgres the seed persists, writes run concurrently, and keyset pagination uses the `published_at` / `slug` indexes.

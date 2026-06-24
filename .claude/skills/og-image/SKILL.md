---
name: og-image
description: >-
  Generate or customize Open Graph social cards (1200×630) for pages and posts.
  Use when asked to "create OG images", "fix the social preview", "customize the
  share card", or when a page's OG looks wrong. The template ships a dynamic
  /api/og route plus a sharp-based generator for blog covers.
---

# Open Graph Images

Two paths, both brand-driven from `theme.config.ts`:

## 1. Dynamic per-page card (default)
Every page's `buildMetadata` defaults its OG image to
`/api/og?title=<title>&eyebrow=<eyebrow>`. The route (`src/app/(frontend)/api/og/route.tsx`)
renders a 1200×630 card with the brand accent + name via `next/og`. To restyle every
card, edit that route (colors come from `theme.config.ts`).

## 2. Blog cover (sharp, deterministic, $0)
`scripts/blog/og-thumbnail.mjs` → `generateCover(title, { brand })` renders a PNG cover
that `publish.ts` uploads to Payload `media` and attaches as the post `coverImage`.
A post's OG then uses the real cover instead of the dynamic card.

## When to use
"generate OG cards", "the share preview is blank/wrong", "make a custom cover".

## How
- Restyle dynamic cards → edit `api/og/route.tsx` (JSX → ImageResponse).
- Custom blog cover → call `generateCover` in the publish flow, or upload a 1200×630 image to the post's `coverImage` in `/admin`.
- Verify with a share-debugger or by fetching `/api/og?title=Test`.

## Env
None. Pure render (next/og + sharp). Brand tokens from `theme.config.ts`.

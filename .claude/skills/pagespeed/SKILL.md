---
name: pagespeed
description: >-
  Measure Core Web Vitals + Lighthouse scores (Performance / Accessibility /
  Best-Practices / SEO) for this site, locally or against production. Use when
  asked to "check PageSpeed", "run Lighthouse", "measure Core Web Vitals", "is
  the site fast", or to gate a deploy on ≥98 scores. Wraps
  scripts/quality/pagespeed.mjs.
---

# PageSpeed / Core Web Vitals

## When to use
"check pagespeed", "lighthouse score", "core web vitals", "why is the site slow",
CWV regression check (the `/daily-pagespeed` routine calls this).

## How to run
```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
# Local production build:
pnpm build && pnpm start &
node scripts/quality/pagespeed.mjs --engine lighthouse --base http://localhost:3000 --min 98
# Live production (PageSpeed Insights API):
node scripts/quality/pagespeed.mjs --engine psi --base https://yoursite.com --min 98
```

## Engines
- `lighthouse` — local headless Lighthouse (desktop + mobile). Needs Chrome; uses `npx lighthouse` if not installed.
- `psi` — Google PageSpeed Insights API. Needs `PAGESPEED_API_KEY` (field + lab data, no local Chrome).

## Thresholds
Gates each of Performance / Accessibility / Best-Practices / SEO ≥ `--min` (default 98),
on **both** desktop and mobile. Reports LCP < 2.5s, INP < 200ms, CLS < 0.1.

## Env vars
- `PAGESPEED_API_KEY` — only for `--engine psi`. Create at Google Cloud Console → Credentials → API key.

## Interpreting
- LCP high → ensure hero uses `next/image` + `priority`; check font `display: swap`.
- CLS → reserve image dimensions; match Suspense fallback heights.
- INP → reduce client JS; keep `"use client"` to leaves.
The `/daily-pagespeed` command turns regressions into a fix PR (never auto-merges).

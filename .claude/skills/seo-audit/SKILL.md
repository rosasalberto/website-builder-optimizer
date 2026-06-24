---
name: seo-audit
description: >-
  Run an expert technical-SEO + GEO audit of this site (the Website Builder
  Optimizer template). Scores 10 weighted dimensions 0–100 against the running
  build and emits a prioritized remediation report. Use when asked to "audit
  SEO", "score the site", "check SEO health", or before a production deploy.
  Read-only — does not edit files.
---

# SEO + GEO Audit

A read-only auditor for the marketing site. Target URL comes from
`NEXT_PUBLIC_SITE_URL` (default `http://localhost:3000`). Brand/locale facts come
from `site.config.ts` — nothing here is hardcoded to a brand.

## When to use
"audit SEO health", "score the website", "SEO readiness", pre-deploy scorecard.

## How to run
```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
pnpm build && pnpm start &            # serve the production build on :3000
BASE=http://localhost:3000 node scripts/quality/seo-live-check.mjs   # 11 checks/route
node scripts/quality/discriminator-loop.mjs --summary                # per-route quality
```

## The 10 dimensions (weighted)
1. **Technical** (15%) — robots.txt env-aware, sitemap index + shards valid, canonical, trailing-slash consistency, HTTPS, status codes.
2. **Metadata** (15%) — `generateMetadata` on every page, title ≤ 60 / description ≤ 155, OG + Twitter, per-locale uniqueness.
3. **On-page** (10%) — exactly one `<h1>`, heading hierarchy, keyword-in-slug, word count.
4. **Structured data** (10%) — Organization, WebSite + SearchAction, BreadcrumbList, Article, FAQPage, Speakable (GEO).
5. **Performance / CWV** (15%) — `next/image`, no raw `<img>`, route bundle size, font strategy, static/ISR ratio.
6. **Internal linking** (10%) — hub pages, anchor diversity, orphan detection, depth.
7. **i18n** (5%) — `hreflang` + `x-default` in `<head>`, locale URL structure, no duplicate content.
8. **Mobile** (5%) — viewport, responsive classes, tap targets ≥ 44px.
9. **Accessibility** (5%) — alt text, ARIA, landmarks, `lang`, skip-link.
10. **GEO / E-E-A-T** (10%) — `llms.txt`, answer-first content, question-format H2s, named authors, citable stats, FAQ blocks.

## Scoring
Per dimension 0–100 (A 90+, B 75+, C 60+, D 40+, F <40). Overall = Σ(score × weight).
Tag findings **P0** (blocks indexing — fix now), **P1** (limits rankings — this month), **P2** (polish).

## Output
Write a markdown scorecard to `data/reports/seo/seo-audit-<YYYY-MM-DD>.md`:
executive summary, dimension table, per-dimension findings (✅/⚠️/❌ + fix), prioritized
roadmap, quick wins. Optionally render a PDF via the `md-to-pdf` flow.

## Notes
- The live-check + discriminator scripts are the deterministic backbone; your job
  is to interpret their output + read the source for the qualitative dimensions.
- Re-run after remediation to verify lift. No env vars required (read-only).

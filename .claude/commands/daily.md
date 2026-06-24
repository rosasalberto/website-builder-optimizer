---
description: The daily growth run — chain the SEO/content and PageSpeed routines for one morning pass.
---

Run the two daily routines in sequence and produce a single summary:

1. `/daily-pagespeed` — measure production CWV; open a fix PR on regression.
2. `/daily-seo-content` — find a Search Console gap; draft + auto-publish (above gate) a multilingual post.

Then report a combined digest: CWV status (+ PR link if opened), the content gap targeted (+ post URL or draft id), and anything that needs human attention.

Ads (`/daily-ads-roas`) and the weekly audit (`/weekly-seo-audit`) stay separate — ads touches spend and the audit is weekly. Schedule them on their own cadence (e.g. via `/schedule` or Vercel cron). Use Node 22 and `set -a && source .env && set +a`.

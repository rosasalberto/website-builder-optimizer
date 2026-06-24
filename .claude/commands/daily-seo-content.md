---
description: Daily autonomous SEO content routine — find a Search Console ranking gap and publish a multilingual blog post that targets it.
---

Autonomous content growth. Posture: **auto-publish above the quality gate, else hold a draft.**

1. **Read opportunities** (`analytics-search-console` skill):
   ```bash
   export PATH="/opt/homebrew/opt/node@22/bin:$PATH" && set -a && source .env && set +a
   node scripts/analytics/gsc-report.mjs
   ```
   Identify the single highest-value gap: a striking-distance query (avg position 5–15, real impressions, low clicks) or a rising query with no dedicated page. Confirm no existing post already targets it (check the CMS / `/blog`).

2. **Draft** a post that answers that query, following the GEO content rules (answer-first, question H2s, FAQ, named author, a citable stat). Write it to a temp `.md` with proper frontmatter (slug must be new + permanent).

3. **Quality-gate** the draft with the `content-discriminator` + `seo-discriminator` agents (and optionally a codex Mode-B audit). 

4. **Act:**
   - Score ≥ gate (default 90) AND `AUTO_PUBLISH` not disabled → publish in every locale:
     `pnpm exec payload run scripts/blog/publish.ts <draft.md>`.
   - Below gate → create the post as a Payload **draft** (`_status: draft`) and report it for human review. Never publish below the gate.

5. **Report** the query targeted, the post URL (or draft id), and the locales published.

Safety: a published slug is permanent (never edit it later); the post is human-quality or it stays a draft.

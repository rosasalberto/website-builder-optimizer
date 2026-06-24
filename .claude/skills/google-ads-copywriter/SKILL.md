---
name: google-ads-copywriter
description: >-
  Write responsive-search-ad copy (headlines, descriptions, display paths) that
  reads back the value proposition of the exact landing page. Use when asked to
  "write ad copy", "the headlines are weak/too price-heavy", "improve Ad
  Strength", or "write RSAs for <ad group>". Char-limit-compliant, page-matched,
  scored to ≥95.
---

# Google Ads Copywriter

Generic RSA copywriting. Pulls the value proposition from `site.config.ts` +
`messages/*` and the specific landing page — never invents claims.

## When to use
"write/improve ad copy", "headlines too repetitive", "max out Ad Strength".

## Hard limits
- Headlines: 8–15 per RSA, **≤ 30 chars**, sentence case, no `!`, no emoji.
- Descriptions: 2–4, **≤ 90 chars**, end with a period.
- Display path segments: **≤ 15 chars**, derived from the final URL's segments.

## Page-match contract
1. ≥ 1 headline echoes the landing page's H1 in the searcher's words.
2. ≥ 1 description paraphrases a real section of the page.
3. No promise the page doesn't keep; CTA matches the page's real CTA.
4. Display path mirrors the URL's information architecture (`/switch/x` → `site.com/switch/x`).

## Quality (score ≥ 95, else revise the weakest dimension)
page-match (25) · value-prop balance — don't stack 5 price headlines (20) · truth (15) ·
variety — no duplicate phrasings, ≥ 12 distinct (15) · char compliance (10) · CTA clarity (10) · brand/banned (5).

## Localization
Transcreate (not literal) per locale; keep tech terms/brand/prices; re-cut to the char
limit in the target language; page-match against the localized page.

## Apply
Propose copy + score. To push to a live ad, the `google-ads-optimizer` apply path or the
operator updates the RSA. Never mutate a live ad from this skill directly.

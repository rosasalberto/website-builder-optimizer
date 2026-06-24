---
name: google-ads-performance
description: >-
  Snapshot a Google Ads account and produce a source-traced performance review —
  spend, ROAS/CPA, lost impression share, Quality Score, Ad Strength, search
  terms — with prioritized recommendations. Use when asked to "review the Google
  Ads account", "how are the ads doing", "audit ads performance", or "snapshot
  the ads". PROPOSE-ONLY (no mutations).
---

# Google Ads Performance Review

Read-only. Same auth as `google-ads-optimizer` (REST v22, refresh-token; env IDs).

## When to use
"review/audit the ads", "ads performance report", "how are the ads doing".

## Pipeline
1. **Snapshot** — GAQL pulls (30d + 90d, diff vs prior): campaigns (spend, ROAS, CPA, lost-IS budget/rank), keywords + Quality Score components, search terms, ads + Ad Strength, conversion actions, device.
2. **Analyze** — apply the optimizer decision tree → a facts pack + severity-tagged findings.
3. **Propose** — 5 sections: bid & budget · keyword/search-term hygiene · ad copy & Ad Strength · structure/targeting/locale · conversion-tracking integrity. Each refined to ≥95 by a paid-search reviewer.
4. **Report** — write a markdown (optionally branded HTML) report to `data/google-ads/performance/<date>/`.

## Canonical GAQL (spend diagnostic)
```sql
SELECT campaign.name, campaign.bidding_strategy_type, campaign_budget.amount_micros,
       metrics.cost_micros, metrics.conversions, metrics.conversions_value,
       metrics.search_impression_share, metrics.search_budget_lost_impression_share,
       metrics.search_rank_lost_impression_share
FROM campaign WHERE segments.date DURING LAST_30_DAYS AND campaign.status = 'ENABLED'
```

## Env vars
Same as `google-ads-optimizer`.

## Hard rule
PROPOSE-ONLY here. To apply an approved change, hand it to `google-ads-optimizer`
(which enforces the guardrails + logs the revert).

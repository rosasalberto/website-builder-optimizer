---
description: Daily autonomous Google Ads routine — snapshot the account and apply safe ROAS optimizations within Google's guardrails.
---

Autonomous ad optimization. Posture: **auto-apply ONLY changes that satisfy every guardrail; log a revert for each.**

1. **Snapshot + analyze** (`google-ads-performance` skill): pull 30d/90d campaigns, lost-IS (budget vs rank), Quality Score, Ad Strength, search terms, conversions. Build the facts pack + findings.

2. **Decide** with the optimizer decision tree (see `google-ads-optimizer`): budget vs bid, tROAS vs tCPA, copy refresh, negative keywords.

3. **Apply ONLY if every guardrail holds**, else propose for human review:
   - ≥ 15 conversions / 30 days before any smart-bidding target change.
   - tROAS adjustments in **0.2–0.5** increments only.
   - No second change within a 7–14d learning window of the last one.
   - Budget raise capped at ~25% per run.
   For each applied mutate: record before/after JSON **and the exact revert payload** to `data/google-ads/changelog.md`.

4. **Always propose (never auto-apply)** structural changes, new campaigns, or anything outside the guardrails — write a markdown proposal with exact v22 mutate JSON.

5. **Report** what was applied (with reverts) vs proposed, and the expected impact.

Env: `GOOGLE_ADS_*` (developer token, client id/secret, refresh token, login + customer id). If conversions < 15/30d, fall back to MAXIMIZE_CONVERSIONS with no target and only propose.

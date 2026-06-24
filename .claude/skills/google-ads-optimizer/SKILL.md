---
name: google-ads-optimizer
description: >-
  Optimize a Google Ads account to maximize conversion value — diagnose spend,
  lost impression share, Quality Score; adjust bid strategy (target ROAS / target
  CPA / maximize conversions) and budgets within Google's guardrails. Use when
  asked to "optimize Google Ads", "fix spend gap", "raise/lower budget", "set
  target ROAS/CPA", or "diagnose lost impression share". Proposes by default;
  applies with --apply.
---

# Google Ads Optimizer

Generic, account-agnostic (IDs from env). REST v22, OAuth refresh-token auth.

## Auth (the canonical pattern — no CLI, headless after one-time mint)
```python
import os, requests
def token():
    r = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": os.environ["GOOGLE_ADS_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_ADS_CLIENT_SECRET"],
        "refresh_token": os.environ["GOOGLE_ADS_REFRESH_TOKEN"],
        "grant_type": "refresh_token"})
    return r.json()["access_token"]
def headers(t):
    return {"Authorization": f"Bearer {t}",
            "developer-token": os.environ["GOOGLE_ADS_DEVELOPER_TOKEN"],
            "login-customer-id": os.environ["GOOGLE_ADS_LOGIN_CUSTOMER_ID"]}
BASE = f"https://googleads.googleapis.com/v22/customers/{os.environ['GOOGLE_ADS_CUSTOMER_ID']}"
```
Mint the refresh token once: `node scripts/mint-google-ads-token.mjs`.

## Env vars
`GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`,
`GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (MCC), `GOOGLE_ADS_CUSTOMER_ID`.

## Decision tree
| Symptom | Action |
|---|---|
| lost-IS-budget > 20% | raise daily budget ~25%, re-audit in 7d |
| lost-IS-budget < 5% AND lost-IS-rank > 50% | loosen tROAS 10–15% / raise tCPA 30% / switch to MAXIMIZE_CONVERSIONS |
| Quality Score < 6 on a >5%-spend keyword | fix landing page or RSA; pause if still <6 after 30d |
| conversions dropped >20% within 14d of a bid change | **revert immediately** |
| value_per_conversion ≈ 1.0 | switch tROAS → tCPA |

## Safety guardrails (non-negotiable)
- ≥ 15 conversions / 30 days before smart bidding; else MAXIMIZE_CONVERSIONS (no target).
- Ramp tROAS in **0.2–0.5** steps — never 1.0 jumps.
- Wait 1–2 conversion cycles (7–14d) between changes.
- Log every mutation (before/after JSON + revert payload) to `data/google-ads/changelog.md`.

## Apply
Default is **propose** (markdown proposal with exact v22 mutate JSON + revert). The
`/daily-ads-roas` routine may auto-apply ONLY changes that satisfy all guardrails, and
always logs the revert. Bid/budget mutates → `POST {BASE}/campaigns:mutate` (or campaignBudgets:mutate).

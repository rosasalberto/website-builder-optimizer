---
name: analytics-search-console
description: >-
  Pull Google Analytics 4 traffic and Google Search Console search performance
  for this site from the CLI (headless, OAuth refresh-token). Use when asked to
  "check analytics", "pull GA4 numbers", "top search queries", "Search Console
  report", "organic traffic", or "find ranking opportunities". One refresh token
  covers both APIs (read-only).
---

# GA4 + Search Console

Headless analytics via an OAuth refresh token (no browser after one-time setup).
`gcloud`'s default client can't request the analytics/webmasters scopes, so the
template uses your own OAuth client.

## One-time setup
1. In Google Cloud Console: enable the GA4 Admin API, GA4 Data API, and Search Console API.
2. Create an OAuth client (Desktop or Web) → set `GOOGLE_WORKSPACE_CLI_CLIENT_ID` / `_SECRET` in `.env`.
3. Mint a long-lived refresh token (browser opens once):
   ```bash
   export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
   node scripts/mint-google-refresh-token.mjs
   ```
   Paste the printed `GOOGLE_ANALYTICS_REFRESH_TOKEN=…` into `.env`.

## Use (no browser after setup)
```bash
set -a && source .env && set +a
node scripts/analytics/ga4-report.mjs    # property from GA4_PROPERTY_ID
node scripts/analytics/gsc-report.mjs    # site from GSC_SITE_URL
```
(If the report scripts aren't present yet, the auth pattern + REST endpoints are
documented here — `analyticsdata.properties.runReport` for GA4,
`searchconsole.searchanalytics.query` for GSC.)

## Finding ranking opportunities (used by /daily-seo-content)
From GSC `searchAnalytics.query` (dimensions: query, page):
- **Striking distance** — queries at average position 5–15 with impressions but low clicks → a small content push can move them onto page 1.
- **Low CTR** — high impressions, CTR below the position's expected curve → rewrite title/description.
- **Rising queries** — week-over-week impression growth with no dedicated page → write one.

## Env vars
`GOOGLE_WORKSPACE_CLI_CLIENT_ID`, `GOOGLE_WORKSPACE_CLI_CLIENT_SECRET`,
`GOOGLE_ANALYTICS_REFRESH_TOKEN`, `GA4_PROPERTY_ID`, `GSC_SITE_URL`.

## Gotchas
- No refresh_token returned → revoke the app at myaccount.google.com/permissions and re-run (forces `prompt=consent`).
- GSC data lags ~2 days. `SERVICE_DISABLED` → enable the API in the GCP project.

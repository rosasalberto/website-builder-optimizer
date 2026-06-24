---
description: Run the interactive onboarding wizard — write .env, set brand/locales, and (opt-in) collect integration credentials.
---

Run the setup wizard and report what was configured:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node scripts/setup.mjs
```

It writes `.env` (DB URL, generated `PAYLOAD_SECRET`, site URL), patches `site.config.ts`
brand/url, and only prompts for an integration credential when the user enables that
feature (OpenRouter, GA4/GSC, PageSpeed, Google Ads, media storage, lead form).

After it finishes, run `pnpm generate:types && pnpm generate:importmap && pnpm dev`, then
remind the user to mint OAuth tokens if they enabled analytics/ads
(`node scripts/mint-google-refresh-token.mjs`, `node scripts/mint-google-ads-token.mjs`).

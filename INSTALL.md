# Install & setup

A complete walkthrough — from clone to a deployed, optimized, multi-locale site.

## 1. Prerequisites

- **Node 22** — Payload CMS 3 and Next.js 16 do not support Node 25 yet. The repo pins it via `.nvmrc` / `.node-version`. With Homebrew: `brew install node@22` and put `/opt/homebrew/opt/node@22/bin` on your `PATH`.
- **pnpm** — `npm i -g pnpm`.
- A database: nothing for local (bundled **SQLite**), or a **Postgres** URL for production (Neon recommended).

## 2. Clone & install

```bash
npx degit rosasalberto/website-builder-optimizer my-site
cd my-site
pnpm install
```

## 3. Configure

```bash
pnpm setup
```

The wizard writes `.env`, generates a `PAYLOAD_SECRET`, patches your brand name into `site.config.ts`, and (opt-in) collects credentials for each integration you enable. You can re-run it any time, or edit `.env` by hand from `.env.example`.

Then generate Payload's types + admin import map:

```bash
pnpm generate:types && pnpm generate:importmap
```

## 4. Run

```bash
pnpm dev
```

- Site → http://localhost:3000
- CMS admin → http://localhost:3000/admin (create your first admin user on first visit)

Write a post in the admin and it appears at `/blog/<slug>` with full SEO and in every locale.

## 5. Rebrand

| Edit | Then |
|---|---|
| `site.config.ts` — brand, domain, locales, nav, footer, social, org, analytics IDs, feature flags | — |
| `theme.config.ts` — colors, radius, fonts | `pnpm rebrand` (regenerates the `@theme` tokens) |
| `public/logos/*` — your logo files | — |

Everything (pages, SEO, hreflang, sitemap, JSON-LD, OG images, the Claude skills) derives from these.

## 6. Validate

```bash
pnpm validate
```

Runs typecheck · lint · i18n parity · build · artifact-size · SEO live-check · Lighthouse · per-route discriminator. Keep it green before every push.

## 7. Deploy to Vercel

1. Push to GitHub and import the repo into Vercel.
2. Add the **Neon Postgres** integration → it injects `DATABASE_URI`. Add **Vercel Blob** for media (`BLOB_READ_WRITE_TOKEN`).
3. Set `PAYLOAD_SECRET` and `NEXT_PUBLIC_SITE_URL` (your production URL), and `NEXT_PUBLIC_VERCEL_ENV=production`.
4. Deploy. `vercel.json` wires the daily cron + per-function limits.

> Self-hosting? Any Node 22 host works. Use `pnpm build && pnpm start`, point `DATABASE_URI` at Postgres, and set a storage adapter (S3/R2) for media.

## 8. Optional integrations & their credentials

Enable a feature → fill its block in `.env`. Mint Google tokens once; everything after is headless.

| Feature | Env vars | One-time |
|---|---|---|
| Blog translation + OG images | `OPENROUTER_API_KEY` | — |
| GA4 + Search Console | `GOOGLE_WORKSPACE_CLI_CLIENT_ID/SECRET`, `GOOGLE_ANALYTICS_REFRESH_TOKEN`, `GA4_PROPERTY_ID`, `GSC_SITE_URL` | `node scripts/mint-google-refresh-token.mjs` |
| PageSpeed Insights | `PAGESPEED_API_KEY` | — |
| Google Ads | `GOOGLE_ADS_DEVELOPER_TOKEN/CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN/LOGIN_CUSTOMER_ID/CUSTOMER_ID` | `node scripts/mint-google-ads-token.mjs` |
| Lead form | `FORM_WEBHOOK_URL` (+`FORM_WEBHOOK_SECRET`) or `RESEND_API_KEY` | — |

> **Why a browser on first auth?** Google only mints a refresh token on a fresh consent. After that, GA4/GSC/Ads all run 100% headless — from any cron or CI, no browser. Google Ads does not support service accounts, so a user OAuth refresh token is the canonical path.

## 9. Publish a multilingual blog post from the CLI

```bash
node scripts/blog/publish.ts ./my-post.md     # or: pnpm payload run scripts/blog/publish.ts ./my-post.md
```

Front-matter (`title`, `slug`, `excerpt`, `category`, `author`, `seo`) → creates the post, translates it into every locale, generates a cover, and publishes. The slug is immutable once published.

## 10. The autonomous toolchain

Open the repo in Claude Code and try `/seo-audit`, `/pagespeed`, `/publish-blog`, or the daily routines (`/daily-seo-content`, `/daily-pagespeed`, `/daily-ads-roas`, `/weekly-seo-audit`). See [`.claude/CLAUDE.md`](.claude/CLAUDE.md).

<div align="center">

# Website Builder Optimizer

**Clone → edit one config file → launch a perfectly SEO + GEO optimized, multi-locale website with its own CMS and an autonomous growth toolchain.**

Next.js 16 · Payload CMS 3 (embedded, your own database) · next-intl · Tailwind 4 · Vercel-ready · MIT

</div>

---

## What you get

- **One repo, your own CMS.** Payload CMS 3 runs *inside* the Next.js app (admin at `/admin`), backed by your own database — no shared backend, no SaaS lock-in. SQLite locally, Postgres in production.
- **Multi-locale by default.** next-intl with `as-needed` locale prefixes, deep-merge fallback, correct `hreflang` + `x-default` everywhere. Add a locale by editing one array.
- **Technical SEO + GEO out of the box.** `generateMetadata` factory, canonical + hreflang, content-sharded streaming sitemaps, env-aware `robots.txt` with an AI-crawler allowlist, JSON-LD (Organization, WebSite, Article, FAQ, Breadcrumb, Speakable), dynamic `llms.txt`, and dynamic Open Graph images.
- **Scales to 10,000+ posts × N locales.** On-demand ISR (hot-subset prerender + `dynamicParams`), keyset-paginated sitemaps, projected + tag-cached queries, and a build-artifact guard that keeps deploys under 220 MB.
- **Fast multi-locale blog publishing via API.** Write Markdown → one command creates the post, translates it into every locale, generates a cover, and publishes — slug-immutable for SEO safety.
- **An autonomous growth toolchain.** Bundled Claude Code skills + daily routines that read Search Console, Analytics, PageSpeed, and Google Ads — and act: publish blogs that target ranking gaps, open PRs to fix Core Web Vitals, and tune ad ROAS within guardrails.
- **One-file rebrand.** `site.config.ts` (brand, locales, nav, social, org, SEO) + `theme.config.ts` (colors, radius, fonts). Everything derives from these.

## Create your site in 10 minutes

> Requires **Node 22** (Payload + Next 16 do not support Node 25 yet), **pnpm**, and a database URL (or just use the bundled SQLite for local).

```bash
# 1. Clone
npx degit rosasalberto/website-builder-optimizer my-site
cd my-site

# 2. Install (Node 22)
pnpm install

# 3. Configure — interactive wizard writes site.config.ts + .env
pnpm setup

# 4. Generate Payload types + admin import map
pnpm generate:types && pnpm generate:importmap

# 5. Run — site at http://localhost:3000, CMS at /admin
pnpm dev
```

Open `/admin`, create your first admin user, write a post, and it's live with full SEO + every locale.

## Rebrand

1. Edit **`site.config.ts`** — brand name, domain, locales, nav, footer, social, organization, analytics IDs, feature flags.
2. Edit **`theme.config.ts`** — colors, radius, fonts — then run `pnpm rebrand`.
3. Drop your logos into `public/logos/`.

That's it — the whole site, SEO, hreflang, sitemap, JSON-LD, and the Claude skills all follow.

## Validate before you ship

```bash
pnpm validate     # typecheck · lint · i18n parity · build · artifact size ·
                  # SEO live-check · Lighthouse (>=98) · per-route discriminator (>=98)
```

## Deploy (Vercel)

1. Push to GitHub, import into Vercel.
2. Add the **Neon Postgres** integration (injects `DATABASE_URI`) and **Vercel Blob** (media).
3. Set `PAYLOAD_SECRET` and `NEXT_PUBLIC_SITE_URL`.
4. Deploy. `vercel.json` wires the cron routines and per-function limits.

## The autonomous toolchain

Open the repo in **Claude Code** — the bundled `.claude/` skills and commands are picked up automatically.

| Command | What it does |
|---|---|
| `/setup`, `/rebrand`, `/new-page` | Scaffold + rebrand |
| `/publish-blog <file.md>` | Publish a post in every locale |
| `/seo-audit`, `/pagespeed` | Score the live site |
| `/daily-seo-content` | Find a Search Console gap → draft + auto-publish a multilingual post |
| `/daily-pagespeed` | Detect a CWV regression → open a fix PR |
| `/daily-ads-roas` | Snapshot Google Ads → apply safe ROAS optimizations |
| `/weekly-seo-audit` | Full scorecard + regression issues |

See [`.claude/CLAUDE.md`](.claude/CLAUDE.md) for the full bundle and the required environment variables per skill.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, `src/`, TypeScript) |
| CMS | Payload 3 (embedded, SQLite/Postgres, native localization) |
| i18n | next-intl 4 |
| Styling | Tailwind 4 (`@theme` token-driven) + Radix |
| Hosting | Vercel + Neon + Vercel Blob (or self-host) |

## Documentation

- [`INSTALL.md`](INSTALL.md) — full setup, credentials, and integration walkthrough
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to contribute, the validation gate
- [`.claude/CLAUDE.md`](.claude/CLAUDE.md) — the skills + daily routines

## License

MIT © Alberto Rosas — see [`LICENSE`](LICENSE).

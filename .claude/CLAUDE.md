# Website Builder Optimizer — Claude Code bundle

This repo ships a self-contained growth toolchain. Open it in Claude Code and the
skills, agents, and commands below are picked up automatically. **Everything is
config-driven** — read `site.config.ts` + `theme.config.ts` + `messages/*.json`;
never hardcode a brand, vertical, or account id.

## Golden rules
- **Node 22.** Prefix node/pnpm commands with `export PATH="/opt/homebrew/opt/node@22/bin:$PATH"` (Payload + Next 16 do not support Node 25). The repo pins it via `.nvmrc`.
- **Load env** with `set -a && source .env && set +a` before any script that reads keys.
- **Run `/validate` before pushing.** `node scripts/quality/validate-all.mjs` must be green.
- **Payload REST base is `/api/payload`** (the marketing app keeps `/api/*`). Admin is `/admin`.
- **Slugs are immutable once published** — never change a published post's slug without adding a `Redirects` row.

## Autonomy posture (default: autonomous-with-rails)
- **Blogs** → auto-published only when they clear the discriminator quality gate; otherwise held as a Payload draft.
- **Google Ads** → safe bid/budget/copy changes auto-applied only within Google's guardrails (≥15 conversions / 30 days, ROAS moved in 0.2–0.5 steps, learning periods respected); every mutation logged with an inline revert.
- **Code / Core Web Vitals fixes** → always a branch + PR, never an auto-merge.

## Skills (`.claude/skills/`)
| Skill | Use when |
|---|---|
| `seo-audit` | Score the live site on 10 SEO dimensions |
| `pagespeed` | Measure Lighthouse / Core Web Vitals |
| `geo-optimization` | Make content citable by AI engines (llms.txt, answer-first, schema, E-E-A-T) |
| `blog-publisher` | Publish a Markdown post into every locale via Payload |
| `analytics-search-console` | Pull GA4 + Search Console data |
| `google-ads-optimizer` / `-performance` / `-copywriter` | Diagnose + tune Google Ads |
| `generator-discriminator-loop` | The generate → critique → fix meta-loop |
| `website-page-builder-loop` | Build a page to ≥98 with Claude + codex discriminators |
| `i18n-locale-quality` | Locale parity / hardcoded-string / ICU checks |
| `og-image` | Generate Open Graph cards |
| `brand-system` | The rebrand contract (site.config + theme.config) |

## Commands (`.claude/commands/`)
`/setup` · `/rebrand` · `/new-page` · `/publish-blog` · `/seo-audit` · `/pagespeed` · `/translate`
Daily routines: `/daily-seo-content` · `/daily-pagespeed` · `/daily-ads-roas` · `/weekly-seo-audit` · `/daily`

## Environment matrix
| Feature | Env vars |
|---|---|
| Core | `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL` |
| Blog translate / OG | `OPENROUTER_API_KEY`, `PAYLOAD_API_KEY` |
| GA4 + Search Console | `GOOGLE_WORKSPACE_CLI_CLIENT_ID/SECRET`, `GOOGLE_ANALYTICS_REFRESH_TOKEN`, `GA4_PROPERTY_ID`, `GSC_SITE_URL` |
| PageSpeed | `PAGESPEED_API_KEY` |
| Google Ads | `GOOGLE_ADS_DEVELOPER_TOKEN/CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN/LOGIN_CUSTOMER_ID/CUSTOMER_ID` |

Mint Google tokens once: `node scripts/mint-google-refresh-token.mjs` (GA4+GSC) and `node scripts/mint-google-ads-token.mjs` (Ads).

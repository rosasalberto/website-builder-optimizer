# Contributing

Thanks for improving the Website Builder Optimizer template.

## Ground rules

- **Node 22** for all work (Payload + Next 16 requirement).
- **Never commit secrets.** Only `.env.example` is tracked; `.env`, `payload.db`, and `/media` are gitignored. CI runs a secret scan.
- **The validation gate is the bar.** A change is mergeable when `pnpm validate` is green.
- **Keep it generic.** This is a template — no brand, vertical, or account ID is hardcoded. Everything reads from `site.config.ts` / `theme.config.ts` / `messages/*`. Use the `Acme` placeholder.

## Dev loop

```bash
pnpm install
pnpm dev                 # site :3000, CMS /admin
pnpm typecheck           # tsc --noEmit
pnpm validate            # the full gate before pushing
```

## The validation gate

`pnpm validate` runs, in order: prettier · typecheck · eslint · i18n parity · `next build` · artifact-size (< 220 MB) · boot · SEO live-check (100%) · Lighthouse (≥ 98) · per-route discriminator (≥ 98). It stops at the first hard failure and prints a summary table.

Run `pnpm scalability-test` before changes to the blog/sitemap/rendering path — it seeds 10k posts and asserts the build stays small and the long tail renders via ISR.

## Architecture conventions

- **Two route groups:** `(frontend)/[locale]/…` (static/ISR marketing + blog) and `(payload)/…` (dynamic admin + REST at `/api/payload`). Never put marketing routes under `/api`, and never let `proxy.ts` rewrite `/admin` or `/api`.
- **Content never enters the JS bundle.** Read posts via `src/lib/cms/posts.ts` (projected, cached, resilient). The blog detail page uses a hot-subset `generateStaticParams` + `dynamicParams = true`.
- **SEO is centralized.** Every page's `generateMetadata` calls `buildMetadata()` from `src/lib/seo/metadata.ts`; structured data comes from `src/lib/seo/jsonld.ts`.
- **Slugs are immutable once published** (a Payload hook enforces it). Changing one requires `allowSlugChange` + a `Redirects` entry.
- **Sections are data-driven** and tagged `data-section="…"`; pages compose archetypes/sections, never bespoke markup.

## Adding things

- **A page:** use the `/new-page` Claude command or copy an existing archetype-based page; add its `generateMetadata`, register it in `src/lib/seo/routes.ts`, and add its strings to `messages/*`.
- **A locale:** see `INSTALL.md` → Rebrand.
- **A Claude skill / command:** add it under `.claude/` and index it in `.claude/CLAUDE.md`.

## Pull requests

1. Branch from `main`.
2. Make the change; keep it config-driven.
3. `pnpm validate` green.
4. Open the PR — CI must pass (typecheck, lint, i18n, build, artifact size, secret scan).

By contributing you agree your work is licensed under the project's MIT License.

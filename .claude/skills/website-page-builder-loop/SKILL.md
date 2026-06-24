---
name: website-page-builder-loop
description: >-
  Build or rewrite a page of this site to a ≥98 quality bar using a generator →
  multi-discriminator → codex cross-engine loop. Use when asked to "build a new
  page properly", "rewrite this page to spec", "get this page to 98", or to
  onboard a new archetype. Orchestrates the page-generator + discriminator agents
  and validate-all.
---

# Website Page Builder Loop

Drives one page from spec to a verified ≥98 on every dimension.

## When to use
"build/redo page X properly", "get the page passing", "add a new archetype to spec".

## Prereqs
- On a feature branch (never run loops on `main`).
- `pnpm install` clean; `pnpm typecheck` clean; `node scripts/quality/discriminator-loop.mjs` works.

## Phase 1 — content correctness
`page-generator` writes/edits the page (compose archetypes + sections from `@/components`,
content from `messages/<locale>.json`, metadata via `buildMetadata`). The
`content-discriminator` agent verifies every required section/CTA/FAQ is present. Loop
until content score ≥ 98 with empty fix list, then `pnpm typecheck && pnpm lint`.

## Phase 2 — quality (parallel discriminators)
For the page, run in parallel: `seo-discriminator`, `nextjs-discriminator`,
`brand-discriminator`, `content-discriminator`. Aggregate fix lists → `page-generator`
applies them → re-run `node scripts/quality/discriminator-loop.mjs --route <r>` until all
dims ≥ 98. Then a live pass: `pnpm build && pnpm start &`, `BASE=:3000 node scripts/quality/seo-live-check.mjs`.

## Codex fallback (after 3 stuck iterations)
- **Mode A (fix):** `codex --auto "Rewrite src/app/(frontend)/[locale]/<route>/page.tsx to satisfy: <consolidated fixes>. Must pass pnpm typecheck and node scripts/quality/discriminator-loop.mjs --route /<route> at >=98 on every dim. Don't edit outside this repo."`
- **Mode B (independent audit, read-only):** `codex exec "Read the page + its rendered HTML at http://localhost:3000/<route>. Score 0–100 on Content/SEO/Next.js/Reusability/Responsive. Output ONLY JSON. Do NOT modify files."`
Accept only when deterministic scripts + Claude discriminator + codex all clear ≥ 98.

## Termination
Done when all dims ≥ 98 (Claude) AND codex ≥ 98 AND `validate-all` green for the route.
Escalate to human after 5 iterations or if a fix needs a primitive not in `@/components`.

## Anti-homogenization
Per-page voice seed; generator never reads another page's TSX; rotate references per
section; spot-check every Nth page for copy-paste. (See `generator-discriminator-loop`.)

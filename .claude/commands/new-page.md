---
description: Build a new page to the ≥98 quality bar using the page-builder loop (generator → discriminators → codex cross-engine).
---

Build the page the user described. Use the `website-page-builder-loop` skill:

1. Branch off `main` (never loop on main).
2. Pick the archetype (Home / Landing / Pricing / Hub / Legal) and the sections it needs.
3. Spawn the `page-generator` agent to write `src/app/(frontend)/[locale]/<route>/page.tsx` + add English keys to `messages/en.json`.
4. Run the discriminators (`content`, `seo`, `nextjs`, `brand`) + `node scripts/quality/discriminator-loop.mjs --route /<route>`.
5. If stuck after 3 iterations, use the codex fallback (Mode A fix, Mode B audit) from the page-builder-loop skill.
6. Done when all dims ≥ 98 AND codex ≥ 98 AND `pnpm typecheck`/`build` clean.
7. Translate the new keys (`/translate`) before shipping non-English locales.

Use Node 22 (`export PATH="/opt/homebrew/opt/node@22/bin:$PATH"`). Don't commit until the user approves.

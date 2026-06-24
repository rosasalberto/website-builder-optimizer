---
description: Run the 10-dimension technical-SEO + GEO audit and write a prioritized scorecard.
---

Use the `seo-audit` skill. Build + serve the site, run the deterministic checks, then score
the 10 dimensions and write `data/reports/seo/seo-audit-<date>.md`:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
pnpm build && pnpm start &
BASE=http://localhost:3000 node scripts/quality/seo-live-check.mjs
node scripts/quality/discriminator-loop.mjs --summary
```

Report the overall score + letter grade and the P0/P1/P2 roadmap. Read-only — propose fixes,
don't apply them unless asked.

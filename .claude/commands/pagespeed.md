---
description: Measure Lighthouse / Core Web Vitals locally or against production.
argument-hint: [--prod https://yoursite.com]
---

Use the `pagespeed` skill.

Local build:
```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
pnpm build && pnpm start &
node scripts/quality/pagespeed.mjs --engine lighthouse --base http://localhost:3000 --min 98
```

Production (`--prod <url>` provided): `node scripts/quality/pagespeed.mjs --engine psi --base <url> --min 98` (needs `PAGESPEED_API_KEY`).

Report Performance / Accessibility / Best-Practices / SEO for desktop + mobile and the LCP/INP/CLS values. Flag anything below 98.

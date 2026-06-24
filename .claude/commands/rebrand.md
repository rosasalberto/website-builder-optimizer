---
description: Regenerate the brand theme from theme.config.ts into globals.css (colors, radius, fonts) so the whole site reskins.
---

The user edited `theme.config.ts` (or wants to). Apply the brand:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node scripts/rebrand.mjs
```

This rewrites the `@theme { … }` block in `src/app/globals.css` from the tokens in
`theme.config.ts`. Remind the user that brand NAME, nav, social, org, and locales live in
`site.config.ts` (not theme), and logos live in `public/logos/`. After rebranding, run
`pnpm dev` and verify the new look on the home page.

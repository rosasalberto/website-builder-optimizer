---
description: Complete translations for all locales — report parity, then fill missing keys.
---

Use the `i18n-locale-quality` skill.

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node scripts/quality/i18n-parity.mjs            # report missing/empty/ICU per locale
```

For each locale with missing keys, translate the corresponding English values (transcreate,
keep ICU `{tokens}` identical, keep brand names/code). Use the `OPENROUTER_API_KEY` helper in
`scripts/blog/translate.ts` for bulk, or translate inline for small sets. Re-run parity until
every locale reports OK. Default-locale (`en`) is canonical; others deep-merge on top, so the
site never breaks while translations are in progress.

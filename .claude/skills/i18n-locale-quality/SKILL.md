---
name: i18n-locale-quality
description: >-
  Check and fix translation completeness across all locales — missing keys,
  empty values, ICU placeholder mismatches, and hardcoded strings. Use when
  asked to "check translations", "are all locales complete", "fix i18n parity",
  "find untranslated strings", or after adding a new page/locale. Wraps
  scripts/quality/i18n-parity.mjs.
---

# i18n Locale Quality

Locales come from `site.config.ts` `domain.locales`; UI strings live in
`messages/<locale>.json`. The default locale (`en`) is canonical; others deep-merge
on top of it at runtime, so a missing key never crashes — it falls back to English.

## When to use
"check translation parity", "which locales are incomplete", "fix missing translations",
after adding a page (new keys) or a locale.

## Run
```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node scripts/quality/i18n-parity.mjs          # report missing/empty/ICU-mismatch per locale
node scripts/quality/i18n-parity.mjs --fix     # stub missing keys (then translate them)
```

## Completing translations
1. `i18n-parity.mjs` lists the missing keys per locale.
2. For real translations, translate the missing English values per locale (use the
   `OPENROUTER_API_KEY` translate helper in `scripts/blog/translate.ts`, or translate
   inline). Keep ICU placeholders (`{date}`, `{count}`) identical.
3. Re-run parity until every locale reports OK.

## Checks
- **Missing/empty** keys vs `en.json`.
- **ICU placeholder parity** — same `{tokens}` in every locale.
- **Extra keys** not in `en` (stale).

## Note
A green build does not require full parity (fallback covers gaps), but a polished
site should reach parity before launch. New pages add English keys first; translate
before shipping that locale.

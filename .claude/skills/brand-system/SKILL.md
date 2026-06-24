---
name: brand-system
description: The brand + styling contract for this template. Use whenever you generate, edit, or review ANY visual surface (a page, a section, an OG card, an email, a blog cover, a component) or when asked "is this on-brand", "what colors do we use", "how does the rebrand work", or "reskin the site". The brand is 100% config-driven — read site.config.ts (brand name, logos, domain, social, org) + theme.config.ts (color tokens, radius, fonts) + messages/*.json (copy). NEVER hardcode a brand name, hex color, or font. This skill is also the reference the brand-discriminator and the generator↔discriminator loop critique against.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

# Brand System — the config-driven styling contract

This template has **no hardcoded brand**. Everything visual derives from two files
plus the i18n messages. Any surface you generate must read these first and pull every
value from them — never invent a color, font, name, or tagline.

## The rebrand surface (read these, always)

| File | Owns |
|------|------|
| `site.config.ts` | `brand.{name, legalName, tagline, description, logo, favicon}`, `domain.{url, defaultLocale, locales[]}`, `nav`, `social`, `org`, `analytics` (public IDs only), `features`, `seo.{defaultOgImage, twitterHandle, titleTemplate}` |
| `theme.config.ts` | `colors.{background, foreground, muted, muted-foreground, line, brand, brand-foreground, dark-background, dark-foreground}`, `radius`, `font.{sans, mono}` |
| `messages/{locale}.json` | All visible copy, namespaced (`common`, `nav`, `home`, `blog`, `footer`, `seo`, …) |
| `/public/logos/*` | `logo-light.svg`, `logo-dark.svg`, `mark.svg`, favicon |

`pnpm rebrand` (`node scripts/rebrand.mjs`) reads `theme.config.ts` and writes CSS custom
properties into the `@theme` block of `src/app/globals.css`, which Tailwind 4 turns into
utility classes. **Edit a token → run `pnpm rebrand` → the whole site reskins.**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # or rely on .nvmrc (node 22)
pnpm rebrand
```

## The styling contract (what every generated surface must honor)

1. **One brand accent.** `theme.config.ts` ships a single `brand` color (default `#2567ff`).
   Use it for primary CTAs, focus rings, links, and exactly one accent per H1 — never a
   rainbow. Reference it as the token `bg-brand` / `text-brand` / `border-brand`, never a hex.
2. **Tokens, not hexes.** Use `bg-background`, `text-foreground`, `text-muted-foreground`,
   `border-line`, `bg-muted`. A hardcoded `#`-color in generated TSX is a brand violation.
3. **Two canvases.** Light canvas (`background`/`foreground`) is the default. A dark canvas
   (`dark-background`/`dark-foreground`) is available for security/compliance/footer sections.
4. **Type.** `font.sans` (default Inter) at a medium weight for display; `font.mono` for code.
   Pull the family from `theme.config.ts`; the layout loads it via `next/font`.
5. **Radius.** Single `radius` token (`0.625rem` default) → `rounded-[var(--radius)]` /
   `rounded-lg`. Keep one radius scale; don't mix sharp and pill on the same surface.
6. **White-dominant, calm.** Generous whitespace, monochrome by default, accent used sparingly.
   No status-color pills (red/amber/green) as decoration — they read as alerts.
7. **Logo lockup.** Use `siteConfig.brand.logo.light` on light canvas, `.dark` on dark canvas,
   `.mark` for square/favicon/OG contexts. Never recolor or stretch the logo.

## How to apply it

- **Generating a page/section:** import nothing brand-specific; use Tailwind token classes and
  `siteConfig` / `useTranslations()` for every string. Headline nouns come from `messages`, not
  prose you write.
- **Generating an OG card / cover:** pull `brand.name`, `brand.logo.mark`, and the `brand` +
  `background` + `foreground` colors from config (see the `og-image` skill).
- **Reviewing:** grep the target for hardcoded hex (`#[0-9a-fA-F]{3,6}`), hardcoded brand strings
  (the literal brand name instead of `siteConfig.brand.name`), and non-token colors. Each is a fix.

## Anti-patterns to flag

| Anti-pattern | Why it's wrong |
|---|---|
| Hardcoded hex in TSX | Breaks `pnpm rebrand`; bypasses the token system |
| Literal brand name in copy/components | Should be `siteConfig.brand.name` |
| Multiple accent colors | Violates the single-accent rule |
| `<img>` logo with inline color | Use the config logo path on the right canvas |
| Inline font-family | Use `theme.config.ts` `font.*` via the layout |

## Pairs with

- `og-image` — composes cards from these tokens.
- `generator-discriminator-loop` — its brand precedence rule is: **site.config + theme.config +
  messages take precedence over any external reference.**
- `website-page-builder-loop` → `brand-discriminator` agent enforces this contract mechanically.

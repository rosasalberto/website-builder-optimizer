/**
 * theme.config.ts — brand DESIGN TOKENS (the second half of the rebrand
 * surface, alongside site.config.ts). `pnpm rebrand` reads these and writes
 * the CSS custom properties into src/app/globals.css (@theme block), which
 * Tailwind 4 turns into utility classes (bg-brand, text-foreground, ...).
 *
 * Edit a token here, run `pnpm rebrand`, and the whole site reskins.
 */
export const themeConfig = {
  colors: {
    /* Canvas */
    background: "#ffffff",
    foreground: "#0a0a0a",
    muted: "#f5f5f7",
    "muted-foreground": "#6b7280",
    line: "#e5e7eb",
    /* Single brand accent — keep it one colour for a clean, modern look. */
    brand: "#2567ff",
    "brand-foreground": "#ffffff",
    /* Dark canvas (compliance/security pages, dark sections) */
    "dark-background": "#0a0a0a",
    "dark-foreground": "#fafafa",
  },
  radius: "0.625rem",
  font: {
    /* next/font family name loaded in the frontend layout. */
    sans: "Inter",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
} as const;

export type ThemeConfig = typeof themeConfig;

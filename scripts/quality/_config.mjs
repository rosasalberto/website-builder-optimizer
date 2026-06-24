/** Shared helpers for the quality scripts (no deps; reads the repo's config). */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Locale codes parsed from site.config.ts (first = default). */
export function getLocales() {
  try {
    const src = readFileSync(join(ROOT, "site.config.ts"), "utf8");
    const block = src.slice(src.indexOf("locales:"));
    const codes = [...block.matchAll(/code:\s*"([^"]+)"/g)].map((m) => m[1]);
    return codes.length ? codes : ["en"];
  } catch {
    return ["en"];
  }
}

export function getDefaultLocale() {
  try {
    const src = readFileSync(join(ROOT, "site.config.ts"), "utf8");
    const m = src.match(/defaultLocale:\s*"([^"]+)"/);
    return m ? m[1] : "en";
  } catch {
    return "en";
  }
}

/** Brand color tokens parsed from theme.config.ts. */
export function getThemeColors() {
  try {
    const src = readFileSync(join(ROOT, "theme.config.ts"), "utf8");
    const out = {};
    for (const m of src.matchAll(/"?([a-z-]+)"?:\s*"(#[0-9a-fA-F]{3,8})"/g)) out[m[1]] = m[2];
    return out;
  } catch {
    return {};
  }
}

export const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

export function nodeGuard() {
  const major = Number(process.versions.node.split(".")[0]);
  if (major >= 25) {
    console.warn(
      c.yellow(`⚠ Node ${process.versions.node} detected. Use Node 22 — Payload + Next 16 do not support Node 25 yet.`),
    );
  }
}

#!/usr/bin/env node
/**
 * Regenerate the @theme {} block in src/app/globals.css from theme.config.ts.
 * Idempotent — run after editing tokens to reskin the whole site.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfgSrc = readFileSync(join(ROOT, "theme.config.ts"), "utf8");

const colors = {};
const colorBlock = cfgSrc.slice(cfgSrc.indexOf("colors:"), cfgSrc.indexOf("radius:"));
for (const m of colorBlock.matchAll(/"?([a-zA-Z-]+)"?:\s*"(#[0-9a-fA-F]{3,8})"/g)) colors[m[1]] = m[2];
const radius = (cfgSrc.match(/radius:\s*"([^"]+)"/) || [])[1] || "0.625rem";

const lines = ["@theme {"];
for (const [name, val] of Object.entries(colors)) lines.push(`  --color-${name}: ${val};`);
lines.push("");
lines.push(`  --radius: ${radius};`);
lines.push("");
lines.push("  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;");
lines.push("  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;");
lines.push("}");
const block = lines.join("\n");

const cssPath = join(ROOT, "src", "app", "globals.css");
let css = readFileSync(cssPath, "utf8");
const start = css.indexOf("@theme {");
const end = css.indexOf("}", start);
if (start === -1 || end === -1) {
  console.error("Could not find @theme {} block in globals.css");
  process.exit(1);
}
css = css.slice(0, start) + block + css.slice(end + 1);
writeFileSync(cssPath, css);
console.log(`✓ rebranded: wrote ${Object.keys(colors).length} color tokens + radius to globals.css`);

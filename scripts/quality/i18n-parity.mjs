#!/usr/bin/env node
/** Verify every locale's messages match en.json (keys + ICU placeholders). */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, getLocales, getDefaultLocale, c } from "./_config.mjs";

const fix = process.argv.includes("--fix");
const def = getDefaultLocale();
const locales = getLocales().filter((l) => l !== def);
const msgDir = join(ROOT, "messages");

const load = (l) => JSON.parse(readFileSync(join(msgDir, `${l}.json`), "utf8"));
const flatten = (obj, prefix = "", out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
};
const placeholders = (s) =>
  typeof s === "string" ? [...s.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort().join(",") : "";

const base = flatten(load(def));
let problems = 0;

for (const locale of locales) {
  let data;
  try { data = flatten(load(locale)); } catch { console.error(c.red(`✗ ${locale}.json missing/invalid`)); problems++; continue; }
  const missing = Object.keys(base).filter((k) => !(k in data) || data[k] === "");
  const extra = Object.keys(data).filter((k) => !(k in base));
  const icu = Object.keys(base).filter((k) => k in data && placeholders(base[k]) !== placeholders(data[k]));
  if (missing.length || extra.length || icu.length) {
    problems++;
    console.error(c.yellow(`\n${locale}.json`));
    if (missing.length) console.error(`  ${c.red("missing/empty")} (${missing.length}): ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? "…" : ""}`);
    if (extra.length) console.error(`  ${c.yellow("extra")} (${extra.length}): ${extra.slice(0, 8).join(", ")}`);
    if (icu.length) console.error(`  ${c.red("ICU mismatch")} (${icu.length}): ${icu.slice(0, 8).join(", ")}`);
  } else {
    console.log(c.green(`✓ ${locale}.json parity OK (${Object.keys(base).length} keys)`));
  }
}

if (problems && fix) {
  console.log(c.dim("\n--fix only reports; use the translate skill to fill missing keys (deep-merge fallback keeps the site working meanwhile)."));
}
process.exit(problems ? 1 : 0);

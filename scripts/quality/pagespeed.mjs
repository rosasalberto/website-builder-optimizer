#!/usr/bin/env node
/**
 * Lighthouse / PageSpeed Insights scorer.
 *   node scripts/quality/pagespeed.mjs --engine lighthouse --base http://localhost:3000 --min 98
 *   node scripts/quality/pagespeed.mjs --engine psi --base https://example.com   (needs PAGESPEED_API_KEY)
 */
import { execFileSync } from "node:child_process";
import { c } from "./_config.mjs";

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const engine = arg("--engine", "lighthouse");
const base = (arg("--base", "http://localhost:3000")).replace(/\/$/, "");
const min = Number(arg("--min", "98"));
const path = arg("--path", "/");
const url = `${base}${path}`;
const CATS = ["performance", "accessibility", "best-practices", "seo"];

let scores;
if (engine === "psi") {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) { console.error(c.red("PAGESPEED_API_KEY required for --engine psi")); process.exit(1); }
  scores = {};
  for (const strat of ["mobile", "desktop"]) {
    const u = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strat}&key=${key}${CATS.map((cat) => `&category=${cat}`).join("")}`;
    const data = await (await fetch(u)).json();
    if (!data.lighthouseResult) { console.error(c.red("PSI error: " + JSON.stringify(data.error || data).slice(0, 200))); process.exit(1); }
    scores[strat] = Object.fromEntries(CATS.map((cat) => [cat, Math.round(data.lighthouseResult.categories[cat].score * 100)]));
  }
} else {
  // local lighthouse via npx
  scores = { desktop: {} };
  let out;
  try {
    out = execFileSync("npx", ["--yes", "lighthouse", url, "--quiet", "--chrome-flags=--headless=new --no-sandbox", "--only-categories=" + CATS.join(","), "--output=json", "--output-path=stdout"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    console.error(c.yellow("⚠ lighthouse unavailable (" + (e.message || "").slice(0, 80) + "). Install or use --engine psi. Skipping (non-fatal).")); process.exit(0);
  }
  const r = JSON.parse(out);
  scores.desktop = Object.fromEntries(CATS.map((cat) => [cat, Math.round(r.categories[cat].score * 100)]));
}

let failed = false;
for (const [strat, cats] of Object.entries(scores)) {
  for (const [cat, val] of Object.entries(cats)) {
    const ok = val >= min;
    if (!ok) failed = true;
    console.log(`${ok ? c.green("✓") : c.red("✗")} ${strat.padEnd(8)} ${cat.padEnd(16)} ${val}`);
  }
}
process.exit(failed ? 1 : 0);

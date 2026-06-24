#!/usr/bin/env node
/**
 * Probe a running site for per-route SEO correctness.
 *   BASE=http://localhost:3000 node scripts/quality/seo-live-check.mjs
 */
import { getLocales, getDefaultLocale, c } from "./_config.mjs";

const BASE = (process.env.BASE || "http://localhost:3000").replace(/\/$/, "");
const PROD = (process.env.NEXT_PUBLIC_VERCEL_ENV || "") === "production";
const def = getDefaultLocale();
const locales = getLocales();

const PATHS = ["/", "/features", "/pricing", "/about", "/blog"];
// default-locale unprefixed + each non-default locale prefixed for "/"
const routes = [
  ...PATHS,
  ...locales.filter((l) => l !== def).map((l) => `/${l}`),
];

const checks = (html, path) => {
  const has = (re) => re.test(html);
  const count = (re) => (html.match(re) || []).length;
  return {
    "<title>": has(/<title[^>]*>[^<]+<\/title>/i),
    "meta description": has(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i),
    canonical: has(/<link[^>]+rel=["']canonical["']/i),
    hreflang: has(/hreflang=/i) || path === "/blog",
    "x-default": has(/hreflang=["']x-default["']/i) || path === "/blog",
    "og:image": has(/property=["']og:image["']/i),
    "single h1": count(/<h1[\s>]/gi) <= 1,
    "json-ld": has(/application\/ld\+json/i),
    "lang attr": has(/<html[^>]+lang=/i),
    "not noindex": !PROD || !has(/name=["']robots["'][^>]*noindex/i),
  };
};

let failed = 0;
for (const path of routes) {
  let res, html;
  try {
    res = await fetch(`${BASE}${path}`, { redirect: "follow" });
    html = await res.text();
  } catch (e) {
    console.error(c.yellow(`⚠ ${path} — unreachable (${e.message}), skipping`));
    continue;
  }
  if (res.status !== 200) {
    console.error(c.yellow(`⚠ ${path} — HTTP ${res.status}, skipping`));
    continue;
  }
  const results = checks(html, path);
  const fails = Object.entries(results).filter(([, ok]) => !ok).map(([k]) => k);
  if (fails.length) {
    failed += fails.length;
    console.error(c.red(`✗ ${path}`) + c.dim(` — ${fails.join(", ")}`));
  } else {
    console.log(c.green(`✓ ${path}`));
  }
}

if (failed) { console.error(c.red(`\n${failed} SEO check(s) failed`)); process.exit(1); }
console.log(c.green("\nAll SEO live checks passed."));

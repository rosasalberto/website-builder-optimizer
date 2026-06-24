#!/usr/bin/env node
/**
 * Static per-route quality scorer for marketing pages.
 * Scores each src/app/(frontend)/[locale]/.../page.tsx on 5 dimensions;
 * per-dimension floor 90, overall >=98.
 *   node scripts/quality/discriminator-loop.mjs --summary
 *   node scripts/quality/discriminator-loop.mjs --route /pricing
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT, c } from "./_config.mjs";

const args = process.argv.slice(2);
const only = args.includes("--route") ? args[args.indexOf("--route") + 1] : null;

const pagesRoot = join(ROOT, "src", "app", "(frontend)", "[locale]");
const CONTENT_LIST_ROUTES = new Set(["/blog", "/blog/[slug]", "/legal/[slug]"]);

function findPages(dir, base = "") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      const seg = name.startsWith("(") && name.endsWith(")") ? "" : `/${name}`;
      out.push(...findPages(p, base + seg));
    } else if (name === "page.tsx") {
      out.push({ route: base || "/", file: p });
    }
  }
  return out;
}

const SECTION_TAGS =
  /<(Hero|Feature(Grid|List)|StatsRow|HowItWorks|Faq|CtaSection|LogoCloud|PricingTiers|SectionHeading|ContactForm)\b/g;

function score(src, route) {
  const isList = CONTENT_LIST_ROUTES.has(route);
  // Pages compose archetypes/sections; section count = composed components +
  // any inline data-section markers. Archetypes carry the sections + JSON-LD.
  const usesArchetype = /Archetype\b/.test(src);
  const sectionRefs =
    (src.match(/data-section=/g) || []).length + (src.match(SECTION_TAGS) || []).length;
  const composes = usesArchetype || /@\/components\//.test(src);
  const dims = {
    Content: isList || usesArchetype || sectionRefs >= 4 ? 100 : sectionRefs >= 2 ? 80 : 50,
    // Complete metadata via the canonical factory = 90 (seo-live-check verifies
    // the runtime output incl. JSON-LD); an explicit structured-data marker = +10.
    SEO:
      /generateMetadata/.test(src) && /buildMetadata/.test(src)
        ? /JsonLd|articleLd|breadcrumbLd|websiteLd|faqLd|Archetype\b/.test(src) || isList
          ? 100
          : 90
        : /generateMetadata/.test(src)
          ? 50
          : 0,
    "Next.js":
      100 -
      (/<img\s/.test(src) ? 40 : 0) -
      (/force-dynamic/.test(src) && !isList ? 30 : 0) -
      (/<a\s+href=["']\//.test(src) ? 30 : 0),
    Reusability: composes ? 100 : 60,
    Responsive: composes || isList || (src.match(/\bmd:/g) || []).length >= 2 ? 100 : 70,
  };
  const overall = Math.round(Object.values(dims).reduce((a, b) => a + b, 0) / Object.keys(dims).length);
  return { dims, overall };
}

let pages = findPages(pagesRoot);
if (only) pages = pages.filter((p) => p.route === only);

let failed = 0;
for (const { route, file } of pages.sort((a, b) => a.route.localeCompare(b.route))) {
  const src = readFileSync(file, "utf8");
  const { dims, overall } = score(src, route);
  const dimFail = Object.entries(dims).filter(([, v]) => v < 90).map(([k]) => k);
  const ok = overall >= 98 && dimFail.length === 0;
  if (!ok) failed++;
  const tag = ok ? c.green("PASS") : c.red("FAIL");
  console.log(`${tag} ${overall.toString().padStart(3)}  ${route}${dimFail.length ? c.dim("  ↓ " + dimFail.join(",")) : ""}`);
}
console.log(c.dim(`\n${pages.length} routes · ${failed} below gate`));
process.exit(failed ? 1 : 0);

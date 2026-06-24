#!/usr/bin/env node
/**
 * Seed synthetic blog posts to prove the 10k-scale path.
 *   pnpm seed -- --count 10000 --batch 500
 *   node scripts/seed-posts.mjs --count 200 --dry-run
 *
 * Self-bootstraps through `payload run` so the Payload config graph (extension-
 * less imports, @payload-config) resolves regardless of how it's launched.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __file = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__file), "..");

// ── self-bootstrap ───────────────────────────────────────────────────────────
if (!process.env.WB_SEED_BOOTSTRAPPED && !process.argv.includes("--dry-run")) {
  const bin = join(ROOT, "node_modules", "payload", "bin.js");
  const r = spawnSync("node", [bin, "run", __file, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, WB_SEED_BOOTSTRAPPED: "1" },
    cwd: ROOT,
  });
  process.exit(r.status ?? 1);
}

// ── args ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const COUNT = Number(arg("--count", "10000"));
const BATCH = Number(arg("--batch", "500"));
const LOCALES = arg("--locales", "en,es,fr,de").split(",");
const DRY = argv.includes("--dry-run");
const DEFAULT = LOCALES[0];

// deterministic RNG (no Math.random — keeps runs reproducible)
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const WORDS = "identity verification fraud onboarding compliance signal latency throughput pipeline workflow document liveness biometric registry screening".split(" ");
function body(seed) {
  const rng = mulberry32(seed);
  const para = () => {
    const n = 40 + Math.floor(rng() * 30);
    const words = Array.from({ length: n }, () => WORDS[Math.floor(rng() * WORDS.length)]);
    return { type: "paragraph", version: 1, children: [{ type: "text", version: 1, text: words.join(" ") + "." }] };
  };
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children: [para(), para(), para(), para()] } };
}

if (DRY) {
  console.log(`[dry-run] would seed ${COUNT} posts × ${LOCALES.length} locales (batch ${BATCH}).`);
  console.log(`[dry-run] sample slug: post-1 · sample title: "Post 1"`);
  process.exit(0);
}

// ── seed via Local API ──────────────────────────────────────────────────────
const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config.ts");
const payload = await getPayload({ config });

const t0 = Date.now();
let created = 0;
for (let start = 1; start <= COUNT; start += BATCH) {
  const end = Math.min(start + BATCH - 1, COUNT);
  await Promise.all(
    Array.from({ length: end - start + 1 }, (_, k) => start + k).map(async (i) => {
      const doc = await payload.create({
        collection: "posts",
        locale: DEFAULT,
        data: {
          title: `Post ${i}`,
          slug: `post-${i}`,
          excerpt: `Synthetic seed post ${i} for scalability testing.`,
          content: body(i),
          publishedAt: new Date(2026, 0, 1 + (i % 360)).toISOString(),
          _status: "published",
        },
        context: { disableRevalidate: true },
      });
      for (const loc of LOCALES.slice(1)) {
        await payload.update({
          collection: "posts",
          id: doc.id,
          locale: loc,
          data: { title: `Post ${i} (${loc})`, excerpt: `Entrada ${i}`, content: body(i) },
          context: { disableRevalidate: true },
        });
      }
      created++;
    }),
  );
  if (end % (BATCH * (BATCH >= 500 ? 1 : 5)) === 0 || end === COUNT) {
    console.log(`  seeded ${end}/${COUNT}  (${Math.round((Date.now() - t0) / 1000)}s)`);
  }
}
console.log(`✓ seeded ${created} posts × ${LOCALES.length} locales in ${Math.round((Date.now() - t0) / 1000)}s`);
process.exit(0);

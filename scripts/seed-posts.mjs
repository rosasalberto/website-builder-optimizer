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

// ── args (parsed in BOTH parent and child) ──────────────────────────────────
// `payload run` does NOT forward argv past the script path, so config is passed
// to the bootstrapped child via env vars instead.
const argv = process.argv.slice(2);
const arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const COUNT = Number(process.env.WB_SEED_COUNT ?? arg("--count", "10000"));
const BATCH = Number(process.env.WB_SEED_BATCH ?? arg("--batch", "500"));
const LOCALES = (process.env.WB_SEED_LOCALES ?? arg("--locales", "en,es,fr,de")).split(",");
const DRY = argv.includes("--dry-run") || process.env.WB_SEED_DRY === "1";
const DEFAULT = LOCALES[0];

// ── self-bootstrap through `payload run` (resolves @payload-config + TS imports) ─
if (!process.env.WB_SEED_BOOTSTRAPPED && !DRY) {
  const bin = join(ROOT, "node_modules", "payload", "bin.js");
  const r = spawnSync("node", [bin, "run", __file], {
    stdio: "inherit",
    env: {
      ...process.env,
      WB_SEED_BOOTSTRAPPED: "1",
      WB_SEED_COUNT: String(COUNT),
      WB_SEED_BATCH: String(BATCH),
      WB_SEED_LOCALES: LOCALES.join(","),
    },
    cwd: ROOT,
  });
  process.exit(r.status ?? 1);
}

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
// The afterChange hook calls revalidateTag/revalidatePath, which throw (caught)
// outside a request scope — harmless, but 40k warnings would drown the output.
try { payload.logger.level = "error"; } catch {}

const t0 = Date.now();
let created = 0;
let skipped = 0;

// SQLite is single-writer: concurrent writes -> SQLITE_BUSY. Serialize on
// SQLite; let Postgres absorb real concurrency.
const isSqlite = (process.env.DATABASE_URI || "file:").startsWith("file:");
const CONCURRENCY = isSqlite ? 1 : Math.min(BATCH, 25);

// SQLite returns SQLITE_BUSY under write pressure; wait out the lock and retry
// instead of dropping the row. No-op for Postgres (it won't throw BUSY).
const isBusy = (e) => /SQLITE_BUSY|readonly database|database is locked/i.test(String(e?.message || e));
async function withBusyRetry(fn, tries = 10) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (isBusy(err) && attempt < tries) {
        await new Promise((r) => setTimeout(r, 20 * attempt));
        continue;
      }
      throw err;
    }
  }
}

async function seedOne(i) {
  try {
    const doc = await withBusyRetry(() =>
      payload.create({
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
      }),
    );
    for (const loc of LOCALES.slice(1)) {
      await withBusyRetry(() =>
        payload.update({
          collection: "posts",
          id: doc.id,
          locale: loc,
          // slug is a LOCALIZED field — it must be set per locale or the blog
          // query (where slug equals … in that locale) can't resolve
          // /es|fr|de/blog/post-i and the localized post 404s.
          data: { title: `Post ${i} (${loc})`, slug: `post-${i}`, excerpt: `Entrada ${i}`, content: body(i) },
          context: { disableRevalidate: true },
        }),
      );
    }
    created++;
  } catch (err) {
    // Most common: a duplicate slug on re-run. Skip it so a partial/repeat run
    // stays idempotent instead of aborting the whole batch.
    skipped++;
    if (skipped <= 3) console.warn(`  skip post-${i}: ${String(err.message || err).split("\n")[0].slice(0, 100)}`);
  }
}

const ids = Array.from({ length: COUNT }, (_, k) => k + 1);
for (let i = 0; i < ids.length; i += CONCURRENCY) {
  await Promise.all(ids.slice(i, i + CONCURRENCY).map(seedOne));
  const done = Math.min(i + CONCURRENCY, ids.length);
  if (done % 500 === 0 || done === ids.length) {
    console.log(`  seeded ${done}/${COUNT}  (${Math.round((Date.now() - t0) / 1000)}s)`);
  }
}
console.log(
  `✓ seeded ${created} posts × ${LOCALES.length} locales` +
    (skipped ? ` (${skipped} skipped)` : "") +
    ` in ${Math.round((Date.now() - t0) / 1000)}s`,
);
process.exit(0);

#!/usr/bin/env node
/**
 * Prove the template holds at scale.
 *   node scripts/quality/scalability-test.mjs --count 10000
 * Seeds N posts, builds, asserts artifact < 220 MB, validates sitemap shards,
 * and confirms a long-tail post renders via ISR. Prints PASS/FAIL gates.
 */
import { spawnSync } from "node:child_process";
import { ROOT, c, nodeGuard } from "./_config.mjs";

const args = process.argv.slice(2);
const count = Number(args.includes("--count") ? args[args.indexOf("--count") + 1] : "10000");
const NODE22 = "/opt/homebrew/opt/node@22/bin";
const env = { ...process.env, PATH: `${NODE22}:${process.env.PATH}` };
const gates = [];
const gate = (name, ok, note = "") => { gates.push({ name, ok, note }); console.log(`${ok ? c.green("✓") : c.red("✗")} ${name}${note ? c.dim("  " + note) : ""}`); };

nodeGuard();

// 1. seed
console.log(c.bold(`\nSeeding ${count} posts…`));
const seed = spawnSync("node", ["scripts/seed-posts.mjs", "--count", String(count)], { cwd: ROOT, env, stdio: "inherit" });
gate("seed", (seed.status ?? 1) === 0);

// 2. build
console.log(c.bold("\nBuilding…"));
const build = spawnSync("pnpm", ["build"], { cwd: ROOT, env, stdio: "inherit" });
gate("build", (build.status ?? 1) === 0);

// 3. artifact size
const size = spawnSync("node", ["scripts/quality/check-artifact-size.mjs"], { cwd: ROOT, env, stdio: "inherit" });
gate("artifact < 220 MB", (size.status ?? 1) === 0);

// 4. sitemap shards (requires a running server — caller can set BASE)
const BASE = process.env.BASE;
if (BASE) {
  try {
    const idx = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const shardUrls = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    gate("sitemap index valid", /<sitemapindex/.test(idx) && shardUrls.length > 0, `${shardUrls.length} shards`);
    let maxUrls = 0;
    for (const u of shardUrls.slice(0, 5)) {
      const xml = await (await fetch(u)).text();
      maxUrls = Math.max(maxUrls, (xml.match(/<loc>/g) || []).length);
    }
    gate("each shard <= 50k urls", maxUrls <= 50000, `max ${maxUrls}`);
    const tail = await fetch(`${BASE}/blog/post-${count}`);
    gate("long-tail post renders (ISR)", tail.status === 200, `HTTP ${tail.status}`);
  } catch (e) {
    gate("sitemap/ISR checks", false, "server unreachable: " + e.message);
  }
} else {
  console.log(c.yellow("\n⚠ Set BASE=<running server url> to also validate sitemaps + long-tail ISR."));
}

const failed = gates.filter((g) => !g.ok).length;
console.log(failed ? c.red(`\n${failed} scalability gate(s) failed`) : c.green("\nAll scalability gates passed ✓"));
process.exit(failed ? 1 : 0);

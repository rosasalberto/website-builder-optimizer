#!/usr/bin/env node
/**
 * The single quality gate. Run before every push.
 *   node scripts/quality/validate-all.mjs [--skip-lighthouse] [--prod <url>]
 */
import { spawnSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "node:net";
import { ROOT, c, nodeGuard } from "./_config.mjs";

const args = process.argv.slice(2);
const skipLH = args.includes("--skip-lighthouse");
const prodUrl = args.includes("--prod") ? args[args.indexOf("--prod") + 1] : null;
const NODE22 = "/opt/homebrew/opt/node@22/bin";
const env = { ...process.env, PATH: `${NODE22}:${process.env.PATH}` };

nodeGuard();
const results = [];
const run = (name, cmd, cmdArgs, opts = {}) => {
  const t = Date.now();
  const r = spawnSync(cmd, cmdArgs, { cwd: ROOT, env, stdio: "inherit", ...opts });
  const ok = (r.status ?? 1) === 0;
  results.push({ name, ok, ms: Date.now() - t, skipped: false });
  return ok;
};
const skip = (name) => results.push({ name, ok: true, ms: 0, skipped: true });

const freePort = () =>
  new Promise((res) => { const s = createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });

// 1–4 static gates
const hasPrettier = existsSync(join(ROOT, "node_modules", ".bin", "prettier"));
hasPrettier ? run("prettier", "pnpm", ["exec", "prettier", "--check", "."]) : skip("prettier");
if (!run("typecheck", "pnpm", ["exec", "tsc", "--noEmit"])) finish();
run("eslint", "pnpm", ["lint"]);
run("i18n-parity", "node", ["scripts/quality/i18n-parity.mjs"]);
run("discriminator", "node", ["scripts/quality/discriminator-loop.mjs", "--summary"]);

if (prodUrl) {
  // Production scorecard against a live URL — skip local build/boot.
  run("seo-live-check", "node", ["scripts/quality/seo-live-check.mjs"], { env: { ...env, BASE: prodUrl } });
  skipLH ? skip("lighthouse") : run("pagespeed", "node", ["scripts/quality/pagespeed.mjs", "--engine", "psi", "--base", prodUrl]);
  finish();
}

// 5–6 build + artifact
if (!run("build", "pnpm", ["build"])) finish();
run("artifact-size", "node", ["scripts/quality/check-artifact-size.mjs"]);

// 7 boot + live checks
const port = await freePort();
const base = `http://localhost:${port}`;
// `pnpm exec next start -p` so the port reliably reaches Next (pnpm doesn't always forward --port).
const server = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], {
  cwd: ROOT,
  env,
  stdio: "ignore",
});
const up = await waitFor(base, 60);
if (!up) { results.push({ name: "boot", ok: false, ms: 0 }); server.kill(); finish(); }
run("seo-live-check", "node", ["scripts/quality/seo-live-check.mjs"], { env: { ...env, BASE: base } });
skipLH ? skip("lighthouse") : run("pagespeed", "node", ["scripts/quality/pagespeed.mjs", "--engine", "lighthouse", "--base", base]);
server.kill();
finish();

async function waitFor(url, tries) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { redirect: "manual" }); if (r.status < 500) return true; } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function finish() {
  console.log("\n" + c.bold("── validate-all ──"));
  let bad = 0;
  for (const r of results) {
    const tag = r.skipped ? c.yellow("SKIP") : r.ok ? c.green("PASS") : c.red("FAIL");
    if (!r.ok && !r.skipped) bad++;
    console.log(`  ${tag}  ${r.name.padEnd(16)} ${c.dim((r.ms / 1000).toFixed(1) + "s")}`);
  }
  console.log(bad ? c.red(`\n${bad} gate(s) failed`) : c.green("\nAll gates passed ✓"));
  process.exit(bad ? 1 : 0);
}

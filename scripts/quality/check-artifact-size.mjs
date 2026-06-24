#!/usr/bin/env node
/** Fail if the build artifact is too big to deploy. */
import { statSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, c, nodeGuard } from "./_config.mjs";

const LIMIT = Number(process.env.ARTIFACT_LIMIT_BYTES) || 220 * 1024 * 1024;
const FUNC_LIMIT = Number(process.env.FUNCTION_LIMIT_BYTES) || 240 * 1024 * 1024;
const EXCLUDE_DIRS = new Set(["cache", "dev", "turbopack", "build", "diagnostics", "standalone"]);

function dirSize(dir, { excludeTopDirs = false } = {}) {
  let total = 0;
  const entries = [];
  for (const name of safeReaddir(dir)) {
    const p = join(dir, name);
    const st = statSafe(p);
    if (!st) continue;
    if (st.isDirectory()) {
      if (excludeTopDirs && EXCLUDE_DIRS.has(name)) continue;
      const s = dirSize(p);
      total += s;
      entries.push([name, s]);
    } else {
      if (name.endsWith(".map")) continue;
      total += st.size;
      entries.push([name, st.size]);
    }
  }
  return excludeTopDirs ? { total, entries } : total;
}

const safeReaddir = (d) => { try { return readdirSync(d); } catch { return []; } };
const statSafe = (p) => { try { return statSync(p); } catch { return null; } };
const mb = (b) => (b / 1024 / 1024).toFixed(1) + " MB";

nodeGuard();
const next = join(ROOT, ".next");
if (!existsSync(next)) {
  console.error(c.red("✗ No .next build found. Run `pnpm build` first."));
  process.exit(1);
}

const { total, entries } = dirSize(next, { excludeTopDirs: true });
let failed = false;

if (total > LIMIT) {
  failed = true;
  console.error(c.red(`✗ .next artifact ${mb(total)} exceeds limit ${mb(LIMIT)}`));
  console.error("  Largest entries:");
  for (const [n, s] of entries.sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    console.error(`    ${mb(s).padStart(10)}  ${n}`);
  }
} else {
  console.log(c.green(`✓ .next artifact ${mb(total)} under ${mb(LIMIT)}`));
}

// Per-function Vercel check
const funcDir = join(ROOT, ".vercel", "output", "functions");
if (existsSync(funcDir)) {
  for (const name of safeReaddir(funcDir)) {
    if (!name.endsWith(".func")) continue;
    const s = dirSize(join(funcDir, name));
    if (s > FUNC_LIMIT) {
      failed = true;
      console.error(c.red(`✗ function ${name} ${mb(s)} exceeds ${mb(FUNC_LIMIT)}`));
    }
  }
}

process.exit(failed ? 1 : 0);

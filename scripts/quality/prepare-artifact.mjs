#!/usr/bin/env node
/** Strip dev caches + sourcemaps from .next before measuring/deploying. */
import { rmSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ROOT, c } from "./_config.mjs";

const next = join(ROOT, ".next");
for (const d of ["cache", "dev", "turbopack", "build", "diagnostics"]) {
  rmSync(join(next, d), { recursive: true, force: true });
}

let stripped = 0;
function stripMaps(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    const p = join(dir, name);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) stripMaps(p);
    else if (name.endsWith(".map")) { rmSync(p, { force: true }); stripped++; }
  }
}
stripMaps(join(next, "server"));
console.log(c.green(`✓ prepared artifact (removed dev caches + ${stripped} sourcemaps)`));

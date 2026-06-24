---
description: Daily autonomous Core Web Vitals routine — measure production speed and open a fix PR on regression.
---

Autonomous performance guard. Posture: **fixes go through a PR — never auto-merge.**

1. **Measure** production (`pagespeed` skill):
   ```bash
   export PATH="/opt/homebrew/opt/node@22/bin:$PATH" && set -a && source .env && set +a
   node scripts/quality/pagespeed.mjs --engine psi --base "$NEXT_PUBLIC_SITE_URL" --min 98
   ```
2. **Compare** to the last run (store a small JSON snapshot under `data/reports/pagespeed/`). If any category dropped below 98 or regressed materially vs the prior snapshot, cluster the top failing Lighthouse audit ids.
3. **Fix on a branch:** create `fix/cwv-<date>`, apply the concrete fix (e.g. add `priority` to the LCP image, convert a `<img>` to `next/image`, code-split a heavy client component, reserve image dimensions for CLS, defer non-critical script), and verify locally with `--engine lighthouse`.
4. **Open a PR** with the before/after scores and the diff. Do NOT merge.
5. **Report** the regression, the fix, and the PR link. If nothing regressed, report "CWV stable" and exit.

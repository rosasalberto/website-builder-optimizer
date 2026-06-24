---
description: Weekly SEO scorecard — run the full audit, diff vs last week, and open issues for regressions.
---

Run the `seo-audit` skill (full 10-dimension audit → `data/reports/seo/seo-audit-<date>.md`).
Then diff against the previous week's report:

- Any dimension that dropped a grade band, or any new P0/P1 finding → summarize.
- For actionable regressions, open a GitHub issue (title = the finding, body = the fix + the audit excerpt). Read-only on the codebase — do not auto-fix here; the `/daily-*` routines handle fixes.
- Report the overall score trend (this week vs last) and the top 3 things to fix.

Use Node 22. No mutations to ad accounts or content.

#!/usr/bin/env node
/**
 * Search Console 28-day query report + striking-distance opportunities.
 *   node scripts/analytics/gsc-report.mjs    (needs GSC_SITE_URL + auth env)
 * GSC data lags ~2 days, so the window ends today-2.
 */
import { accessToken, loadEnv } from "./_auth.mjs";

const env = loadEnv();
const site = env.GSC_SITE_URL;
if (!site) {
  console.error("Set GSC_SITE_URL in .env (e.g. https://yoursite.com or sc-domain:yoursite.com).");
  process.exit(1);
}

const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);
const start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

const token = await accessToken(env);
const res = await fetch(
  `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      startDate: start,
      endDate: end,
      dimensions: ["query"],
      rowLimit: 250,
    }),
  },
);
if (!res.ok) {
  console.error("GSC error:", await res.text());
  process.exit(1);
}
const data = await res.json();
const rows = data.rows ?? [];

// Striking distance: avg position 5–15 with real impressions → page-1 candidates.
const striking = rows
  .filter((r) => r.position >= 5 && r.position <= 15 && r.impressions >= 20)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 20);

console.log("Striking-distance queries (pos 5–15) — impr · clicks · pos · query");
for (const r of striking) {
  console.log(`${r.impressions}\t${r.clicks}\t${r.position.toFixed(1)}\t${r.keys[0]}`);
}
console.log(`\n(${rows.length} total queries, ${start} → ${end})`);

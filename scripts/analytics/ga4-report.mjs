#!/usr/bin/env node
/**
 * GA4 28-day traffic snapshot (top pages + countries).
 *   node scripts/analytics/ga4-report.mjs    (needs GA4_PROPERTY_ID + auth env)
 */
import { accessToken, loadEnv } from "./_auth.mjs";

const env = loadEnv();
const property = env.GA4_PROPERTY_ID;
if (!property) {
  console.error("Set GA4_PROPERTY_ID in .env (numeric property id).");
  process.exit(1);
}

const token = await accessToken(env);
const res = await fetch(
  `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      dimensions: [{ name: "pagePath" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 25,
    }),
  },
);
if (!res.ok) {
  console.error("GA4 error:", await res.text());
  process.exit(1);
}
const data = await res.json();
console.log("Top pages (28d) — users · views · path");
for (const row of data.rows ?? []) {
  console.log(`${row.metricValues[0].value}\t${row.metricValues[1].value}\t${row.dimensionValues[0].value}`);
}

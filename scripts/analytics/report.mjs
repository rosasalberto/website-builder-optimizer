#!/usr/bin/env node
/**
 * Pull GA4 traffic + Search Console search performance — headless, via the
 * long-lived refresh token minted by scripts/mint-google-refresh-token.mjs.
 *
 *   node scripts/analytics/report.mjs            # both, last 28 days
 *   node scripts/analytics/report.mjs --ga4      # GA4 only
 *   node scripts/analytics/report.mjs --gsc      # Search Console only
 *   node scripts/analytics/report.mjs --json     # machine-readable
 *
 * Env: GOOGLE_WORKSPACE_CLI_CLIENT_ID, GOOGLE_WORKSPACE_CLI_CLIENT_SECRET,
 *      GOOGLE_ANALYTICS_REFRESH_TOKEN, GA4_PROPERTY_ID, GSC_SITE_URL.
 */
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const wantGa4 = args.includes("--ga4") || !args.includes("--gsc");
const wantGsc = args.includes("--gsc") || !args.includes("--ga4");
const asJson = args.includes("--json");

const env = loadEnv();
const out = {};

const token = await accessToken();
if (wantGa4 && env.GA4_PROPERTY_ID) out.ga4 = await ga4(token);
if (wantGsc && env.GSC_SITE_URL) out.gsc = await gsc(token);

if (asJson) {
  console.log(JSON.stringify(out, null, 2));
} else {
  if (out.ga4) {
    console.log("\n# GA4 — last 28 days\n");
    console.log(`active users: ${out.ga4.activeUsers}   page views: ${out.ga4.pageViews}`);
    console.log("\ntop pages:");
    for (const r of out.ga4.topPages.slice(0, 10)) console.log(`  ${r.views.padStart(7)}  ${r.path}`);
  }
  if (out.gsc) {
    console.log("\n# Search Console — last 28 days\n");
    console.log("top queries (clicks / impressions / position):");
    for (const r of out.gsc.topQueries.slice(0, 15))
      console.log(`  ${String(r.clicks).padStart(5)} / ${String(r.impressions).padStart(7)} / ${r.position.toFixed(1).padStart(5)}  ${r.query}`);
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const o = {};
    for (const l of readFileSync(".env", "utf8").split("\n")) {
      const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) o[m[1]] = m[2];
    }
    return { ...o, ...process.env };
  } catch {
    return process.env;
  }
}

async function accessToken() {
  const need = ["GOOGLE_WORKSPACE_CLI_CLIENT_ID", "GOOGLE_WORKSPACE_CLI_CLIENT_SECRET", "GOOGLE_ANALYTICS_REFRESH_TOKEN"];
  for (const k of need) if (!env[k]) { console.error(`Missing ${k} in .env — run scripts/mint-google-refresh-token.mjs`); process.exit(1); }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_WORKSPACE_CLI_CLIENT_ID,
      client_secret: env.GOOGLE_WORKSPACE_CLI_CLIENT_SECRET,
      refresh_token: env.GOOGLE_ANALYTICS_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) { console.error("token refresh failed:", await res.text()); process.exit(1); }
  return (await res.json()).access_token;
}

async function ga4(token) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${env.GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        limit: 50,
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      }),
    },
  );
  const d = await res.json();
  const rows = d.rows ?? [];
  return {
    activeUsers: d.totals?.[0]?.metricValues?.[1]?.value ?? "—",
    pageViews: rows.reduce((s, r) => s + Number(r.metricValues?.[0]?.value ?? 0), 0).toString(),
    topPages: rows.map((r) => ({ path: r.dimensionValues[0].value, views: r.metricValues[0].value })),
  };
}

async function gsc(token) {
  const site = encodeURIComponent(env.GSC_SITE_URL);
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: start, endDate: end, dimensions: ["query"], rowLimit: 100 }),
    },
  );
  const d = await res.json();
  return {
    topQueries: (d.rows ?? []).map((r) => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      position: r.position,
    })),
  };
}

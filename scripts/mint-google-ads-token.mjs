#!/usr/bin/env node
/**
 * One-time: mint a Google Ads API refresh token (scope: adwords). After this,
 * all Google Ads automation runs headless. Google Ads does NOT support service
 * accounts, so a user OAuth refresh token is the canonical path.
 *
 *   node scripts/mint-google-ads-token.mjs
 *
 * Requires GOOGLE_ADS_CLIENT_ID / GOOGLE_ADS_CLIENT_SECRET in .env (a Desktop or
 * Web OAuth client in a Cloud project with the Google Ads API enabled). Prints
 * GOOGLE_ADS_REFRESH_TOKEN — paste it into .env.
 */
import http from "node:http";
import { exec } from "node:child_process";
import { readFileSync } from "node:fs";

const SCOPE = "https://www.googleapis.com/auth/adwords";
const PORT = 4780;

main();

async function main() {
  const env = loadEnv();
  const clientId = env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = env.GOOGLE_ADS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("Missing GOOGLE_ADS_CLIENT_ID / GOOGLE_ADS_CLIENT_SECRET in .env");
    process.exit(1);
  }
  const redirect = `http://localhost:${PORT}`;
  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirect,
      response_type: "code",
      scope: SCOPE,
      access_type: "offline",
      prompt: "consent",
    });

  console.log("\nOpening browser to authorize the Google Ads account…\n");
  console.log(authUrl + "\n");
  openBrowser(authUrl);

  const code = await waitForCode(redirect);
  const token = await exchange({ clientId, clientSecret, code, redirect });
  if (!token.refresh_token) {
    console.error(
      "\nNo refresh_token. Revoke at https://myaccount.google.com/permissions and re-run.",
    );
    process.exit(1);
  }
  console.log("\n✓ Add this line to your .env:\n");
  console.log(`GOOGLE_ADS_REFRESH_TOKEN=${token.refresh_token}\n`);
  console.log(
    "Reminder: also set GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_LOGIN_CUSTOMER_ID (your MCC),\n" +
      "and GOOGLE_ADS_CUSTOMER_ID (the account to manage).\n",
  );
}

function loadEnv() {
  try {
    const out = {};
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2];
    }
    return { ...out, ...process.env };
  } catch {
    return process.env;
  }
}

function openBrowser(url) {
  const cmd =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${cmd} "${url}"`);
}

function waitForCode(redirect) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const code = new URL(req.url, redirect).searchParams.get("code");
      if (code) {
        res.end("Authorized. Close this tab and return to the terminal.");
        server.close();
        resolve(code);
      } else {
        res.end("Waiting for authorization…");
      }
    });
    server.on("error", reject);
    server.listen(PORT);
  });
}

async function exchange({ clientId, clientSecret, code, redirect }) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirect,
    }),
  });
  if (!res.ok) {
    console.error("Token exchange failed:", await res.text());
    process.exit(1);
  }
  return res.json();
}

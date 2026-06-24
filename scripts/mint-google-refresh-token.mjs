#!/usr/bin/env node
/**
 * One-time: mint a long-lived Google refresh token for GA4 + Search Console
 * (both read-only). After this, all analytics pulls run headless — no browser.
 *
 *   node scripts/mint-google-refresh-token.mjs
 *
 * Requires GOOGLE_WORKSPACE_CLI_CLIENT_ID / _SECRET in .env (a Desktop or Web
 * OAuth client that is allowed to request the analytics + webmasters scopes).
 * Prints GOOGLE_ANALYTICS_REFRESH_TOKEN — paste it into .env.
 */
import http from "node:http";
import { exec } from "node:child_process";
import { readFileSync } from "node:fs";

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
];
const PORT = 4779;

main();

async function main() {
  const env = loadEnv();
  const clientId = env.GOOGLE_WORKSPACE_CLI_CLIENT_ID;
  const clientSecret = env.GOOGLE_WORKSPACE_CLI_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error(
      "Missing GOOGLE_WORKSPACE_CLI_CLIENT_ID / GOOGLE_WORKSPACE_CLI_CLIENT_SECRET in .env",
    );
    process.exit(1);
  }
  const redirect = `http://localhost:${PORT}`;
  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirect,
      response_type: "code",
      scope: SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

  console.log("\nOpening browser to authorize (sign in as the account that owns GA4 + GSC)…\n");
  console.log(authUrl + "\n");
  openBrowser(authUrl);

  const code = await waitForCode(redirect);
  const token = await exchange({ clientId, clientSecret, code, redirect });
  if (!token.refresh_token) {
    console.error(
      "\nNo refresh_token returned. Revoke prior access at " +
        "https://myaccount.google.com/permissions and re-run (the script forces prompt=consent).",
    );
    process.exit(1);
  }
  console.log("\n✓ Add this line to your .env:\n");
  console.log(`GOOGLE_ANALYTICS_REFRESH_TOKEN=${token.refresh_token}\n`);
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
      const u = new URL(req.url, redirect);
      const code = u.searchParams.get("code");
      if (code) {
        res.end("Authorized. You can close this tab and return to the terminal.");
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

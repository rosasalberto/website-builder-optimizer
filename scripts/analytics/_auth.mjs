/** Mint a short-lived Google access token from the long-lived refresh token. */
import { readFileSync } from "node:fs";

export function loadEnv() {
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

export async function accessToken(env = loadEnv()) {
  const id = env.GOOGLE_WORKSPACE_CLI_CLIENT_ID;
  const secret = env.GOOGLE_WORKSPACE_CLI_CLIENT_SECRET;
  const refresh = env.GOOGLE_ANALYTICS_REFRESH_TOKEN;
  if (!id || !secret || !refresh) {
    throw new Error(
      "Missing GOOGLE_WORKSPACE_CLI_CLIENT_ID / _SECRET / GOOGLE_ANALYTICS_REFRESH_TOKEN. " +
        "Run: node scripts/mint-google-refresh-token.mjs",
    );
  }
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  if (!r.ok) throw new Error(`token refresh failed: ${await r.text()}`);
  return (await r.json()).access_token;
}

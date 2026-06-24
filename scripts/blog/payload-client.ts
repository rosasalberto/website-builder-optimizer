/**
 * Thin Payload REST client for publishing to a REMOTE deployment.
 * (Local/offline publishing uses the Local API directly — see publish.ts.)
 * Auth: a Payload user's API key → `Authorization: users API-Key <key>`.
 */
const BASE = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/api/payload`;

function headers() {
  const key = process.env.PAYLOAD_API_KEY;
  if (!key) throw new Error("PAYLOAD_API_KEY is not set");
  return { "Content-Type": "application/json", Authorization: `users API-Key ${key}` };
}

async function req(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

export const payloadRest = {
  createPost: (data: Record<string, unknown>, locale = "en") =>
    req("POST", `/posts?locale=${locale}`, data),
  updatePost: (id: string | number, data: Record<string, unknown>, locale: string) =>
    req("PATCH", `/posts/${id}?locale=${locale}`, data),
  publishPost: (id: string | number) =>
    req("PATCH", `/posts/${id}`, { _status: "published" }),
};

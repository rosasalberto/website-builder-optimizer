import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Build-time redirects sourced from the Payload `redirects` collection.
 *
 * Reads via the Local API, wrapped so a cold/unreachable DB never fails the
 * build (returns []). Wired into next.config redirects(). The Payload module
 * (src/lib/cms/payload.ts) is added in Phase 2; until then this resolves to []
 * so the build is always green.
 */
export async function getRedirects(): Promise<Redirect[]> {
  try {
    const mod = await import("./payload").catch(() => null);
    if (!mod || typeof mod.getPayloadClient !== "function") return [];
    const payload = await mod.getPayloadClient();
    const { docs } = await payload.find({
      collection: "redirects",
      limit: 5000,
      depth: 0,
      pagination: false,
    });
    return docs
      .filter((d) => d.from && d.to)
      .map((d) => ({
        source: d.from as string,
        destination: d.to as string,
        permanent: d.permanent !== false,
      }));
  } catch {
    return [];
  }
}

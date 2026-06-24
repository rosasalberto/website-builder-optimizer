import { SITE } from "@/config/site";
import { themeConfig } from "../../../../theme.config";

export const runtime = "nodejs";
export const dynamic = "force-static";

// Explicit route handler (not the manifest.ts convention) so the sibling
// [locale] segment doesn't capture "/manifest.webmanifest" as a locale.
export function GET(): Response {
  const manifest = {
    name: SITE.brand.name,
    short_name: SITE.brand.name,
    description: SITE.brand.description,
    start_url: "/",
    display: "standalone",
    background_color: themeConfig.colors.background,
    theme_color: themeConfig.colors.brand,
    icons: [{ src: SITE.brand.logo.mark, sizes: "any", type: "image/svg+xml" }],
  };
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

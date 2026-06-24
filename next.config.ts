import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";
import { getRedirects } from "./src/lib/cms/redirects";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Keep heavy, server-only native packages out of every per-route function
  // bundle (the 250 MB Vercel function ceiling at 10k+ pages). Payload + the
  // admin only need them in the (payload) routes.
  serverExternalPackages: ["sharp"],

  images: {
    // Pre-sized derivatives + a long cache keep image-optimization quota sane
    // at scale. Trim deviceSizes to what archetypes actually render.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },

  // Keep marketing routes free of the Payload/sharp trace; the (payload) group
  // pulls them at runtime instead.
  outputFileTracingExcludes: {
    "/[locale]/blog/[slug]": ["node_modules/sharp/**", "node_modules/@payloadcms/**"],
    "/sitemap/**": ["node_modules/sharp/**", "node_modules/@payloadcms/**"],
  },

  productionBrowserSourceMaps: false,

  async redirects() {
    // CMS-managed redirects (old slug -> new), resilient to a cold DB.
    return getRedirects();
  },
};

export default withPayload(withNextIntl(nextConfig));

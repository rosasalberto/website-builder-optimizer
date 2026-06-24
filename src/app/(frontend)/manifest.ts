import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { themeConfig } from "../../../theme.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.brand.name,
    short_name: SITE.brand.name,
    description: SITE.brand.description,
    start_url: "/",
    display: "standalone",
    background_color: themeConfig.colors.background,
    theme_color: themeConfig.colors.brand,
    icons: [{ src: SITE.brand.logo.mark, sizes: "any", type: "image/svg+xml" }],
  };
}

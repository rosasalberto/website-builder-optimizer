import type { CollectionConfig } from "payload";

/** Uploads. Storage adapter (Vercel Blob / S3) is wired in payload.config. */
export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  admin: { group: "Content" },
  upload: {
    // Pre-size derivatives so next/image rarely needs to re-transform at scale.
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 768 },
      { name: "og", width: 1200, height: 630, position: "centre" },
    ],
    mimeTypes: ["image/*"],
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      admin: { description: "Accessible alt text (localized)." },
    },
  ],
};

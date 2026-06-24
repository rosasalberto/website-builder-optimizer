import type { CollectionConfig } from "payload";

/**
 * 301/308 redirects, consumed by next.config redirects(). Every deliberate
 * slug change must add a row here (old -> new) so SEO equity + inbound links
 * survive.
 */
export const Redirects: CollectionConfig = {
  slug: "redirects",
  access: { read: () => true },
  admin: { useAsTitle: "from", group: "Admin" },
  fields: [
    {
      name: "from",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Source path, e.g. /blog/old-slug" },
    },
    {
      name: "to",
      type: "text",
      required: true,
      admin: { description: "Destination path or URL, e.g. /blog/new-slug" },
    },
    {
      name: "permanent",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "308 permanent (default) vs 307 temporary." },
    },
  ],
};

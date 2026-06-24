import type { CollectionConfig } from "payload";
import { slugify } from "../fields/slugField";

/**
 * Blog taxonomy. Intentionally NON-localized: a category is one stable
 * entity across every locale (the slug is the canonical id). The visible
 * per-locale label comes from the UI messages, not the CMS — this avoids
 * the classic "tag has N localizations" fan-out bug.
 */
export const Categories: CollectionConfig = {
  slug: "categories",
  access: { read: () => true },
  admin: { useAsTitle: "name", group: "Content" },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar" },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value ? slugify(value as string) : slugify((data?.name as string) || ""),
        ],
      },
    },
    { name: "description", type: "textarea" },
  ],
};

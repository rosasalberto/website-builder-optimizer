import type { CollectionConfig } from "payload";
import { slugify } from "../fields/slugField";

/**
 * Authors power E-E-A-T signals: real bylines, credentials, and external
 * profile links feed the Article author (Person) JSON-LD.
 */
export const Authors: CollectionConfig = {
  slug: "authors",
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
    { name: "jobTitle", type: "text", localized: true },
    { name: "bio", type: "textarea", localized: true },
    { name: "avatar", type: "upload", relationTo: "media" },
    {
      name: "credentials",
      type: "text",
      localized: true,
      admin: { description: 'e.g. "MD, board-certified dermatologist".' },
    },
    {
      name: "sameAs",
      type: "array",
      admin: { description: "External profile URLs (LinkedIn, X, scholar...) for JSON-LD." },
      fields: [{ name: "url", type: "text" }],
    },
  ],
};

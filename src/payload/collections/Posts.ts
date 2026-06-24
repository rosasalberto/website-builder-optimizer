import type { CollectionConfig } from "payload";
import { slugField } from "../fields/slugField";
import { revalidatePost, revalidatePostDelete } from "../hooks/revalidate";

/**
 * Blog Posts — the scalable content engine.
 *
 * Localized: title, slug, excerpt, content, seo.* (one document, N locale
 * layers, Payload-native fallback to the default locale). Non-localized:
 * category, authors, publishedAt, coverImage (shared across locales).
 *
 * Indexes on slug/_status/publishedAt/locale keep list + detail + sitemap
 * queries fast at 10k+ posts.
 */
export const Posts: CollectionConfig = {
  slug: "posts",
  access: {
    read: ({ req: { user } }) =>
      user ? true : { _status: { equals: "published" } },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
    group: "Content",
  },
  versions: {
    drafts: { autosave: false },
  },
  hooks: {
    afterChange: [revalidatePost],
    afterDelete: [revalidatePostDelete],
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true, index: true },
    slugField({ sourceField: "title" }),
    {
      name: "excerpt",
      type: "textarea",
      localized: true,
      maxLength: 300,
      admin: { description: "Short summary for cards, meta description fallback, and AI citation." },
    },
    {
      name: "content",
      type: "richText",
      localized: true,
    },
    // Sidebar metadata
    {
      name: "publishedAt",
      type: "date",
      index: true,
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      admin: { position: "sidebar" },
    },
    {
      name: "authors",
      type: "relationship",
      relationTo: "authors",
      hasMany: true,
      admin: { position: "sidebar" },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar" },
    },
    // SEO group (localized)
    {
      type: "group",
      name: "seo",
      label: "SEO",
      fields: [
        { name: "metaTitle", type: "text", localized: true },
        { name: "metaDescription", type: "textarea", localized: true, maxLength: 200 },
        { name: "ogImage", type: "upload", relationTo: "media" },
        { name: "noindex", type: "checkbox", defaultValue: false },
      ],
    },
    // Deliberate slug-change escape hatch (must be paired with a Redirect).
    {
      name: "allowSlugChange",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Tick ONLY when intentionally changing a published slug — and add a redirect.",
      },
    },
  ],
};

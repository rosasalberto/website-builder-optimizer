import type { CollectionConfig } from "payload";

/** Admin users. Gates /admin and authenticates the REST API (API keys). */
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    useAPIKey: true, // lets the blog-publisher script authenticate with a key
  },
  admin: {
    useAsTitle: "email",
    group: "Admin",
  },
  fields: [
    { name: "name", type: "text" },
  ],
};

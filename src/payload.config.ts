import path from "path";
import { fileURLToPath } from "url";

import { buildConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";

import { siteConfig } from "../site.config";
import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Posts } from "./payload/collections/Posts";
import { Categories } from "./payload/collections/Categories";
import { Authors } from "./payload/collections/Authors";
import { Redirects } from "./payload/collections/Redirects";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const databaseURI = process.env.DATABASE_URI || "file:./payload.db";

// Env-driven adapter: Postgres for prod, SQLite for local/demo.
const db = databaseURI.startsWith("postgres")
  ? postgresAdapter({
      pool: { connectionString: databaseURI },
    })
  : sqliteAdapter({
      client: { url: databaseURI },
    });

// Conditional media storage: Vercel Blob > S3/R2 > local disk (dev default).
const storagePlugins = [];
if (process.env.BLOB_READ_WRITE_TOKEN) {
  storagePlugins.push(
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  );
} else if (process.env.S3_BUCKET) {
  storagePlugins.push(
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET,
      config: {
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: !!process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
      },
    }),
  );
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: `— ${siteConfig.brand.name} CMS`,
    },
  },
  // Payload REST/GraphQL lives under /api/payload so the marketing app keeps
  // /api/* (og, form, revalidate, cron) free of the [...slug] catch-all.
  routes: {
    api: "/api/payload",
  },
  collections: [Posts, Categories, Authors, Media, Users, Redirects],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "CHANGE_ME_dev_secret",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db,
  sharp,
  localization: {
    locales: siteConfig.domain.locales.map((l) => ({
      code: l.code,
      label: l.label,
    })),
    defaultLocale: siteConfig.domain.defaultLocale,
    fallback: true,
  },
  cors: [siteConfig.domain.url].filter(Boolean),
  csrf: [siteConfig.domain.url].filter(Boolean),
  plugins: [...storagePlugins],
});

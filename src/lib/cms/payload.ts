import { getPayload, type Payload } from "payload";
import config from "@payload-config";

/**
 * Cached Payload Local API client. Used by Server Components, generateMetadata,
 * generateStaticParams, sitemap routes — an in-process call (no HTTP hop) that
 * works at build time. The singleton avoids re-initializing Payload (and
 * re-opening DB pools) on every serverless invocation.
 */
let cached: Promise<Payload> | null = null;

export function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = getPayload({ config });
  }
  return cached;
}

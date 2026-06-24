import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

/**
 * On-demand ISR: when a post is published/edited/deleted, invalidate the
 * precise cache tags so the change surfaces immediately instead of waiting
 * out the revalidate window. Runs in-process (Payload lives inside Next), so
 * no external webhook round-trip is needed in a single deployment.
 *
 * Next 16's revalidateTag(tag, profile) takes a cache-life profile; we pass
 * "max" for a full purge and additionally revalidate the root layout path as
 * the reliable belt-and-suspenders invalidation.
 */
function purge(tag: string) {
  try {
    revalidateTag(tag, "max");
  } catch {
    /* outside request scope during some Payload ops — ignored */
  }
}

export const revalidatePost: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  try {
    purge("posts");
    if (doc?.slug) purge(`post:${doc.slug}`);
    if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
      purge(`post:${previousDoc.slug}`);
    }
    revalidatePath("/", "layout");
  } catch (err) {
    payload?.logger?.warn?.(`revalidatePost skipped: ${(err as Error).message}`);
  }
  return doc;
};

export const revalidatePostDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload },
}) => {
  try {
    purge("posts");
    if (doc?.slug) purge(`post:${doc.slug}`);
    revalidatePath("/", "layout");
  } catch (err) {
    payload?.logger?.warn?.(`revalidatePostDelete skipped: ${(err as Error).message}`);
  }
  return doc;
};

import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export const runtime = "nodejs";

/**
 * Secret-guarded on-demand revalidation. Fallback for split deployments where
 * the CMS and the frontend run as separate apps (in a single deployment the
 * Payload afterChange hook already calls revalidateTag in-process).
 *
 *   POST /api/revalidate?secret=…&tag=posts
 *   POST /api/revalidate?secret=…&path=/blog
 */
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = process.env.PAYLOAD_REVALIDATE_SECRET;
  if (!secret || searchParams.get("secret") !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const tag = searchParams.get("tag");
  const path = searchParams.get("path");
  try {
    if (tag) revalidateTag(tag, "max");
    else revalidateTag("posts", "max");
    if (path) revalidatePath(path);
    return NextResponse.json({ ok: true, tag: tag ?? "posts", path: path ?? null });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

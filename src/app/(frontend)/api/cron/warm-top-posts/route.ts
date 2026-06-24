import { NextResponse } from "next/server";
import { getHotPostSlugs } from "@/lib/cms/posts";
import { SITE_URL, LOCALES } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily Vercel Cron (see vercel.json): converts the top posts' ISR cache from
 * MISS to HIT before crawlers arrive. Warms the canonical locale of each hot
 * slug (not all N locales — that would multiply image-opt + ISR-write quota).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let warmed = 0;
  try {
    const slugs = await getHotPostSlugs(100);
    const defaultLocale = LOCALES[0];
    await Promise.allSettled(
      slugs.map(async (slug) => {
        const res = await fetch(`${SITE_URL}/blog/${slug}`, {
          headers: { "x-warm": "1" },
        });
        if (res.ok) warmed += 1;
      }),
    );
    return NextResponse.json({ ok: true, warmed, total: slugs.length, locale: defaultLocale });
  } catch (err) {
    return NextResponse.json({ ok: false, warmed, error: (err as Error).message }, { status: 200 });
  }
}

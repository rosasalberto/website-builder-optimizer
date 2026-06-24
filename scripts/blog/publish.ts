/**
 * Multi-locale blog publisher.
 *
 *   pnpm exec payload run scripts/blog/publish.ts <path/to/post.md>
 *
 * (Must run under `payload run` so the Payload config graph resolves — see the
 * loader note in the validation scripts.)
 *
 * Pipeline: parse frontmatter → markdown→Lexical → create the EN post (draft)
 * → translate to every other locale via OpenRouter (slug unchanged) → generate
 * + attach a cover → publish. Re-publishing an existing slug passes the slug
 * through verbatim (immutability).
 *
 * Frontmatter: title, slug, excerpt, category?, author?, seo.{metaTitle,metaDescription}
 */
import { readFileSync } from "node:fs";
import { getPayload } from "payload";
import config from "@payload-config";
import matter from "gray-matter";
import { convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { generateCover } from "./og-thumbnail.mjs";
import { translateFields } from "./translate";

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: payload run scripts/blog/publish.ts <post.md>");
    process.exit(1);
  }
  const { data: fm, content: markdown } = matter(readFileSync(file, "utf8"));
  if (!fm.title || !fm.slug) throw new Error("Frontmatter must include title and slug");

  const payload = await getPayload({ config });
  // Locale codes are dynamic (from site.config); cast at the Payload boundary.
  type L = "en";
  const asL = (x: string) => x as L;
  const locales: string[] = payload.config.localization
    ? payload.config.localization.locales.map((l: { code: string } | string) =>
        typeof l === "string" ? l : l.code,
      )
    : ["en"];
  const defaultLocale: string = payload.config.localization
    ? payload.config.localization.defaultLocale
    : "en";

  const editorConfig = await editorConfigFactory.default({ config: payload.config });
  const toLexical = async (md: string) =>
    convertMarkdownToLexical({ editorConfig, markdown: md });

  // 1) cover
  let coverId: string | number | undefined;
  try {
    const png = await generateCover(fm.title);
    const media = await payload.create({
      collection: "media",
      data: { alt: fm.title },
      file: { data: png, mimetype: "image/png", name: `${fm.slug}-cover.png`, size: png.length },
    });
    coverId = media.id;
  } catch (e) {
    console.warn("cover generation skipped:", (e as Error).message);
  }

  // 2) create the default-locale post (draft)
  const existing = await payload.find({
    collection: "posts",
    where: { slug: { equals: fm.slug } },
    locale: asL(defaultLocale),
    limit: 1,
  });
  const baseData: Record<string, unknown> = {
    title: fm.title,
    slug: fm.slug,
    excerpt: fm.excerpt ?? "",
    content: await toLexical(markdown),
    publishedAt: new Date().toISOString(),
    ...(coverId ? { coverImage: coverId } : {}),
    seo: { metaTitle: fm.seo?.metaTitle, metaDescription: fm.seo?.metaDescription },
    _status: "draft",
  };

  const post = (
    existing.docs[0]
      ? await payload.update({
          collection: "posts",
          id: existing.docs[0].id,
          locale: asL(defaultLocale),
          data: { ...baseData, slug: existing.docs[0].slug } as never, // pin slug
        })
      : await payload.create({
          collection: "posts",
          locale: asL(defaultLocale),
          data: baseData as never,
        })
  ) as { id: string | number };

  // 3) translate to other locales
  for (const locale of locales.filter((l) => l !== defaultLocale)) {
    try {
      const tr = await translateFields(
        {
          title: fm.title,
          excerpt: fm.excerpt,
          content: markdown,
          metaTitle: fm.seo?.metaTitle,
          metaDescription: fm.seo?.metaDescription,
        },
        locale,
      );
      await payload.update({
        collection: "posts",
        id: post.id,
        locale: asL(locale),
        data: {
          title: tr.title,
          excerpt: tr.excerpt ?? "",
          content: await toLexical(tr.content),
          seo: { metaTitle: tr.metaTitle, metaDescription: tr.metaDescription },
        },
      });
      console.log(`  ✓ ${locale}`);
    } catch (e) {
      console.warn(`  ! ${locale} skipped: ${(e as Error).message}`);
    }
  }

  // 4) publish
  await payload.update({
    collection: "posts",
    id: post.id,
    locale: asL(defaultLocale),
    data: { _status: "published" },
  });

  const url = `${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/blog/${fm.slug}`;
  console.log(JSON.stringify({ id: post.id, slug: fm.slug, url, locales }, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

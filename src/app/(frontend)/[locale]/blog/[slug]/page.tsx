import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, articleLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/container";
import { AuthorByline } from "@/components/blog/author-byline";
import { PostBody } from "@/components/blog/post-body";
import { RenderContent } from "@/lib/cms/render-content";
import { getPostBySlug, getHotPostSlugs } from "@/lib/cms/posts";
import { canonicalUrl } from "@/config/site";
import { formatDate } from "@/lib/utils";
import type { Author, Media } from "@/payload-types";

export const revalidate = 3600;
export const dynamicParams = true;

/** Hot subset only — the long tail renders on first request, then ISR-caches. */
export async function generateStaticParams() {
  const slugs = await getHotPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ locale: string; slug: string }> };

const mediaUrl = (m: unknown): string | undefined =>
  m && typeof m === "object" && "url" in m ? ((m as Media).url ?? undefined) : undefined;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale);
  if (!post) return {};
  const image = mediaUrl(post.seo?.ogImage) ?? mediaUrl(post.coverImage);
  const authors = (Array.isArray(post.authors) ? post.authors : [])
    .filter((a): a is Author => typeof a === "object")
    .map((a) => a.name);
  return buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt || undefined,
    type: "article",
    image,
    noindex: post.seo?.noindex || undefined,
    article: {
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: authors.length ? authors : undefined,
    },
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  const t = await getTranslations("blog");
  const authors = (Array.isArray(post.authors) ? post.authors : []).filter(
    (a): a is Author => typeof a === "object",
  );
  const cover = post.coverImage && typeof post.coverImage === "object" ? (post.coverImage as Media) : null;
  const url = canonicalUrl(locale, `/blog/${slug}`);
  const dateLine = formatDate(post.publishedAt, locale);

  return (
    <article>
      <JsonLd
        data={[
          articleLd({
            title: post.title,
            description: post.excerpt || undefined,
            url,
            image: mediaUrl(post.coverImage),
            datePublished: post.publishedAt || undefined,
            dateModified: post.updatedAt,
            authors: authors.map((a) => ({ name: a.name })),
          }),
          breadcrumbLd([
            { name: t("title"), url: canonicalUrl(locale, "/blog") },
            { name: post.title, url },
          ]),
        ]}
      />
      <Container size="md" className="py-14 md:py-20">
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {post.title}
        </h1>
        {authors[0] ? (
          <div className="mt-6">
            <AuthorByline author={authors[0]} dateLine={dateLine} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("publishedOn", { date: dateLine })}
          </p>
        )}
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt || post.title}
            width={cover.width || 1200}
            height={cover.height || 630}
            priority
            className="mt-8 w-full rounded-[var(--radius)] border border-line object-cover"
          />
        ) : null}
        <PostBody className="mt-10">
          <RenderContent data={post.content} />
        </PostBody>
      </Container>
    </article>
  );
}

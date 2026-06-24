import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/sections/section-heading";
import { PostCard } from "@/components/blog/post-card";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/cms/posts";
import { canonicalUrl } from "@/config/site";

export const revalidate = 3600;

type Params = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: "/blog",
    titleKey: "blog.title",
    descriptionKey: "blog.subtitle",
  });
}

export default async function BlogIndex({ params, searchParams }: Params) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { posts, totalPages } = await getPosts({ locale, page, limit: 12 });

  return (
    <Section>
      <JsonLd data={breadcrumbLd([{ name: t("title"), url: canonicalUrl(locale, "/blog") }])} />
      <Container>
        <SectionHeading as="h1" align="center" title={t("title")} description={t("subtitle")} />

        {posts.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">{t("noPosts")}</p>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-14 flex items-center justify-center gap-3" aria-label="Pagination">
            {page > 1 && (
              <Link
                href={`/blog?page=${page - 1}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                ←
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/blog?page=${page + 1}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                →
              </Link>
            )}
          </nav>
        )}
      </Container>
    </Section>
  );
}

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { PostCard as PostCardData } from "@/lib/cms/posts";

export interface PostCardProps {
  post: PostCardData;
  locale: string;
}

/** Blog index card: cover image, category, title, excerpt, and date. */
export function PostCard({ post, locale }: PostCardProps) {
  const cover = post.coverImage;
  const coverUrl = cover?.sizes?.card?.url ?? cover?.url ?? null;
  const href = `/blog/${post.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-background">
      <Link href={href} className="block aspect-[16/9] overflow-hidden bg-muted" tabIndex={-1} aria-hidden>
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={cover?.alt ?? ""}
            width={cover?.width ?? 640}
            height={cover?.height ?? 360}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {post.category?.name && <Badge className="mb-3 w-fit">{post.category.name}</Badge>}
        <h3 className="text-lg font-semibold leading-snug tracking-tight">
          <Link href={href} className="after:absolute hover:text-brand">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        {post.publishedAt && (
          <time dateTime={post.publishedAt} className="mt-4 text-xs text-muted-foreground">
            {formatDate(post.publishedAt, locale)}
          </time>
        )}
      </div>
    </article>
  );
}

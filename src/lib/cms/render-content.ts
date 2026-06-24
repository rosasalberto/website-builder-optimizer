import { createElement, type ReactNode } from "react";
import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { Post, Media } from "@/payload-types";

/**
 * Server-side renderer for Payload Lexical richText (`Post["content"]`).
 *
 * Uses the official `RichText` JSX converter from @payloadcms/richtext-lexical
 * so we inherit correct handling of every node type (paragraph, headings,
 * lists, links, bold/italic/underline/strikethrough/code marks, blockquote,
 * code block, horizontal rule, tables) without re-implementing a serializer.
 *
 * Two on-brand overrides:
 *  - `heading`: demote a stray <h1> in body content to <h2> so a page keeps a
 *    single <h1> (the post title in the page header). h2–h6 pass through.
 *  - `upload`: render an uploaded Media relation as a semantic
 *    <figure><img/></figure> (native <img> — next/image's fill/intrinsic sizing
 *    is brittle inside arbitrary prose; the page's prose wrapper styles it).
 *
 * Written without JSX (createElement) so this stays a valid `.ts` module.
 * `disableContainer` is set so the calling page's <PostBody> owns the prose
 * wrapper + width.
 */

type LexicalContent = Post["content"];

/** Narrow Payload's `Media | number | null` union to a usable Media object. */
function asMedia(value: unknown): Media | null {
  return value && typeof value === "object" && "url" in (value as object)
    ? (value as Media)
    : null;
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  // Demote a stray body <h1> to <h2>; keep every other heading level.
  heading: (args) => {
    const node = args.node as { tag?: string };
    const tag = node.tag === "h1" ? "h2" : node.tag ?? "h2";
    const childNodes = ((args.node as { children?: unknown[] }).children ?? []) as never;
    const children = args.nodesToJSX({ nodes: childNodes });
    return createElement(tag, { key: undefined }, ...(children as ReactNode[]));
  },

  // Render uploaded media as a <figure><img/></figure> using the populated relation.
  upload: (args) => {
    const node = args.node as { value?: unknown; relationTo?: string };
    const media = asMedia(node.value);
    if (!media?.url) return null;
    const img = createElement("img", {
      src: media.url,
      alt: media.alt ?? "",
      width: media.width ?? undefined,
      height: media.height ?? undefined,
      loading: "lazy",
      decoding: "async",
    });
    return createElement(
      "figure",
      null,
      img,
      media.alt ? createElement("figcaption", null, media.alt) : null,
    );
  },
});

export interface RenderContentProps {
  data: LexicalContent;
  className?: string;
}

/**
 * <RenderContent data={post.content} /> — resilient: renders nothing when the
 * editor state is empty/missing so a half-written post never throws at render.
 */
export function RenderContent({ data, className }: RenderContentProps): ReactNode {
  const root = data?.root as { children?: unknown[] } | undefined;
  if (!root || !Array.isArray(root.children) || root.children.length === 0) {
    return null;
  }
  // `RichText` accepts a SerializedEditorState; Payload's stored shape matches.
  return RichText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: data as any,
    converters,
    disableContainer: true,
    className,
  });
}

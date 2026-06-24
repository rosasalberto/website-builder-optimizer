import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PostBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * Prose wrapper for rendered article content. Styles the raw HTML / serialized
 * rich text emitted by the blog renderer with readable, brand-consistent
 * typography. The blog agent passes its rendered nodes as `children`.
 */
export function PostBody({ children, className }: PostBodyProps) {
  return (
    <div
      className={cn(
        "max-w-prose text-base leading-relaxed text-foreground",
        "[&_p]:my-5",
        "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight",
        "[&_a]:font-medium [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2",
        "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5",
        "[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]",
        "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius)] [&_pre]:border [&_pre]:border-line [&_pre]:bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_img]:my-6 [&_img]:rounded-[var(--radius)] [&_img]:border [&_img]:border-line",
        "[&_hr]:my-10 [&_hr]:border-line",
        className,
      )}
    >
      {children}
    </div>
  );
}

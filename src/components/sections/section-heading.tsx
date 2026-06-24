import type { ElementType } from "react";
import { Eyebrow } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Heading level for the title. Defaults to "h2". */
  as?: ElementType;
  id?: string;
  className?: string;
}

/**
 * Eyebrow + title + description block reused by every section. Keeps heading
 * typography and spacing identical across the site.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <Heading
        id={id}
        className="text-balance text-3xl font-semibold tracking-tight md:text-4xl"
      >
        {title}
      </Heading>
      {description && (
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

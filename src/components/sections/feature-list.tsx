import Image from "next/image";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/badge";

export interface FeatureListRow {
  eyebrow?: string;
  title: string;
  description: string;
  bullets?: string[];
  image?: { src: string; alt: string; width: number; height: number };
}

export interface FeatureListProps {
  rows: FeatureListRow[];
}

/**
 * Alternating left/right feature rows. Even rows flip on desktop so copy and
 * visual swap sides. Rows without an image simply render full-width copy.
 */
export function FeatureList({ rows }: FeatureListProps) {
  if (rows.length === 0) return null;
  return (
    <section data-section="feature-list" className="bg-background py-16 md:py-24">
      <Container className="flex flex-col gap-16 md:gap-24">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-8 md:flex-row md:gap-12 md:[&:nth-child(even)]:flex-row-reverse"
          >
            <div className="w-full md:flex-1">
              {row.eyebrow && <Eyebrow className="mb-3">{row.eyebrow}</Eyebrow>}
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{row.title}</h3>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {row.description}
              </p>
              {row.bullets && row.bullets.length > 0 && (
                <ul className="mt-6 flex flex-col gap-3">
                  {row.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                      <span className="text-base text-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {row.image && (
              <div className="w-full overflow-hidden rounded-[var(--radius)] border border-line md:flex-1">
                <Image
                  src={row.image.src}
                  alt={row.image.alt}
                  width={row.image.width}
                  height={row.image.height}
                  className="h-auto w-full"
                />
              </div>
            )}
          </div>
        ))}
      </Container>
    </section>
  );
}

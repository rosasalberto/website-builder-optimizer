import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta: HeroCta;
  secondaryCta?: HeroCta;
  /** Optional supporting visual rendered below the copy. */
  media?: { src: string; alt: string; width: number; height: number };
  /** Tightens vertical padding for inner pages (pricing, contact). */
  compact?: boolean;
}

/** Page-opening hero: eyebrow, balanced headline, lede, and call-to-action(s). */
export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  media,
  compact = false,
}: HeroProps) {
  return (
    <section
      data-section="hero"
      aria-labelledby="hero-title"
      className={cn(
        "border-b border-line bg-background",
        compact ? "py-16 md:py-20" : "py-20 md:py-28",
      )}
    >
      <Container className="flex flex-col items-center text-center">
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h1
          id="hero-title"
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl"
        >
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={primaryCta.href} className={buttonVariants({ variant: "primary", size: "lg" })}>
            {primaryCta.label}
          </Link>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
        {media && (
          <div className="mt-14 w-full max-w-4xl overflow-hidden rounded-[var(--radius)] border border-line">
            <Image
              src={media.src}
              alt={media.alt}
              width={media.width}
              height={media.height}
              priority
              className="h-auto w-full"
            />
          </div>
        )}
      </Container>
    </section>
  );
}

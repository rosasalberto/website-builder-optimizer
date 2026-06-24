import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CtaLink {
  label: string;
  href: string;
}

export interface CtaSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
  /** Surface treatment. `dark` reads strongest as a page closer. */
  tone?: "default" | "muted" | "dark";
}

const TONE_CLS = {
  default: "bg-background text-foreground border-t border-line",
  muted: "bg-muted text-foreground",
  dark: "bg-[var(--color-dark-background)] text-[var(--color-dark-foreground)]",
} as const;

/** Closing call-to-action band. */
export function CtaSection({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  tone = "dark",
}: CtaSectionProps) {
  const onDark = tone === "dark";
  return (
    <section data-section="cta" aria-labelledby="cta-title" className={cn("py-20 md:py-28", TONE_CLS[tone])}>
      <Container size="lg" className="text-center">
        {eyebrow && (
          <p className={cn("mb-3 text-xs font-semibold uppercase tracking-wider", onDark ? "text-brand" : "text-brand")}>
            {eyebrow}
          </p>
        )}
        <h2 id="cta-title" className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed",
              onDark ? "text-[var(--color-dark-foreground)]/75" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={primaryCta.href} className={buttonVariants({ variant: "primary", size: "lg" })}>
            {primaryCta.label}
          </Link>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                onDark && "border-white/25 bg-transparent text-[var(--color-dark-foreground)] hover:bg-white/10",
              )}
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}

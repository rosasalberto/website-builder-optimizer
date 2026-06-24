import Image from "next/image";
import { Container } from "@/components/ui/container";

export interface LogoCloudItem {
  name: string;
  /** Optional logo asset. Omit to render the name as a styled wordmark. */
  src?: string;
  width?: number;
  height?: number;
}

export interface LogoCloudProps {
  title?: string;
  logos: LogoCloudItem[];
}

/**
 * Row of customer / partner logos. A generic template ships without logo
 * assets, so each item falls back to a muted text wordmark of its name.
 */
export function LogoCloud({ title, logos }: LogoCloudProps) {
  if (logos.length === 0) return null;
  return (
    <section data-section="logo-cloud" aria-label={title ?? "Trusted by"} className="bg-background py-12 md:py-16">
      <Container>
        {title && (
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">{title}</p>
        )}
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14">
          {logos.map((logo, i) => (
            <li key={i} className="flex items-center opacity-70 grayscale transition hover:opacity-100">
              {logo.src ? (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width ?? 120}
                  height={logo.height ?? 28}
                  className="h-7 w-auto"
                />
              ) : (
                <span className="text-lg font-semibold tracking-tight text-muted-foreground">
                  {logo.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

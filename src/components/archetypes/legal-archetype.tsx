import { Container } from "@/components/ui/container";

export interface LegalSection {
  heading: string;
  /** Paragraphs of plain-language body copy. */
  body: string[];
}

export interface LegalArchetypeProps {
  title: string;
  /** Localized "Last updated …" line. */
  updatedLabel?: string;
  sections: LegalSection[];
}

/** Long-form legal page (privacy, terms): title, last-updated, and prose sections. */
export function LegalArchetype({ title, updatedLabel, sections }: LegalArchetypeProps) {
  return (
    <article className="bg-background py-16 md:py-24">
      <Container size="md">
        <header className="mb-10 border-b border-line pb-8">
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          {updatedLabel && <p className="mt-3 text-sm text-muted-foreground">{updatedLabel}</p>}
        </header>
        <div className="flex flex-col gap-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{section.heading}</h2>
              <div className="mt-3 flex flex-col gap-4">
                {section.body.map((p, j) => (
                  <p key={j} className="text-base leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </article>
  );
}

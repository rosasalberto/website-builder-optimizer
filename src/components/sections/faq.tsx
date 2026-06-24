import { Container } from "@/components/ui/container";
import { JsonLd, faqLd } from "@/lib/seo/jsonld";
import { SectionHeading } from "./section-heading";
import { FaqAccordion, type FaqItem } from "./faq-accordion";

export type { FaqItem };

export interface FaqProps {
  eyebrow?: string;
  title: string;
  description?: string;
  items: FaqItem[];
}

/**
 * Frequently-asked-questions section. Server component: it emits FAQPage
 * JSON-LD (server-rendered, good for search/answer engines) and delegates the
 * interactive accordion to a minimal client leaf.
 */
export function Faq({ eyebrow, title, description, items }: FaqProps) {
  if (items.length === 0) return null;
  return (
    <section data-section="faq" className="border-t border-line bg-background py-16 md:py-24">
      <JsonLd item={faqLd(items.map((i) => ({ question: i.question, answer: i.answer })))} />
      <Container size="lg">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
          className="mb-12"
        />
        <FaqAccordion items={items} />
      </Container>
    </section>
  );
}

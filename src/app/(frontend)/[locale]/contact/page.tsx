import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/sections";
import { HowItWorks, CtaSection } from "@/components/sections";
import { ContactForm } from "@/components/sections";
import type { HowItWorksStep, ContactFormLabels } from "@/components/sections";
import { SITE } from "@/config/site";

type Params = { params: Promise<{ locale: string }> };

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  github: "GitHub",
  youtube: "YouTube",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({
    locale,
    path: "/contact",
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

export default async function ContactPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const labels: ContactFormLabels = {
    name: t("form.name"),
    email: t("form.email"),
    company: t("form.company"),
    message: t("form.message"),
    submit: t("form.submit"),
    sending: t("form.sending"),
    success: t("form.success"),
    error: t("form.error"),
    required: t("form.required"),
    invalidEmail: t("form.invalidEmail"),
  };

  const socials = Object.entries(SITE.social).filter(([, href]) => Boolean(href)) as [
    string,
    string,
  ][];

  return (
    <>
      <section data-section="contact" className="border-b border-line bg-background py-16 md:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={t("hero.eyebrow")}
            title={t("hero.title")}
            description={t("hero.description")}
            align="center"
            className="mx-auto"
          />
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
            <ContactForm labels={labels} />

            <aside className="flex flex-col gap-4 rounded-[var(--radius)] border border-line bg-muted p-6">
              <h2 className="text-lg font-semibold tracking-tight">{t("info.title")}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("info.description")}</p>
              <div>
                <p className="text-sm font-medium">{t("info.emailLabel")}</p>
                <a
                  href={`mailto:${SITE.org.email}`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {SITE.org.email}
                </a>
              </div>
              {socials.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {socials.map(([key, href]) => (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {SOCIAL_LABELS[key] ?? key}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </Container>
      </section>

      <HowItWorks
        eyebrow={t("next.eyebrow")}
        title={t("next.title")}
        steps={t.raw("next.steps") as HowItWorksStep[]}
      />

      <CtaSection
        title={t("cta.title")}
        description={t("cta.description")}
        primaryCta={{ label: t("cta.primary"), href: "/pricing" }}
        tone="dark"
      />
    </>
  );
}

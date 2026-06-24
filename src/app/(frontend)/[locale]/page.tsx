import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full border border-foreground/15 px-3 py-1 text-sm text-foreground/70">
        {t("eyebrow")}
      </span>
      <h1 className="text-balance text-5xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-balance text-lg text-foreground/70">{t("subtitle")}</p>
      <div className="flex gap-3">
        <Link
          href="/contact"
          className="rounded-md bg-foreground px-5 py-2.5 font-medium text-background"
        >
          {t("primaryCta")}
        </Link>
        <Link
          href="/blog"
          className="rounded-md border border-foreground/15 px-5 py-2.5 font-medium"
        >
          {t("secondaryCta")}
        </Link>
      </div>
    </main>
  );
}

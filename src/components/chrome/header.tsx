import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/config/site";
import { Logo } from "@/components/brand/Logo";
import { buttonVariants } from "@/components/ui/button";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";

/** Derive a `nav.*` translation key from a header href ("/features" → "features"). */
const navKey = (href: string) => href.replace(/^\//, "").split("/")[0] || "home";

/**
 * Sticky site header: logo, primary navigation, locale switcher, and the
 * primary call-to-action. Nav labels prefer the `nav` translation namespace and
 * fall back to the label declared in site.config. Server component; the mobile
 * drawer and locale switcher are isolated client leaves.
 */
export async function Header() {
  const [tNav, tCommon] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
  ]);

  const items = SITE.nav.header.map((item) => {
    const key = navKey(item.href);
    return { href: item.href, label: tNav.has(key) ? tNav(key) : item.label };
  });

  const ctaLabel = tCommon.has("getStarted") ? tCommon("getStarted") : SITE.nav.cta.label;
  const cta = { href: SITE.nav.cta.href, label: ctaLabel };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6">
        <Logo priority />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LocaleSwitcher label={tCommon.has("selectLanguage") ? tCommon("selectLanguage") : "Language"} />
          <Link
            href={cta.href}
            className={buttonVariants({ variant: "primary", size: "sm" }) + " hidden md:inline-flex"}
          >
            {cta.label}
          </Link>
          <MobileNav
            items={items}
            cta={cta}
            openLabel={tCommon.has("openMenu") ? tCommon("openMenu") : "Open menu"}
            closeLabel={tCommon.has("closeMenu") ? tCommon("closeMenu") : "Close menu"}
          />
        </div>
      </div>
    </header>
  );
}

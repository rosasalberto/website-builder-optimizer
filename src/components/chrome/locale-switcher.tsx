"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Switches the active locale while preserving the current path. Uses next-intl
 * navigation so the URL prefix is rewritten correctly (default locale stays
 * unprefixed). Accessible menu: arrow/Escape support via native focus + click.
 */
export function LocaleSwitcher({ label }: { label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const current = (params?.locale as string) ?? SITE.domain.defaultLocale;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(code: string) {
    setOpen(false);
    router.replace(pathname as never, { locale: code });
  }

  const activeLabel =
    SITE.domain.locales.find((l) => l.code === current)?.label ?? current.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius)] px-2.5 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Globe aria-hidden className="size-4" />
        <span className="hidden sm:inline">{activeLabel}</span>
        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-[var(--radius)] border border-line bg-background py-1 shadow-lg"
        >
          {SITE.domain.locales.map((l) => (
            <li key={l.code} role="none">
              <button
                role="menuitemradio"
                aria-checked={l.code === current}
                type="button"
                onClick={() => pick(l.code)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:bg-muted"
              >
                <span>{l.label}</span>
                {l.code === current && <Check aria-hidden className="size-4 text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

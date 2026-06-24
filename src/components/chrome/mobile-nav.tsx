"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

export interface MobileNavItem {
  label: string;
  href: string;
}

export interface MobileNavProps {
  items: MobileNavItem[];
  cta: MobileNavItem;
  openLabel: string;
  closeLabel: string;
}

/** Hamburger menu for small screens. Locks scroll while open; Escape closes. */
export function MobileNav({ items, cta, openLabel, closeLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-10 items-center justify-center rounded-[var(--radius)] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-line bg-background shadow-lg">
          <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius)] px-3 py-3 text-base font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              {cta.label}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /** `dark` (default) for light surfaces, `light` for dark surfaces. */
  variant?: "light" | "dark";
  className?: string;
  priority?: boolean;
}

/**
 * Brand lockup. Reads `SITE.brand.logo.{light,dark}`; if the SVG is missing
 * (or fails to load), it gracefully falls back to a text wordmark of
 * `SITE.brand.name`. A generic template ships without logo files, so the
 * wordmark is the default render — drop an SVG into /public/logos to upgrade.
 */
export function Logo({ variant = "dark", className, priority = false }: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = variant === "light" ? SITE.brand.logo.light : SITE.brand.logo.dark;

  return (
    <Link
      href="/"
      aria-label={SITE.brand.name}
      className={cn("inline-flex items-center gap-2", className)}
    >
      {src && !imgFailed ? (
        <Image
          src={src}
          alt={SITE.brand.name}
          width={120}
          height={28}
          priority={priority}
          onError={() => setImgFailed(true)}
          style={{ height: "auto" }}
        />
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-brand" />
          <span className="text-lg font-semibold tracking-tight">{SITE.brand.name}</span>
        </span>
      )}
    </Link>
  );
}

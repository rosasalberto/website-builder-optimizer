import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with clsx (conditional join) + tailwind-merge (de-dupe
 * conflicting Tailwind utilities so the last wins). Use everywhere instead of
 * raw template strings.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Locale-aware long date, e.g. "23 June 2026" / "23 de junio de 2026".
 * Null-safe: returns "" for missing/invalid input so callers never crash.
 */
export function formatDate(
  date: string | Date | null | undefined,
  locale: string,
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

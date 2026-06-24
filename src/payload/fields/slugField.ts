import type { Field, FieldHook } from "payload";

/** Turn a string into a URL-safe slug. */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/**
 * Slug immutability hook.
 *
 * A published document's slug is its accumulated SEO equity and the
 * canonical URL every external link points at. Changing it silently
 * de-ranks the page and 404s every inbound link. So:
 *   - auto-generate from `sourceField` only while empty,
 *   - once the doc is published, REFUSE a slug change unless the
 *     editor sets `allowSlugChange: true` (which should always be paired
 *     with a Redirects entry old -> new).
 */
const buildSlugHook =
  (sourceField: string): FieldHook =>
  ({ value, data, originalDoc, operation }) => {
    // On create or when explicitly cleared, derive from the source field.
    if ((!value || value === "") && data?.[sourceField]) {
      return slugify(data[sourceField] as string);
    }

    const wasPublished = originalDoc?._status === "published";
    const slugChanged =
      originalDoc?.slug && value && value !== originalDoc.slug;

    if (
      operation === "update" &&
      wasPublished &&
      slugChanged &&
      !data?.allowSlugChange
    ) {
      throw new Error(
        `Refusing to change the slug of a published document ` +
          `("${originalDoc.slug}" -> "${value}"). A slug change de-ranks the ` +
          `page and 404s every external link. To proceed deliberately, set ` +
          `allowSlugChange=true AND add a 308 redirect in the Redirects collection.`,
      );
    }

    return value ? slugify(value as string) : value;
  };

export interface SlugFieldOptions {
  /** Field whose value seeds the slug when empty (default: "title"). */
  sourceField?: string;
}

/** Reusable slug field: localized, indexed, immutable-once-published. */
export const slugField = (opts: SlugFieldOptions = {}): Field => {
  const sourceField = opts.sourceField ?? "title";
  return {
    name: "slug",
    type: "text",
    required: true,
    unique: true,
    index: true,
    localized: true,
    admin: {
      position: "sidebar",
      description:
        "Canonical URL segment. Do not change after publishing without adding a redirect.",
    },
    hooks: {
      beforeValidate: [buildSlugHook(sourceField)],
    },
  };
};

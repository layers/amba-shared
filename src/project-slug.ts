/**
 * Canonical project-slug regex.
 *
 * Shape:
 *   - lowercase ASCII letter or digit (start)
 *   - lowercase ASCII letters, digits, hyphens (interior)
 *   - 2-63 chars (DNS label cap is 63)
 *
 * Anchored with `^` + `$`. Callers extracting from Host headers should
 * pre-strip the subdomain and lowercase the input.
 */
export const PROJECT_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}$/;

/**
 * Returns true iff `slug` matches the canonical shape.
 */
export function isValidProjectSlug(slug: string): boolean {
  return typeof slug === 'string' && PROJECT_SLUG_PATTERN.test(slug);
}

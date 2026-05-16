/**
 * slugify.ts
 *
 * URL slug generation utility. Converts human-readable titles into URL-safe
 * path segments for SEO-friendly routing (e.g., "The Dark Knight" → "the-dark-knight").
 */

/**
 * Generates a URL-safe slug from a title string.
 *
 * @param text - The human-readable title to slugify (e.g., movie/TV show name)
 * @returns A lowercase, hyphen-separated URL-safe string, or 'details' if input is empty
 *
 * @example
 * generateSlug('The Dark Knight')    // 'the-dark-knight'
 * generateSlug('Spider-Man: No Way Home') // 'spider-man-no-way-home'
 * generateSlug(null)                 // 'details'
 */
export function generateSlug(text: string | undefined | null): string {
  if (!text) return 'details';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

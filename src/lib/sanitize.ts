/**
 * sanitize.ts
 *
 * Utility functions for cleaning user input to prevent Cross-Site Scripting (XSS)
 * and injection attacks before processing, storing, or displaying data.
 *
 * Note: Performs basic regex-based stripping. For extremely high-security contexts,
 * consider a dedicated library like DOMPurify.
 */
// src/lib/sanitize.ts

/**
 * Sanitize generic user input — strip HTML tags, script attempts, and dangerous characters.
 * Use for: display names, comments, free-text fields.
 * 
 * @param input - Raw user input string
 * @returns Sanitized string with HTML and scripts removed, capped at 500 characters
 * 
 * @example
 * const safe = sanitizeInput("<script>alert('xss')</script>Hello");
 * // safe === "Hello"
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .slice(0, 500);
}

/**
 * Sanitize search query — preserves spaces and basic punctuation but blocks injection patterns.
 * Use for: TMDB/OMDb search inputs, filter inputs.
 * 
 * @param query - The raw search query string from the user
 * @returns Sanitized query string safe for API requests, capped at 100 characters
 * 
 * @example
 * const safeQuery = sanitizeSearchQuery("Batman '; DROP TABLE users;--");
 * // safeQuery === "Batman  DROP TABLE users--"
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return '';
  return query
    .trim()
    .replace(/[<>'"`;\\]/g, '')
    .replace(/javascript:/gi, '')
    .slice(0, 100);
}

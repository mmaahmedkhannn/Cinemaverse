// src/lib/sanitize.ts

/**
 * Sanitize generic user input — strip HTML tags, script attempts, and dangerous characters.
 * Use for: display names, comments, free-text fields.
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
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return '';
  return query
    .trim()
    .replace(/[<>'"`;\\]/g, '')
    .replace(/javascript:/gi, '')
    .slice(0, 100);
}

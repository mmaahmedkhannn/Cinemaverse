/**
 * Basic universal sanitizer to strip HTML tags from strings
 * Prevents basic XSS if a user's input is somehow echoed back directly.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Replace anything that looks like an HTML tag
  let sanitized = input.replace(/<\/?[^>]+(>|$)/g, "");

  // Prevent javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  // Trim spaces
  return sanitized.trim();
};

/**
 * Splits a dot-separated string into an array of trimmed, non-empty items.
 * Useful for rendering bullet lists from descriptions, ingredients, tags, etc.
 *
 * @param text - The text to split (e.g., "apple. banana. orange")
 * @returns Array of trimmed items with empty strings removed
 *
 * @example
 * splitTextToBulletItems("4 huevos revueltos. cebolla. cilantro. chile dulce")
 * // Returns: ["4 huevos revueltos", "cebolla", "cilantro", "chile dulce"]
 */
export function splitTextToBulletItems(text: string | undefined | null): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  return text
    .split('.')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

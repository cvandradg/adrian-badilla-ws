// ─── Catalog types ────────────────────────────────────────────────────────────

export interface CatalogItem<T extends string = string> {
  id: T;
  label: string;
}

/**
 * Looks up the Spanish label for a given ID in a catalog.
 * Falls back to the raw ID if not found (defensive).
 */
export function labelById<T extends string>(
  catalog: CatalogItem<T>[],
  id: string
): string {
  return catalog.find((c) => c.id === id)?.label ?? id;
}

/**
 * Maps an array of IDs to their Spanish labels, joined by a separator.
 */
export function labelsById<T extends string>(
  catalog: CatalogItem<T>[],
  ids: string[],
  separator = ', '
): string {
  return ids.map((id) => labelById(catalog, id)).join(separator);
}

/**
 * Converts a catalog array to the { label, value } shape expected by PrimeNG
 * selects, using the catalog's id as value.
 */
export function toPrimeOptions<T extends string>(
  catalog: CatalogItem<T>[]
): { label: string; value: T }[] {
  return catalog.map(({ id, label }) => ({ label, value: id }));
}

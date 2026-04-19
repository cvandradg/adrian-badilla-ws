const SEARCH_NORMALIZATION_REGEX = /[\u0300-\u036f]/g;

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  const day = result.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + mondayOffset);
  return result;
}

export function endOfWeek(date: Date): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  return endOfDay(result);
}

export function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(SEARCH_NORMALIZATION_REGEX, '')
    .toLowerCase()
    .trim();
}

export function capitalizeLabel(value: string): string {
  if (!value.length) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

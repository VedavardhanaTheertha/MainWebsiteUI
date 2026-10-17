interface FilterableSeva {
  amount: number;
  category: { code: string };
  deity: Record<string, string>;
}

export function filterAndSortSevas<T extends FilterableSeva>(
  sevas: readonly T[],
  category: string,
  deity: string,
  minimum: string,
  maximum: string,
  order: string,
  defaultLanguage: string,
) {
  const min = minimum.trim() ? Number(minimum) : null;
  const max = maximum.trim() ? Number(maximum) : null;
  const filtered = sevas.filter((seva) =>
    (!category || seva.category.code === category) &&
    (!deity || seva.deity[defaultLanguage] === deity) &&
    (min === null || seva.amount >= min) &&
    (max === null || seva.amount <= max));
  if (order === "ascending" || order === "descending") {
    filtered.sort((left, right) => (left.amount - right.amount) * (order === "ascending" ? 1 : -1));
  }
  return filtered;
}

export function formatArticleDate(iso: string, lang: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(lang, {
      day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    }).format(parsed);
  } catch {
    return iso;
  }
}

export async function copyReaderLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

export function matchesBhaktiFilter(
  item: { kruti: string; ankita: string; compositionType?: string },
  composer: string,
  ankita: string,
  compositionType: string,
): boolean {
  return (!composer || item.kruti === composer) &&
    (!ankita || item.ankita === ankita) &&
    (!compositionType || item.compositionType === compositionType);
}

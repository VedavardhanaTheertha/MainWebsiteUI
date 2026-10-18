export function resolveHeroTitles(hero, codes, defaultLanguage, source = "hero") {
  const authored = hero.titles ?? {};
  if (!authored || typeof authored !== "object" || Array.isArray(authored)) {
    throw new Error(`${source}: titles must be a language map.`);
  }
  const fallback = authored[defaultLanguage] ?? hero[`title_${defaultLanguage}`];
  if (typeof fallback !== "string" || !fallback.trim()) {
    throw new Error(`${source}: requires a title for configured default language ${defaultLanguage}.`);
  }
  return Object.fromEntries(codes.map((code) => {
    const title = authored[code] ?? hero[`title_${code}`] ?? fallback;
    if (typeof title !== "string" || !title.trim()) throw new Error(`${source}: invalid title for ${code}.`);
    return [code, title];
  }));
}

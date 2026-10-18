export interface AnnouncementSettings {
  enabled: boolean;
  delayMs: number;
  pages: string[];
  startsOn: string | null;
  endsOn: string | null;
  dismissal: "session" | "persistent" | "none";
}

export function announcementMatchesPage(settings: AnnouncementSettings, pathname: string) {
  const normalize = (value: string) => value.replace(/\/+$/, "") || "/";
  return settings.enabled && (
    settings.pages.length === 0 || settings.pages.some((page) => normalize(page) === normalize(pathname))
  );
}

export function announcementWindow(settings: AnnouncementSettings) {
  return {
    startsAt: settings.startsOn === null ? -Infinity : Date.parse(settings.startsOn),
    endsAt: settings.endsOn === null ? Infinity : Date.parse(settings.endsOn) + 86400000,
  };
}

export function selectUpcomingEvents<T extends { startDate: string; endDate?: string }>(
  events: readonly T[],
  settings: { lookAheadDays: number; maxCards: number },
  now = new Date(),
) {
  const today = now.toISOString().slice(0, 10);
  const limit = new Date(now.getTime() + settings.lookAheadDays * 86400000).toISOString().slice(0, 10);
  return events
    .filter((event) => event.startDate <= limit && (event.endDate || event.startDate) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, settings.maxCards);
}

export function applySectionPresentation<T extends { href: string; image: string }>(
  items: readonly T[],
  sections: readonly { route: string; order: number; image: string }[],
): T[] {
  const byRoute = new Map(sections.map((section) => [section.route, section]));
  const configured = items
    .flatMap((item) => {
      const section = byRoute.get(item.href);
      return section ? [{ item: { ...item, image: section.image }, order: section.order }] : [];
    })
    .sort((a, b) => a.order - b.order);
  let index = 0;
  // Non-registry destinations retain their existing slots and content-owned images.
  return items.map((item) => byRoute.has(item.href) ? configured[index++].item : item);
}

export type EventSortOrder = "earliest" | "latest";

interface EventDateTime {
  slug: string;
  startDate: string;
  startTime?: string;
}

function startDay(event: EventDateTime): number | null {
  const value = event.startDate;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value) {
    console.warn(`[events] Cannot sort "${event.slug}" by invalid startDate: "${value}". Placing it last.`);
    return null;
  }
  return timestamp;
}

function startSeconds(event: EventDateTime): number | null {
  const value = event.startTime?.trim();
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] ?? 0);
    const period = match[4]?.toUpperCase();
    if (minutes < 60 && seconds < 60 &&
      (period ? hours >= 1 && hours <= 12 : hours < 24)) {
      if (period) hours = hours % 12 + (period === "PM" ? 12 : 0);
      return hours * 3600 + minutes * 60 + seconds;
    }
  }
  console.warn(`[events] Cannot sort "${event.slug}" by invalid startTime: "${value}". Leaving its time unspecified.`);
  return null;
}

export function sortEventsByDateTime<T extends EventDateTime>(
  events: readonly T[],
  order: EventSortOrder,
): T[] {
  const direction = order === "earliest" ? 1 : -1;
  return events
    .map((event, index) => ({ event, index, day: startDay(event), seconds: startSeconds(event) }))
    .sort((left, right) => {
      if (left.day === null || right.day === null) {
        return left.day === right.day ? left.index - right.index : left.day === null ? 1 : -1;
      }
      if (left.day !== right.day) return direction * (left.day - right.day);
      if (left.seconds === null || right.seconds === null) {
        return left.seconds === right.seconds ? left.index - right.index : left.seconds === null ? 1 : -1;
      }
      return direction * (left.seconds - right.seconds) || left.index - right.index;
    })
    .map(({ event }) => event);
}

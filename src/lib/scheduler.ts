/**
 * Carousel content scheduler — implements the SRS section 2.1/2.2 selection
 * rules for date-driven content buckets:
 *   1. An item explicitly pinned to today's date wins outright.
 *   2. Otherwise, evergreen items (no launch/end date) are always eligible.
 *   3. Otherwise, an item is eligible while today falls within its
 *      launch_date/end_date window.
 *   4. If fewer than `min` items are eligible, pad the result with a
 *      deterministic (seeded, not Math.random) pick from the remaining pool
 *      so the carousel never falls below its required minimum.
 *
 * Deterministic per day: the same `today` value always produces the same
 * selection/order, which keeps this testable and avoids layout shift between
 * a server-rendered page and its hydration.
 */

export interface SchedulableItem {
  pinned_date: string | null;
  launch_date: string | null;
  end_date: string | null;
}

interface SelectActiveItemsOptions {
  min: number;
  max?: number;
  /** ISO date string (YYYY-MM-DD), defaults to today in local time. */
  today?: string;
}

function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isPinnedToday(item: SchedulableItem, today: string): boolean {
  return item.pinned_date === today;
}

function isEvergreen(item: SchedulableItem): boolean {
  return item.launch_date === null && item.end_date === null;
}

function isInDateWindow(item: SchedulableItem, today: string): boolean {
  if (item.launch_date === null && item.end_date === null) return false;
  const afterLaunch = item.launch_date === null || today >= item.launch_date;
  const beforeEnd = item.end_date === null || today <= item.end_date;
  return afterLaunch && beforeEnd;
}

/** Small deterministic PRNG (mulberry32) seeded from a string, so "random"
 * padding is stable for a given day rather than reshuffling on every render. */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const rand = seededRandom(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectActiveItems<T extends SchedulableItem>(
  items: T[],
  options: SelectActiveItemsOptions
): T[] {
  const { min, max, today = todayIso() } = options;

  const pinned = items.filter((item) => isPinnedToday(item, today));
  const evergreen = items.filter(
    (item) => !isPinnedToday(item, today) && isEvergreen(item)
  );
  const dated = items.filter(
    (item) =>
      !isPinnedToday(item, today) &&
      !isEvergreen(item) &&
      isInDateWindow(item, today)
  );

  let active = [...pinned, ...evergreen, ...dated];

  if (active.length < min) {
    const chosen = new Set(active);
    const remaining = items.filter((item) => !chosen.has(item));
    const padding = seededShuffle(remaining, today);
    for (const item of padding) {
      if (active.length >= min) break;
      active.push(item);
    }
  }

  if (typeof max === "number" && active.length > max) {
    active = active.slice(0, max);
  }

  return active;
}

// Client-side "which carousel items are active today" logic — SRS section 2.1/2.2:
// prefer an item explicitly pinned to today, then any item whose launch/end date
// window includes today (or that carries no dates at all, i.e. evergreen), and if
// that still leaves fewer than the bucket's minimum, pad with additional items so
// the carousel never drops below its configured floor.
//
// Selection uses a deterministic seeded shuffle (not Math.random()) keyed on the
// date, so a static-export build and a later client hydration on the same day
// resolve to the same order — avoiding SSR/CSR hydration mismatches.

export interface Schedulable {
  id: string;
  launch_date?: string | null;
  end_date?: string | null;
  pinned_date?: string | null;
}

interface SelectOptions {
  min: number;
  max: number;
  today?: Date;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isDated(item: Schedulable): boolean {
  return Boolean(item.launch_date || item.end_date);
}

function inRange(item: Schedulable, todayStr: string): boolean {
  if (item.launch_date && todayStr < item.launch_date) return false;
  if (item.end_date && todayStr > item.end_date) return false;
  return true;
}

// Small deterministic string hash (djb2) — good enough for a stable shuffle seed.
function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return h >>> 0;
}

function seededShuffle<T extends Schedulable>(items: readonly T[], seed: string): T[] {
  return [...items]
    .map((item) => ({ item, sortKey: hash(seed + item.id) }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((x) => x.item);
}

export function selectActiveItems<T extends Schedulable>(
  items: readonly T[],
  { min, max, today = new Date() }: SelectOptions
): T[] {
  const todayStr = toDateStr(today);

  const pinned = items.filter((i) => i.pinned_date === todayStr);
  const evergreen = items.filter((i) => !isDated(i) && i.pinned_date !== todayStr);
  const activeDated = items.filter(
    (i) => isDated(i) && i.pinned_date !== todayStr && inRange(i, todayStr)
  );

  const seenIds = new Set<string>();
  const active: T[] = [];
  for (const group of [pinned, evergreen, activeDated]) {
    for (const item of group) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        active.push(item);
      }
    }
  }

  let result = active;
  if (result.length > max) {
    result = result.slice(0, max);
  }
  if (result.length < min) {
    const remaining = items.filter((i) => !seenIds.has(i.id));
    for (const item of seededShuffle(remaining, todayStr)) {
      if (result.length >= min) break;
      result.push(item);
    }
  }
  return result;
}

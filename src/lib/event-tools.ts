interface CalendarEvent {
  slug: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

export function validEventDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function calendarTime(value?: string) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const period = match[4]?.toUpperCase();
  if (Number(match[2]) > 59 || Number(match[3] ?? 0) > 59 ||
    (period ? hour < 1 || hour > 12 : hour > 23)) return null;
  if (period) hour = hour % 12 + (period === "PM" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}${match[2]}${match[3] ?? "00"}`;
}

export function matchesEventDates(
  event: Pick<CalendarEvent, "startDate" | "endDate">,
  from: string,
  to: string,
  month: string,
) {
  if (from && to && from > to) return false;
  if (!validEventDate(event.startDate)) return !from && !to && !month;
  const end = validEventDate(event.endDate) && event.endDate >= event.startDate ? event.endDate : event.startDate;
  if (from && end < from || to && event.startDate > to) return false;
  if (month) {
    const start = `${month}-01`;
    const date = new Date(`${start}T00:00:00Z`);
    if (!Number.isFinite(date.getTime())) return false;
    date.setUTCMonth(date.getUTCMonth() + 1);
    if (end < start || event.startDate >= date.toISOString().slice(0, 10)) return false;
  }
  return true;
}

const escapeCalendar = (value: string) => value.replace(/\\/g, "\\\\")
  .replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");

export function createEventCalendar(
  event: CalendarEvent,
  title: string,
  description: string,
  location: string,
  url: string,
): string | null {
  if (!validEventDate(event.startDate)) return null;
  const endDate = validEventDate(event.endDate) && event.endDate >= event.startDate ? event.endDate : event.startDate;
  const startTime = calendarTime(event.startTime);
  const endTime = calendarTime(event.endTime);
  const timed = startTime && (!event.endTime || endTime) &&
    (!endTime || `${endDate}${endTime}` >= `${event.startDate}${startTime}`);
  const compact = (date: string) => date.replaceAll("-", "");
  const dates: string[] = [];
  if (timed) {
    const utc = (date: string, time: string) => new Date(
      `${date}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4)}+05:30`,
    ).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    dates.push(`DTSTART:${utc(event.startDate, startTime)}`);
    if (endTime) dates.push(`DTEND:${utc(endDate, endTime)}`);
  } else {
    const exclusiveEnd = new Date(`${endDate}T00:00:00Z`);
    exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
    dates.push(`DTSTART;VALUE=DATE:${compact(event.startDate)}`,
      `DTEND;VALUE=DATE:${compact(exclusiveEnd.toISOString().slice(0, 10))}`);
  }
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Website//Events//EN",
    "BEGIN:VEVENT", `UID:${escapeCalendar(url)}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    ...dates, `SUMMARY:${escapeCalendar(title)}`, `DESCRIPTION:${escapeCalendar(description)}`,
    `LOCATION:${escapeCalendar(location)}`, `URL:${escapeCalendar(url)}`,
    "END:VEVENT", "END:VCALENDAR",
  ];
  // RFC 5545 folds content lines at 75 UTF-8 octets, not 75 characters.
  return lines.map((line) => {
    let result = "";
    let bytes = 0;
    for (const character of line) {
      const size = new TextEncoder().encode(character).length;
      if (bytes + size > 75) { result += "\r\n "; bytes = 1; }
      result += character;
      bytes += size;
    }
    return result;
  }).join("\r\n") + "\r\n";
}

export function eventDetailUrl(href: string, slug: string, pathname?: string) {
  const url = new URL(href);
  if (pathname) url.pathname = pathname;
  url.hash = "";
  url.searchParams.set("event", slug);
  return url.toString();
}

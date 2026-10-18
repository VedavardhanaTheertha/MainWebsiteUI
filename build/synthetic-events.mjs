import { readFile } from "node:fs/promises";
import path from "node:path";

const DAY_MS = 86400000;
const MONTHS = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  kn: [
    "ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್",
    "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್",
  ],
};

function objectWithKeys(value, keys, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`synthetic_events.${field} must be an object`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) throw new Error(`Unknown synthetic_events.${field}.${key}`);
  }
}

export function parseSyntheticEventsSettings(value) {
  objectWithKeys(value, ["enabled", "maxEvents", "dateShift"], "settings");
  const enabled = Object.hasOwn(value, "enabled") ? value.enabled : true;
  const maxEvents = Object.hasOwn(value, "maxEvents") ? value.maxEvents : null;
  if (typeof enabled !== "boolean") throw new Error("synthetic_events.enabled must be a boolean");
  if (maxEvents !== null && (!Number.isSafeInteger(maxEvents) || maxEvents < 0)) {
    throw new Error("synthetic_events.maxEvents must be null or a nonnegative safe integer");
  }
  const shift = Object.hasOwn(value, "dateShift") ? value.dateShift : {};
  objectWithKeys(shift, ["policy", "offsetDays"], "dateShift");
  const policy = Object.hasOwn(shift, "policy") ? shift.policy : "earliest-to-today";
  if (!["earliest-to-today", "fixed-offset"].includes(policy)) {
    throw new Error("synthetic_events.dateShift.policy must be earliest-to-today or fixed-offset");
  }
  if (policy === "fixed-offset") {
    if (!Number.isSafeInteger(shift.offsetDays)) {
      throw new Error("synthetic_events.dateShift.offsetDays must be a safe integer for fixed-offset");
    }
    return { enabled, maxEvents, dateShift: { policy, offsetDays: shift.offsetDays } };
  }
  if (Object.hasOwn(shift, "offsetDays")) {
    throw new Error("synthetic_events.dateShift.offsetDays is only allowed for fixed-offset");
  }
  return { enabled, maxEvents, dateShift: { policy } };
}

function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const milliseconds = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString().slice(0, 10) === value
    ? milliseconds : NaN;
}

function shiftDate(date, days) {
  const shifted = new Date(parseDate(date) + days * DAY_MS);
  if (!Number.isFinite(shifted.getTime()) || shifted.getUTCFullYear() < 0 || shifted.getUTCFullYear() > 9999) {
    throw new Error("synthetic_events.dateShift produces a date outside years 0000–9999");
  }
  return shifted.toISOString().slice(0, 10);
}

function displayDate(start, end, language) {
  const single = (date) => {
    const [year, month, day] = date.split("-").map(Number);
    return `${day} ${MONTHS[language][month - 1]} ${year}`;
  };
  return start === end ? single(start) : `${single(start)} - ${single(end)}`;
}

export function buildSyntheticEventDates(events, rawSettings, today, { warn = console.warn } = {}) {
  const settings = parseSyntheticEventsSettings(rawSettings);
  if (!settings.enabled || settings.maxEvents === 0) return [];
  if (!Number.isFinite(parseDate(today))) throw new Error("synthetic_events today must be a valid UTC ISO date");
  // Existing sources may contain malformed dates; never turn those into NaN dates.
  const eligible = events.filter((event) => {
    if (!event.startDate && !event.endDate) return false;
    const endDate = event.endDate || event.startDate;
    if (!Number.isFinite(parseDate(event.startDate)) || !Number.isFinite(parseDate(endDate)) ||
      endDate < event.startDate) {
      warn(`[events] Skipping synthetic duplicate for ${event.slug}.md ` +
        `(invalid date range: start_date=${JSON.stringify(event.startDate)}, ` +
        `end_date=${JSON.stringify(event.endDate)})`);
      return false;
    }
    return endDate < today;
  });
  if (eligible.length === 0) return [];
  const earliest = eligible.reduce((date, event) => event.startDate < date ? event.startDate : date,
    eligible[0].startDate);
  const days = settings.dateShift.policy === "fixed-offset"
    ? settings.dateShift.offsetDays : (parseDate(today) - parseDate(earliest)) / DAY_MS;
  // Catalog order is sorted source filename order; apply caps without changing it.
  return eligible.slice(0, settings.maxEvents ?? eligible.length).map((event) => {
    const startDate = shiftDate(event.startDate, days);
    const endDate = shiftDate(event.endDate || event.startDate, days);
    return {
      event, startDate, endDate,
      displayDate: {
        en: displayDate(startDate, endDate, "en"),
        kn: displayDate(startDate, endDate, "kn"),
      },
    };
  });
}

export async function generateSyntheticEventDates(events, {
  envName, rootDir, today = new Date().toISOString().slice(0, 10), readConfig = readFile,
}) {
  // Gate before touching either settings or event data, including malformed input.
  if (envName !== "dev" && envName !== "local") return [];
  const filename = path.join(rootDir, "settings", "dev", "synthetic_events.json");
  let settings;
  try {
    settings = JSON.parse(await readConfig(filename, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read synthetic event settings at ${filename}: ${error.message}`, { cause: error });
  }
  return buildSyntheticEventDates(events, settings, today);
}

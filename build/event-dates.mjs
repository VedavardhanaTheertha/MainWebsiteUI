import yaml from "js-yaml";
import { parseMarkdownFrontmatter } from "./content-utils.mjs";

export function parseEventSource(markdown, source) {
  // Preserve unquoted dates as strings so invalid calendar days cannot roll over.
  const { metadata, body } = parseMarkdownFrontmatter(markdown, source, { schema: yaml.JSON_SCHEMA });
  return { metadata: normalizeEventDates(metadata, source), body };
}

export function normalizeEventDate(value, field, source) {
  if (value === undefined || value === null || value === "") return "";
  const text = value instanceof Date
    ? Number.isFinite(value.getTime()) ? value.toISOString().replace(/T00:00:00\.000Z$/, "") : ""
    : value;
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`${source}: ${field} must be an ISO calendar date (YYYY-MM-DD).`);
  }
  const parsed = new Date(`${text}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw new Error(`${source}: ${field} is not a valid calendar date.`);
  }
  return text;
}

export function normalizeEventDates(metadata, source) {
  const startDate = normalizeEventDate(metadata.start_date, "start_date", source);
  const endDate = normalizeEventDate(metadata.end_date, "end_date", source) || startDate;
  if (endDate && !startDate) throw new Error(`${source}: end_date requires start_date.`);
  if (endDate < startDate) throw new Error(`${source}: end_date must not precede start_date.`);
  return { ...metadata, start_date: startDate, end_date: endDate };
}

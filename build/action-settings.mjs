import { readFileSync } from "node:fs";

const actionNames = ["headerWhatsApp", "subscribe", "donationEmail", "payment", "volunteer", "yajna"];
const source = "settings/public_actions.json";

function requireDestination(value, action) {
  if (typeof value !== "string" || !value || value !== value.trim() || /[\s\\]/u.test(value) ||
    /%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) {
    throw new Error(`${source} ${action} must resolve to a valid public URL.`);
  }
  let url;
  try {
    url = new URL(value);
  } catch (cause) {
    throw new Error(`${source} ${action} is not a valid URL.`, { cause });
  }
  if (url.username || url.password) throw new Error(`${source} ${action} must not contain credentials.`);
  if (action === "donationEmail") {
    if (url.protocol !== "mailto:" || !/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.pathname) ||
      url.search || url.hash) {
      throw new Error(`${source} ${action} requires a single mailto address without query parameters.`);
    }
  } else if (url.protocol !== "https:") {
    throw new Error(`${source} ${action} requires HTTPS.`);
  }
  return value;
}

export function parseActionSettings(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${source} must define an object.`);
  }
  for (const key of Object.keys(parsed)) {
    if (!actionNames.includes(key)) throw new Error(`${source} contains unknown action "${key}".`);
  }
  return Object.fromEntries(actionNames.map((action) => {
    const entry = parsed[action];
    if (!entry || typeof entry !== "object" || Array.isArray(entry) ||
      Object.keys(entry).length !== 1 ||
      (!Object.hasOwn(entry, "connectId") && !Object.hasOwn(entry, "url"))) {
      throw new Error(`${source} ${action} must define exactly one connectId or url.`);
    }
    if (Object.hasOwn(entry, "url")) return [action, { url: requireDestination(entry.url, action) }];
    if (typeof entry.connectId !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.connectId)) {
      throw new Error(`${source} ${action}.connectId must be a valid connection ID.`);
    }
    return [action, { connectId: entry.connectId }];
  }));
}

export function resolveActionSettings(settings, connectLinks) {
  return Object.fromEntries(Object.entries(parseActionSettings(settings)).map(([action, entry]) => {
    if (entry.url) return [action, entry.url];
    const link = connectLinks.find((record) => record.id === entry.connectId);
    if (!link) throw new Error(`${source} ${action} references unknown connectId "${entry.connectId}".`);
    return [action, requireDestination(link.url, action)];
  }));
}

export function loadActionSettings() {
  return parseActionSettings(JSON.parse(readFileSync(new URL("../settings/public_actions.json", import.meta.url), "utf8")));
}

export function validateActionCopy(copy, sourceName) {
  const fields = [
    "whatsapp_label", "subscribe_label", "donate_label", "donate_tooltip", "volunteer_label",
    "send_email", "donation_note",
    "donation_email_message", "donation_email_subject", "payment_label", "whatsapp_channel",
  ];
  for (const field of fields) {
    if (typeof copy?.[field] !== "string" || !copy[field].trim()) {
      throw new Error(`${sourceName} public_actions.${field} must be a non-empty string.`);
    }
    const allowed = field === "donation_note" ? ["note"] : ["material", "name", "phone", "note"];
    if (field.startsWith("donation_")) {
      for (const match of copy[field].matchAll(/\{(\w+)\}/g)) {
        if (!allowed.includes(match[1])) {
          throw new Error(`${sourceName} public_actions.${field} contains unknown placeholder "${match[1]}".`);
        }
      }
    }
  }
}

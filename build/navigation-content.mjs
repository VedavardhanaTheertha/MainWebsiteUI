import { readFileSync } from "node:fs";
import path from "node:path";

const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
function internalRoute(value, source) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\s]/.test(value)) {
    throw new Error(`${source}: expected a site-relative route.`);
  }
  return value;
}

export function loadNavigation(rootDir) {
  const source = "settings/navigation.json";
  const settings = JSON.parse(readFileSync(path.join(rootDir, source), "utf8"));
  if (!object(settings) || !object(settings.footer) || !object(settings.routes)) {
    throw new Error(`${source}: menu, footer and routes are required.`);
  }
  if (Object.keys(settings).some((key) => !["menu", "footer", "routes"].includes(key)) ||
      Object.keys(settings.footer).some((key) => !["policies", "social"].includes(key)) ||
      Object.keys(settings.routes).some((key) => !["home", "panchanga", "announcement"].includes(key))) {
    throw new Error(`${source}: unknown navigation setting.`);
  }
  function entries(value, name, social = false) {
    if (!Array.isArray(value) || !value.length) throw new Error(`${source}: ${name} must be a non-empty list.`);
    const keys = new Set();
    for (const entry of value) {
      if (!object(entry) || typeof entry.key !== "string" || !/^[a-z][a-z0-9_-]*$/.test(entry.key) ||
          keys.has(entry.key)) throw new Error(`${source}: ${name} needs unique valid keys.`);
      keys.add(entry.key);
      const allowed = social ? ["key", "connectId"] : ["key", "href", "children"];
      if (Object.keys(entry).some((key) => !allowed.includes(key))) throw new Error(`${source}: unknown ${name} entry field.`);
      if (social) {
        if (typeof entry.connectId !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.connectId)) {
          throw new Error(`${source}: ${name} requires a valid connection ID.`);
        }
      } else {
        internalRoute(entry.href, `${source} ${name}.${entry.key}`);
        if (entry.children !== undefined) entries(entry.children, `${name}.${entry.key}.children`);
      }
    }
  }
  entries(settings.menu, "menu");
  entries(settings.footer.policies, "footer.policies");
  entries(settings.footer.social, "footer.social", true);
  for (const key of ["home", "panchanga", "announcement"]) internalRoute(settings.routes[key], `${source} routes.${key}`);
  return settings;
}

export function applyNavigation(content, settings) {
  function labelled(entries, labels, source) {
    if (!object(labels)) throw new Error(`${source}: translated labels must be keyed by navigation ID.`);
    return entries.map(({ key, children, ...configuration }) => {
      const translation = labels[key];
      if (!object(translation) || typeof translation.label !== "string" || !translation.label.trim() ||
          Object.keys(translation).some((field) => !["label", "children"].includes(field))) {
        throw new Error(`${source}.${key}: needs a label only; destinations and ordering belong in settings/navigation.json.`);
      }
      return {
        ...(source === "nav" || source.startsWith("nav.") ? { key } : {}),
        label: translation.label,
        ...configuration,
        ...(children ? { children: labelled(children, translation.children, `${source}.${key}.children`) } : {}),
      };
    });
  }
  return {
    ...content,
    ...(content.nav === undefined ? {} : { nav: labelled(settings.menu, content.nav, "nav") }),
    footer: {
      ...content.footer,
      ...(content.footer?.policies === undefined ? {} : {
        policies: labelled(settings.footer.policies, content.footer.policies, "footer.policies"),
      }),
      ...(content.footer?.social === undefined ? {} : {
        social: labelled(settings.footer.social, content.footer.social, "footer.social"),
      }),
    },
    announcement: { ...content.announcement, href: settings.routes.announcement },
  };
}

export const developerOptionsRoute = "/developer-options";
export const imageTreatmentStorageKey = "site-image-treatment";
export const headerActionsStorageKey = "site-header-actions";
export const topSubscribeStorageKey = "site-top-subscribe";
export const uiSettingsStorageKey = "site-ui-settings";

export function developerOptionsForEnvironment(environment) {
  return {
    enabled: environment === "local" || environment === "dev",
    route: developerOptionsRoute,
    imageStorageKey: imageTreatmentStorageKey,
    headerActionsStorageKey,
    topSubscribeStorageKey,
    uiSettingsStorageKey,
  };
}

export function pageExtensionsForEnvironment(environment) {
  return [
    "tsx", "ts", "jsx", "js",
    ...(developerOptionsForEnvironment(environment).enabled ? ["preview.tsx"] : []),
  ];
}

export function appendDeveloperNavigation(content, options) {
  if (!options.enabled) return content;
  const label = content.developer_options?.menu_label;
  if (typeof label !== "string" || !label.trim()) {
    throw new Error("developer_options.menu_label must be a non-empty localized label.");
  }
  if (!Array.isArray(content.nav) || content.nav.some((item) => item.href === options.route || item.key === "developer-options")) {
    throw new Error("The developer-options menu entry is generated and must not be configured separately.");
  }
  return {
    ...content,
    nav: [...content.nav, { key: "developer-options", label, href: options.route }],
  };
}

export function validateDeveloperOptionsOutput(environment, exportedRoutes, selectorRoutes, switchable) {
  const { enabled } = developerOptionsForEnvironment(environment);
  const problems = [];
  if (exportedRoutes.has(developerOptionsRoute) !== enabled) {
    problems.push(`Developer options ${enabled ? "is missing from" : "must not be exported in"} the ${environment} build.`);
  }
  if (enabled && switchable) {
    if (selectorRoutes.length !== 1 || selectorRoutes[0] !== developerOptionsRoute) {
      problems.push("The copy selector must appear only on the Developer options page in a switchable preview.");
    }
  } else if (selectorRoutes.length) {
    problems.push(`The copy selector must not appear in the ${environment} build.`);
  }
  return problems;
}

/**
 * Recursively strips comment keys ("$comment", "comment", or starting with "//")
 * from an object or array loaded from JSON configuration.
 *
 * @param {unknown} value
 * @returns {unknown}
 */
export function stripComments(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(stripComments);
  }
  const clean = {};
  for (const [key, val] of Object.entries(value)) {
    if (key === "$comment" || key === "comment" || key.startsWith("//")) {
      continue;
    }
    clean[key] = stripComments(val);
  }
  return clean;
}

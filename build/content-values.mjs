const preservedKeys = new Set([
  "id", "key", "code", "kind", "type", "dur", "tone", "cat", "slug", "phone", "email", "connectId", "itemIds",
  "href", "img", "bg", "icon", "symbol", "upi", "images", "gallery",
  "videoUrl", "externalUrl", "fullImage", "albumId", "recordedAt", "enrollmentUrl",
  "launch_date", "end_date", "pinned_date", "date", "img_position", "imgPosition",
  "textColor", "accent", "labelKey", "numberLocale", "yajna_progress_percent", "local_preview",
]);

export function isPreservedContentField(key, prefix = "") {
  return key.startsWith("_") || preservedKeys.has(key) ||
    (key === "duration" && prefix.startsWith("media."));
}

export function isMachineContentValue(value) {
  return value.startsWith("/") || value.startsWith("#") ||
    value.startsWith("http://") || value.startsWith("https://") ||
    value.startsWith("mailto:") || value.startsWith("tel:") ||
    /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function collectRealProse(node, out = [], prefix = "") {
  if (typeof node === "string") {
    const value = node.trim();
    if (value.length >= 30 && !isMachineContentValue(value)) out.push(value);
  } else if (Array.isArray(node)) {
    node.forEach((item, index) => collectRealProse(item, out, `${prefix}.${index}`));
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (!isPreservedContentField(key, prefix)) {
        collectRealProse(value, out, prefix ? `${prefix}.${key}` : key);
      }
    }
  }
  return out;
}

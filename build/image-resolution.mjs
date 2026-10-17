/**
 * Image-map paths are relative to the configured media directory, including
 * paths beginning with "/". Absolute targets bypass that directory entirely.
 * @param {string} target
 * @param {string} [baseUrl]
 */
export function resolveImageUrl(target, baseUrl = "") {
  if (typeof target !== "string" || !target || /[\s\\\u0000-\u001f]/u.test(target) ||
      /(?:^|\/)\.\.?(?:\/|$)|%(?:2e|2f|5c)/iu.test(target)) {
    throw new Error(`Invalid image target: ${JSON.stringify(target)}`);
  }
  if (/^https:\/\//u.test(target)) {
    const url = new URL(target);
    if (url.username || url.password || !url.hostname) {
      throw new Error(`Invalid image target: ${target}`);
    }
    return url.href;
  }
  if (/^[a-z][a-z\d+.-]*:|^\/\//iu.test(target)) {
    throw new Error(`Image targets must use HTTPS or a relative path: ${target}`);
  }
  if (!baseUrl) return `/${target.replace(/^\/+/u, "")}`;
  const base = new URL(baseUrl);
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) {
    throw new Error(`Invalid image base URL: ${baseUrl}`);
  }
  return new URL(`${base.href.replace(/\/+$/u, "")}/${target.replace(/^\/+/u, "")}`).href;
}

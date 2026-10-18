export function parseSevaImage(value, sourceName) {
  if (value == null || value === "") return "";
  if (typeof value !== "string") throw new Error(`${sourceName} image must be a URL string.`);
  const image = value.trim();
  if (!image) return "";
  if (image.startsWith("/") && !image.startsWith("//") && !image.includes("\\") &&
    !/[\u0000-\u0020]/.test(image)) return image;
  try {
    const url = new URL(image);
    if (url.protocol === "https:" && !url.username && !url.password) return image;
  } catch { /* Report invalid source metadata below. */ }
  throw new Error(`${sourceName} image must be an HTTPS URL or a root-relative path.`);
}

/**
 * Calculates the logical parent route for back navigation fallback.
 *
 * Examples:
 *   /events/mantra-yajna -> /events
 *   /library/mantra/dvadasha-stotra -> /library/mantra
 *   /history/parampara/madhwacharyaru -> /history/parampara
 *   /history/stories/annadana-as-sadhana -> /history/stories
 *   /history/parampara -> /story
 *   /history/stories -> /story
 *   /library/mantra -> /library
 *   /albums/daily-worship -> /albums
 *   /events -> /
 *   /sevas -> /
 *   / -> /
 */
export function getParentPath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const clean = pathname.replace(/\/+$/, "");
  const segments = clean.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return "/";
  }
  // History collections and lineage hub belong under the Know the Story hub (/story)
  if (segments[0] === "history" && segments.length === 2) {
    return "/story";
  }
  segments.pop();
  return "/" + segments.join("/");
}

/**
 * Checks whether the given pathname represents the home page, taking optional basePath into account.
 */
export function isHomePage(pathname: string, basePath = ""): boolean {
  if (!pathname || pathname === "/") return true;
  if (basePath) {
    const cleanBasePath = basePath.replace(/\/+$/, "");
    if (pathname === cleanBasePath || pathname === `${cleanBasePath}/`) {
      return true;
    }
  }
  return false;
}


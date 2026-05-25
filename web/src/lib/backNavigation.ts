/** Tab roots: hardware back with no history minimizes the app. */
const TAB_ROOTS = new Set([
  "/dashboard",
  "/profile",
  "/requests",
  "/community",
  "/payments",
  "/votes",
  "/messages",
]);

export function isTabRootPath(pathname: string): boolean {
  return TAB_ROOTS.has(pathname);
}

/** Fallback when browser history is empty (e.g. deep link in APK). */
export function getBackFallback(pathname: string): string | null {
  if (pathname.startsWith("/demo/")) return "/";
  if (pathname === "/help" || pathname.startsWith("/info/")) return "/profile";
  if (pathname.startsWith("/chair/")) return "/chair";
  if (/^\/votes\/[^/]+$/.test(pathname)) return "/votes";
  if (pathname === "/requests/new" || pathname === "/requests/archive") {
    return "/requests";
  }
  if (
    pathname === "/community/board/new" ||
    /^\/community\/board\/[^/]+\/edit$/.test(pathname)
  ) {
    return "/community/board";
  }
  if (pathname === "/community/forum/new") return "/community/forum";
  const forumEdit = pathname.match(/^\/community\/forum\/([^/]+)\/edit$/);
  if (forumEdit) return `/community/forum/${forumEdit[1]}`;
  if (pathname === "/messages/new") return "/messages";
  if (/^\/messages\/[^/]+$/.test(pathname)) return "/messages";
  if (pathname === "/residents") return "/community";
  if (
    pathname === "/community/documents" ||
    pathname === "/community/news" ||
    pathname === "/community/board" ||
    pathname === "/community/forum" ||
    pathname === "/community/reports"
  ) {
    return "/community";
  }
  if (pathname === "/chair") return "/profile";
  return null;
}

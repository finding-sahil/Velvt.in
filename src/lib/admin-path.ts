// VELVET — Admin Path Configuration
// Centralized helper for the non-obvious admin route prefix

const ADMIN_PREFIX = process.env.ADMIN_ROUTE_PREFIX || "/velvet-management";

/**
 * Get the admin route prefix (e.g. "/velvet-management")
 */
export function getAdminPrefix(): string {
  return ADMIN_PREFIX;
}

/**
 * Build a full admin path, e.g. adminPath("/events") => "/velvet-management/events"
 */
export function adminPath(subPath: string = ""): string {
  if (!subPath || subPath === "/") return ADMIN_PREFIX;
  const clean = subPath.startsWith("/") ? subPath : `/${subPath}`;
  return `${ADMIN_PREFIX}${clean}`;
}

/**
 * Check if a pathname is within the admin area
 */
export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

/**
 * Get the admin login path
 */
export function adminLoginPath(): string {
  return adminPath("/login");
}

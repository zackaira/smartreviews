/**
 * Allow only safe relative paths for redirects. Rejects absolute URLs (open-redirect guard).
 * A valid path starts with exactly one "/" — "//evil.com" is rejected.
 */
export function safeRelativePath(next: string | null | undefined): string {
  if (next && typeof next === "string" && /^\/(?!\/)/.test(next)) return next;
  return "/dashboard";
}

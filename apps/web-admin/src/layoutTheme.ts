/** Pure helpers for app chrome — covered by unit tests. */

export type HeaderVariant = "none" | "reporter" | "staff";

export function headerVariantFor(pathname: string, role: string | null, hasToken: boolean): HeaderVariant {
  if (!hasToken || pathname === "/login") return "none";
  if (role === "dispatcher" || role === "admin") return "staff";
  return "reporter";
}

export function layoutClassFor(pathname: string): string {
  return pathname === "/login" ? "layout layout--fullscreen" : "layout";
}

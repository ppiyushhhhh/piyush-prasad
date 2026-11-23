/**
 * Theme Management Utility — Light Mode Only
 * The portfolio is locked to a clean, professional light theme across all pages.
 */

export type Theme = "light";

export function getResolvedTheme(): "light" {
  return "light";
}

export function setTheme(_theme?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("theme");
    document.documentElement.classList.remove("dark");
  } catch (e) {}
}

export function toggleTheme(): void {
  // Theme is locked to light mode; no-op.
  setTheme("light");
}

export const THEME_INIT_SCRIPT = `(function() {
  try {
    localStorage.removeItem('theme');
    document.documentElement.classList.remove('dark');
  } catch (e) {}
})();`;


/**
 * Theme Management Utility for Teal Ops
 * Supports system default, manual light/dark toggle, and local storage persistence.
 */

export type Theme = "light" | "dark" | "system";

export function getResolvedTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;

  if (theme === "system") {
    localStorage.removeItem("theme");
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  } else {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme } }));
}

export function toggleTheme(): void {
  const current = getResolvedTheme();
  setTheme(current === "dark" ? "light" : "dark");
}

export const THEME_INIT_SCRIPT = `(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();`;

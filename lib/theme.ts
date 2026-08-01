export const THEME_STORAGE_KEY = "experiments-theme";

export const THEMES = [
  { value: "wireframe", label: "Wireframe", className: null },
  { value: "blue", label: "Blue", className: "theme-blue" },
] as const;

export type ThemeValue = (typeof THEMES)[number]["value"];

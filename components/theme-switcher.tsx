"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { THEME_STORAGE_KEY, THEMES, type ThemeValue } from "@/lib/theme";

function applyTheme(theme: ThemeValue) {
  const root = document.documentElement;
  for (const t of THEMES) {
    if (t.className) root.classList.remove(t.className);
  }
  const active = THEMES.find((t) => t.value === theme);
  if (active?.className) root.classList.add(active.className);
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeValue | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeValue | null;
    setTheme(THEMES.some((t) => t.value === stored) ? stored! : THEMES[0].value);
  }, []);

  function selectTheme(value: ThemeValue) {
    applyTheme(value);
    localStorage.setItem(THEME_STORAGE_KEY, value);
    setTheme(value);
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 rounded-md border bg-card p-1 shadow-sm">
      {THEMES.map((t) => (
        <Button
          key={t.value}
          type="button"
          size="sm"
          variant={theme === t.value ? "default" : "ghost"}
          onClick={() => selectTheme(t.value)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}

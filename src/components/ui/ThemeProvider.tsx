"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type ThemeId = "legacy" | "velvt2";

export interface ThemeOption {
  id: ThemeId;
  label: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "legacy",
    label: "Legacy",
    description: "The original VELVT experience.",
  },
  {
    id: "velvt2",
    label: "VELVT 2.0",
    description: "Refined replica: compact copy, clean hierarchy, and zero clutter.",
  },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "legacy",
  setTheme: () => {},
  themes: THEMES,
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "legacy";
  try {
    const stored = localStorage.getItem("velvt_theme");
    if (stored === "velvt2") return stored;
  } catch {}
  return "legacy";
}

function persistTheme(theme: ThemeId) {
  try {
    localStorage.setItem("velvt_theme", theme);
    // Also set cookie for SSR hydration
    document.cookie = `velvt_theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
    // Update the html attribute
    document.documentElement.setAttribute("data-theme", theme);
  } catch {}
}

export function ThemeProvider({
  children,
  initialTheme = "legacy",
}: {
  children: ReactNode;
  initialTheme?: ThemeId;
}) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored && (stored === "velvt2" || stored === "legacy")) {
      setThemeState(stored);
    } else {
      setThemeState(initialTheme);
    }
    setMounted(true);
  }, [initialTheme]);

  const setTheme = useCallback((newTheme: ThemeId) => {
    setThemeState(newTheme);
    persistTheme(newTheme);
  }, []);

  // Sync attribute on mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  return (
    <ThemeContext value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext>
  );
}

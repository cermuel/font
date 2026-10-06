"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "system" | "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "font-theme";
const THEME_EVENT = "font-theme-change";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const getTheme = (): Theme => {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system";
};

const applyTheme = (theme: Theme) => {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

const subscribe = (onStoreChange: () => void) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handlePreferenceChange = () => {
    if (getTheme() === "system") applyTheme("system");
  };
  const handleThemeChange = () => onStoreChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      applyTheme(getTheme());
      onStoreChange();
    }
  };

  mediaQuery.addEventListener("change", handlePreferenceChange);
  window.addEventListener(THEME_EVENT, handleThemeChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    mediaQuery.removeEventListener("change", handlePreferenceChange);
    window.removeEventListener(THEME_EVENT, handleThemeChange);
    window.removeEventListener("storage", handleStorage);
  };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, () => "system");
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
        window.dispatchEvent(new Event(THEME_EVENT));
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

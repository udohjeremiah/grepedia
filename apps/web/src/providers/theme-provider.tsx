import { ScriptOnce } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { createContext, type ReactNode, use, useEffect, useState } from "react";
import { z } from "zod";

// eslint-disable-next-line unicorn/prefer-top-level-await
const ThemeSchema = z.enum(["light", "dark"]).catch("light");
export type Theme = z.infer<typeof ThemeSchema>;

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return document.documentElement.dataset["theme"] === "dark"
    ? "dark"
    : "light";
};

const setStoredTheme = createClientOnlyFn(
  (storageKey: string, theme: Theme) => {
    localStorage.setItem(storageKey, theme);
  },
);

const applyTheme = createClientOnlyFn((theme: Theme) => {
  const root = document.documentElement;
  root.dataset["theme"] = theme;
});

const disableTransitions = createClientOnlyFn(() => {
  const css = document.createElement("style");
  css.textContent = `
    *:not(.not-transition-lock):not(.not-transition-lock *),
    *:not(.not-transition-lock)::before,
    *:not(.not-transition-lock)::after {
      transition: none !important;
    }
  `;
  document.head.append(css);

  return () => {
    (() => globalThis.getComputedStyle(document.body))();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        css.remove();
      });
    });
  };
});

const themeFunction = (storageKey: string) => {
  const prefersDark = globalThis.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const resolvedByPreference = prefersDark ? "dark" : "light";
  const root = document.documentElement;

  try {
    const stored = localStorage.getItem(storageKey);
    const resolved =
      stored === "dark" || stored === "light" ? stored : resolvedByPreference;
    root.dataset["theme"] = resolved;
  } catch {
    root.dataset["theme"] = resolvedByPreference;
  }
};

const themeScript = (storageKey: string) => {
  return `(${themeFunction.toString()})(${JSON.stringify(storageKey)});`;
};

type ThemeContextType = {
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  disableTransitionOnChange = true,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (globalThis.window === undefined) return "light";
    return getStoredTheme();
  });

  useEffect(() => {
    const enable = disableTransitionOnChange ? disableTransitions() : undefined;
    applyTheme(theme);
    enable?.();
  }, [disableTransitionOnChange, theme]);

  const setTheme = (newTheme: Theme) => {
    const validated = ThemeSchema.parse(newTheme);
    setThemeState(validated);
    setStoredTheme(storageKey, validated);
  };

  return (
    <ThemeContext.Provider value={{ setTheme, theme }}>
      <ScriptOnce>{themeScript(storageKey)}</ScriptOnce>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
